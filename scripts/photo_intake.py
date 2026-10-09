"""Private, reproducible photo intake. Requires Python 3.11+ and Pillow.

Commands never upload files or write to a catalogue. Keep output directories
ignored and private. Product identity, image quality and publication approval
are review decisions; this tool only records their supplied statuses.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import stat
import sys
import textwrap
import unicodedata
import warnings
import zipfile
from collections import defaultdict
from pathlib import Path, PurePosixPath

from PIL import Image, ImageCms, ImageDraw, ImageFont, ImageOps


IMAGE_SUFFIXES = {
    ".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff",
    ".bmp", ".gif", ".avif", ".heic", ".heif",
}
INERT_SUFFIXES = {".txt", ".md", ".csv", ".json"}
RESERVED = re.compile(r"^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)", re.I)
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DEFAULT_LIMITS = {
    "entries": 5000,
    "total_bytes": 5 * 1024**3,
    "file_bytes": 512 * 1024**2,
    "ratio": 1000,
}
Image.MAX_IMAGE_PIXELS = 120_000_000
warnings.simplefilter("error", Image.DecompressionBombWarning)


class IntakeError(ValueError):
    pass


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def private_path(path: Path) -> Path:
    """Refuse symlink ancestors so a private output cannot redirect elsewhere."""
    absolute = path.absolute()
    for ancestor in [absolute, *absolute.parents]:
        if ancestor.is_symlink() or (
            ancestor.exists()
            and getattr(ancestor.lstat(), "st_file_attributes", 0) & 0x400
        ):
            raise IntakeError(f"Output uses a symbolic link or junction: {ancestor}")
    # Ancestors were checked directly. Avoid Windows final-path handle queries,
    # which restricted executors may deny for otherwise readable regular files.
    return absolute


def safe_name(name: str) -> PurePosixPath:
    if not name or "\\" in name or name.startswith("/"):
        raise IntakeError(f"Unsafe archive path: {name!r}")
    parts = name.rstrip("/").split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise IntakeError(f"Unsafe archive path: {name!r}")
    for part in parts:
        if any(ord(char) < 32 for char in part) or any(char in '<>:"|?*' for char in part):
            raise IntakeError(f"Unsafe Windows filename: {name!r}")
        if part.endswith((".", " ")) or RESERVED.match(part):
            raise IntakeError(f"Unsafe Windows filename: {name!r}")
    return PurePosixPath(*parts)


def executable_signature(prefix: bytes) -> bool:
    return prefix.startswith((
        b"MZ", b"\x7fELF", b"#!", b"\xcf\xfa\xed\xfe", b"\xce\xfa\xed\xfe",
        b"\xfe\xed\xfa\xcf", b"\xfe\xed\xfa\xce", b"\xca\xfe\xba\xbe",
    ))


def inspect_archive(archive: Path, limits: dict | None = None) -> dict:
    """Validate every entry and CRC before allowing any extraction."""
    limits = {**DEFAULT_LIMITS, **(limits or {})}
    files, directories, seen, parents = [], [], {}, set()
    total = 0
    with zipfile.ZipFile(archive) as source:
        entries = source.infolist()
        if len(entries) > limits["entries"]:
            raise IntakeError("Archive exceeds the entry limit")
        for entry in entries:
            path = safe_name(entry.orig_filename)
            key = unicodedata.normalize("NFC", str(path)).casefold()
            if key in seen:
                raise IntakeError(f"Duplicate or case-colliding archive path: {entry.filename}")
            seen[key] = entry.is_dir()
            parents.update(
                unicodedata.normalize("NFC", str(parent)).casefold()
                for parent in path.parents if str(parent) != "."
            )
            mode = entry.external_attr >> 16
            kind = stat.S_IFMT(mode)
            if kind not in {0, stat.S_IFREG, stat.S_IFDIR}:
                raise IntakeError(f"Symlink or special archive entry: {entry.filename}")
            if mode & 0o111 and not entry.is_dir():
                raise IntakeError(f"Executable archive permissions: {entry.filename}")
            if entry.flag_bits & 1:
                raise IntakeError(f"Encrypted archive entry: {entry.filename}")
            if entry.is_dir():
                if entry.file_size:
                    raise IntakeError(f"Directory entry has content: {entry.filename}")
                directories.append(str(path))
                continue
            if path.suffix.lower() not in IMAGE_SUFFIXES | INERT_SUFFIXES:
                raise IntakeError(f"Unsupported or potentially active archive content: {entry.filename}")
            if entry.file_size > limits["file_bytes"]:
                raise IntakeError(f"Archive file exceeds size limit: {entry.filename}")
            total += entry.file_size
            if total > limits["total_bytes"]:
                raise IntakeError("Archive exceeds the total expansion limit")
            if entry.file_size / max(entry.compress_size, 1) > limits["ratio"]:
                raise IntakeError(f"Archive file exceeds expansion ratio limit: {entry.filename}")
            files.append((entry, path))
        if any(key in parents and not is_directory for key, is_directory in seen.items()):
            raise IntakeError("An archive file conflicts with a directory path")
        # Read to EOF to check CRC, actual byte count and executable signatures.
        # These bounded reads happen before creating any extraction destination.
        for entry, _ in files:
            count = 0
            with source.open(entry) as stream:
                prefix = stream.read(4096)
                if executable_signature(prefix):
                    raise IntakeError(f"Executable content disguised as an image: {entry.filename}")
                count += len(prefix)
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    count += len(chunk)
                    if count > entry.file_size or count > limits["file_bytes"]:
                        raise IntakeError(f"Archive content exceeds advertised size: {entry.filename}")
            if count != entry.file_size:
                raise IntakeError(f"Archive content has an unexpected size: {entry.filename}")
    return {
        "entries": len(entries),
        "file_count": len(files),
        "directories": sorted(directories),
        "expanded_bytes": total,
        "integrity": "passed",
        "path_and_content_safety": "passed",
        "limits": limits,
    }


def extract_originals(archive: Path, destination: Path) -> None:
    destination = private_path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive) as source:
        for entry in source.infolist():
            path = destination.joinpath(*safe_name(entry.orig_filename).parts)
            private_path(path)
            if entry.is_dir():
                path.mkdir(parents=True, exist_ok=True)
                continue
            path.parent.mkdir(parents=True, exist_ok=True)
            if path.exists():
                with source.open(entry) as stream:
                    digest = hashlib.sha256()
                    for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                        digest.update(chunk)
                if not path.is_file() or sha256(path) != digest.hexdigest():
                    raise IntakeError(f"Refusing to overwrite a changed original: {path}")
                continue
            with source.open(entry) as stream, path.open("xb") as target:
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    target.write(chunk)


def image_record(path: Path, originals: Path, index: int) -> dict:
    record = {
        "index": index,
        "source_path": path.relative_to(originals).as_posix(),
        "private_original_path": str(path.absolute()),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "mapping_status": "needs_confirmation",
        "quality_review": {"status": "needs_full_resolution_review", "finding": None},
        "crop": {"mode": "contain", "decision": "preserve_full_frame_pending_review"},
        "derivative_path": None,
        "proposed_alt": None,
    }
    try:
        with Image.open(path) as original:
            original.load()
            exif = original.getexif()
            orientation = exif.get(274, 1)
            oriented = ImageOps.exif_transpose(original)
            gps_present = 34853 in exif
            capture_present = any(tag in exif for tag in (306, 36867, 36868))
            record.update({
                "decode": "passed",
                "format": original.format,
                "mode": original.mode,
                "width": original.width,
                "height": original.height,
                "oriented_width": oriented.width,
                "oriented_height": oriented.height,
                "exif_orientation": orientation,
                "frame_count": getattr(original, "n_frames", 1),
                "metadata": {
                    "has_exif": bool(exif),
                    "has_gps": gps_present,
                    "has_capture_time": capture_present,
                    "has_icc_profile": bool(original.info.get("icc_profile")),
                    "has_comment": "comment" in original.info,
                },
                "below_1600px_long_edge": max(oriented.size) < 1600,
                "decoded_pixel_sha256": hashlib.sha256(
                    oriented.convert("RGBA").tobytes()
                ).hexdigest(),
            })
    except (OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        record.update({"decode": "failed", "decode_error": str(error)})
    return record


def contact_sheets(records: list[dict], originals: Path, destination: Path) -> list[str]:
    destination.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(size=15)
    width, height, columns, per_sheet = 320, 340, 4, 20
    result = []
    for start in range(0, len(records), per_sheet):
        group = records[start : start + per_sheet]
        rows = (len(group) + columns - 1) // columns
        sheet = Image.new("RGB", (width * columns, height * rows), "#eeeeee")
        draw = ImageDraw.Draw(sheet)
        for offset, record in enumerate(group):
            x, y = (offset % columns) * width, (offset // columns) * height
            try:
                with Image.open(originals / record["source_path"]) as source:
                    thumbnail = ImageOps.exif_transpose(source).convert("RGB")
                    thumbnail.thumbnail((width - 20, 250), Image.Resampling.LANCZOS)
                    sheet.paste(thumbnail, (
                        x + (width - thumbnail.width) // 2,
                        y + 5 + (250 - thumbnail.height) // 2,
                    ))
            except (OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning):
                draw.text(
                    (x + 10, y + 100), "IMAGE DOES NOT DECODE",
                    fill="#9b1919", font=font,
                )
            source_parts = PurePosixPath(record["source_path"]).parts
            short_path = "/".join(source_parts[-3:])
            label = f"{record['index']:03d}  {short_path}"
            label_lines = textwrap.wrap(label, width=38, break_long_words=True)[:4]
            draw.multiline_text(
                (x + 10, y + 260), "\n".join(label_lines),
                fill="black", font=font, spacing=2,
            )
        name = f"contact-sheet-{start // per_sheet + 1:02d}.jpg"
        sheet.save(destination / name, "JPEG", quality=90)
        result.append(f"contact-sheets/{name}")
    return result


def inventory(archive: Path, output: Path, limits: dict | None = None) -> dict:
    archive = archive.absolute()
    if not archive.is_file():
        raise IntakeError(f"Archive is not a readable local file: {archive}")
    output = private_path(output)
    validation = inspect_archive(archive, limits)
    originals = output / "originals"
    extract_originals(archive, originals)
    all_files = sorted(
        (path for path in originals.rglob("*") if path.is_file()),
        key=lambda path: path.relative_to(originals).as_posix().casefold(),
    )
    images = [path for path in all_files if path.suffix.lower() in IMAGE_SUFFIXES]
    records = [image_record(path, originals, index) for index, path in enumerate(images, 1)]
    exact, pixels = defaultdict(list), defaultdict(list)
    for record in records:
        exact[record["sha256"]].append(record["index"])
        if record.get("decoded_pixel_sha256"):
            pixels[(
                record["oriented_width"], record["oriented_height"],
                record["decoded_pixel_sha256"],
            )].append(record["index"])
    for record in records:
        record["exact_duplicate_of"] = [
            index for index in exact[record["sha256"]] if index != record["index"]
        ]
    result = {
        "schema_version": 1,
        "archive": {
            "filename": archive.name,
            "bytes": archive.stat().st_size,
            "sha256": sha256(archive),
            **validation,
        },
        "image_count": len(records),
        "images_decode": (
            "passed" if all(record["decode"] == "passed" for record in records) else "failed"
        ),
        "mapping_verified": False,
        "quality_acceptable_at_intended_display_sizes": "pending_review",
        "publication_status": "not_approved",
        "non_image_files": [
            path.relative_to(originals).as_posix() for path in all_files if path not in images
        ],
        "exact_duplicate_groups": [group for group in exact.values() if len(group) > 1],
        "decoded_pixel_duplicate_groups": [group for group in pixels.values() if len(group) > 1],
        "images": records,
    }
    result["contact_sheets"] = contact_sheets(records, originals, output / "contact-sheets")
    write_json(output / "inventory.json", result)
    return result


def prepare_pixels(source: Image.Image) -> tuple[Image.Image, str]:
    oriented = ImageOps.exif_transpose(source)
    mode = "RGBA" if "A" in oriented.getbands() else "RGB"
    profile = source.info.get("icc_profile")
    if profile:
        # Normalize profiled colour before removing metadata from output bytes.
        converted = ImageCms.profileToProfile(
            oriented,
            ImageCms.ImageCmsProfile(io.BytesIO(profile)),
            ImageCms.createProfile("sRGB"),
            outputMode=mode,
        )
        colour_handling = "icc_converted_to_srgb"
    else:
        converted = oriented.convert(mode)
        colour_handling = "no_embedded_profile_source_pixels_preserved"
    # Construct a pixel-only image; do not inherit EXIF, GPS, comments or ICC.
    return Image.frombytes(converted.mode, converted.size, converted.tobytes()), colour_handling


def derivatives(intake: Path, mapping_path: Path, max_edge: int = 1600) -> dict:
    if max_edge < 1 or max_edge > 1600:
        raise IntakeError("Derivative longest edge must be between 1 and 1600 pixels")
    intake = private_path(intake)
    inventory_data = json.loads((intake / "inventory.json").read_text(encoding="utf-8"))
    mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
    if (
        mapping.get("schema_version") != 1
        or not isinstance(mapping.get("reviewed_by"), str)
        or not mapping["reviewed_by"].strip()
    ):
        raise IntakeError("Mapping must be schema_version 1 and name the manual reviewer")
    entries = mapping.get("images")
    if not isinstance(entries, list) or not entries:
        raise IntakeError("Mapping must contain a non-empty images list")
    by_path = {record["source_path"]: record for record in inventory_data["images"]}
    destination = private_path(intake / "derivatives")
    destination.mkdir(parents=True, exist_ok=True)
    prepared = []
    for entry in entries:
        source_path = entry.get("source_path")
        if source_path not in by_path:
            raise IntakeError(f"Mapping source is absent from the inventory: {source_path}")
        record = by_path[source_path]
        if record["decode"] != "passed" or record.get("frame_count", 1) != 1:
            raise IntakeError(f"Mapping requires a decoded single-frame source: {source_path}")
        product_id, view, order = (
            entry.get("product_id", ""), entry.get("view", ""), entry.get("order")
        )
        if (
            not SLUG.fullmatch(product_id) or not SLUG.fullmatch(view)
            or not isinstance(order, int) or isinstance(order, bool) or order < 1
        ):
            raise IntakeError(
                "Mapping product_id and view must be lowercase hyphenated identifiers; "
                "order must be a positive integer"
            )
        if entry.get("mapping_status") not in {"needs_confirmation", "verified"}:
            raise IntakeError("Mapping status must explicitly be needs_confirmation or verified")
        quality = entry.get("quality_review", {})
        if quality.get("status") not in {
            "needs_full_resolution_review", "needs_confirmation",
            "acceptable_at_intended_sizes", "rejected",
        }:
            raise IntakeError("Mapping quality_review must carry an explicit review status")
        if quality["status"] == "rejected":
            raise IntakeError(f"Refusing to prepare a quality-rejected source: {source_path}")
        if (
            not entry.get("category") or not isinstance(entry.get("alt"), str)
            or not entry["alt"].strip()
        ):
            raise IntakeError("Mapping category and proposed alt text are required")
        original = intake / "originals" / source_path
        private_path(original)
        if sha256(original) != record["sha256"]:
            raise IntakeError(f"Original changed since inventory: {source_path}")
        if entry.get("source_sha256", record["sha256"]) != record["sha256"]:
            raise IntakeError(f"Mapping hash does not match the original: {source_path}")
        crop = entry.get("crop", {})
        if crop.get("mode") not in {"contain", "crop"} or not crop.get("decision"):
            raise IntakeError("Mapping must record an explicit crop mode and decision")
        with Image.open(original) as source:
            pixels, colour_handling = prepare_pixels(source)
        original_size = list(pixels.size)
        if crop["mode"] == "crop":
            box = crop.get("box")
            if (
                not isinstance(box, list) or len(box) != 4
                or any(not isinstance(value, int) or isinstance(value, bool) for value in box)
            ):
                raise IntakeError(
                    "Crop box must contain four integer pixel coordinates after EXIF orientation"
                )
            left, top, right, bottom = box
            if not (0 <= left < right <= pixels.width and 0 <= top < bottom <= pixels.height):
                raise IntakeError("Crop box must be inside the oriented image")
            pixels = pixels.crop(tuple(box))
        recipe = {
            "source_sha256": record["sha256"], "crop": crop,
            "format": "webp", "quality": 85, "method": 6,
        }
        recipe_hash = hashlib.sha256(json.dumps(recipe, sort_keys=True).encode("utf-8")).hexdigest()[:12]
        variants = []
        for edge in sorted({min(320, max_edge), min(800, max_edge), max_edge}):
            resized = pixels.copy()
            resized.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            filename = f"{recipe_hash}-{edge}.webp"
            target = private_path(destination / filename)
            buffer = io.BytesIO()
            resized.save(buffer, "WEBP", quality=85, method=6)
            rendered = buffer.getvalue()
            if target.exists() and target.read_bytes() != rendered:
                raise IntakeError(f"Refusing to overwrite a different derivative: {filename}")
            if not target.exists():
                target.write_bytes(rendered)
            with Image.open(target) as check:
                check.load()
                if check.getexif() or any(
                    key in check.info for key in ("exif", "icc_profile", "xmp", "comment")
                ):
                    raise IntakeError(f"Derivative unexpectedly retained metadata: {filename}")
            variants.append({
                "requested_long_edge": edge,
                "derivative_path": f"derivatives/{filename}",
                "private_derivative_path": str(target),
                "local_review_url": f"/photo-review/images/{filename}",
                "derivative_sha256": sha256(target),
                "derivative_bytes": target.stat().st_size,
                "width": resized.width,
                "height": resized.height,
                "upscaled": False,
                "metadata_removed": True,
            })
        prepared.append({
            **entry,
            "source_sha256": record["sha256"],
            "source_bytes": record["bytes"],
            "source_oriented_size": original_size,
            **variants[-1],
            "variants": variants,
            "colour_handling": colour_handling,
            "recipe": recipe,
            "publication_status": "not_approved",
        })
    result = {
        "schema_version": 1,
        "reviewed_by": mapping["reviewed_by"],
        "mapping_file_sha256": sha256(mapping_path),
        "archive_sha256": inventory_data["archive"]["sha256"],
        "publication_status": "not_approved",
        "processing_runtime": {
            "python": sys.version.split()[0], "pillow": Image.__version__,
        },
        "images": prepared,
    }
    write_json(intake / "derivatives-manifest.json", result)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    intake_parser = commands.add_parser(
        "inventory", help="Validate archive; preserve originals and create private review materials"
    )
    intake_parser.add_argument("archive", type=Path)
    intake_parser.add_argument("output", type=Path)
    for name in DEFAULT_LIMITS:
        intake_parser.add_argument(
            f"--max-{name.replace('_', '-')}", type=int, default=DEFAULT_LIMITS[name]
        )
    prepare_parser = commands.add_parser(
        "derivatives", help="Prepare private WebP review derivatives using a manually reviewed mapping"
    )
    prepare_parser.add_argument("intake", type=Path)
    prepare_parser.add_argument("mapping", type=Path)
    prepare_parser.add_argument("--max-edge", type=int, default=1600)
    args = parser.parse_args()
    try:
        if args.command == "inventory":
            limits = {name: getattr(args, f"max_{name}") for name in DEFAULT_LIMITS}
            if any(value < 1 for value in limits.values()):
                raise IntakeError("Archive limits must be positive")
            result = inventory(args.archive, args.output, limits)
            print(json.dumps({
                "inventory": str((args.output / "inventory.json").absolute()),
                "image_count": result["image_count"],
                "images_decode": result["images_decode"],
                "contact_sheets": result["contact_sheets"],
                "publication_status": "not_approved",
            }, indent=2))
        else:
            result = derivatives(args.intake, args.mapping, args.max_edge)
            print(json.dumps({
                "manifest": str((args.intake / "derivatives-manifest.json").absolute()),
                "source_count": len(result["images"]),
                "derivative_count": sum(len(image["variants"]) for image in result["images"]),
                "total_bytes": sum(
                    variant["derivative_bytes"]
                    for image in result["images"] for variant in image["variants"]
                ),
                "publication_status": "not_approved",
            }, indent=2))
    except (IntakeError, OSError, ValueError, zipfile.BadZipFile, RuntimeError, ImageCms.PyCMSError) as error:
        print(f"Photo intake failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
