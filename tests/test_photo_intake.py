"""Safety and image-contract checks; no external inventory or services."""

import importlib.util
import io
import json
import shutil
import stat
import unittest
import uuid
import zipfile
from pathlib import Path

from PIL import Image

SPEC = importlib.util.spec_from_file_location(
    "photo_intake", Path(__file__).parents[1] / "scripts" / "photo_intake.py"
)
intake = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(intake)


class PhotoIntakeTests(unittest.TestCase):
    def setUp(self):
        self.fixture_parent = Path(__file__).parents[1] / ".photo-intake"
        self.root = self.fixture_parent / f"test-{uuid.uuid4().hex}"
        self.root.mkdir(parents=True)

    def tearDown(self):
        self.root.resolve().relative_to(self.fixture_parent.resolve())
        shutil.rmtree(self.root)

    def archive(self, entries):
        archive = self.root / "photos.zip"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as output:
            for name, data in entries:
                if isinstance(name, str):
                    info = zipfile.ZipInfo(name)
                    # Preserve the raw member spelling even on Windows, where
                    # ZipInfo normally normalizes backslashes during creation.
                    info.filename = name
                    info.compress_type = zipfile.ZIP_DEFLATED
                    output.writestr(info, data)
                else:
                    output.writestr(name, data)
        return archive

    def jpeg(self, size=(2200, 1200), orientation=1):
        buffer = io.BytesIO()
        image = Image.new("RGB", size, "#458593")
        exif = Image.Exif()
        exif[274] = orientation
        exif[306] = "2026:01:01 12:00:00"
        image.save(buffer, "JPEG", exif=exif)
        return buffer.getvalue()

    def test_rejects_unsafe_paths_before_creating_originals(self):
        for name in (
            "../outside.jpg", "/absolute.jpg", "C:/drive.jpg", "a\\b.jpg",
            "a/../b.jpg", "NUL.jpg", "a./b.jpg", "a//b.jpg",
        ):
            with self.subTest(name=name):
                archive = self.archive([(name, self.jpeg())])
                with self.assertRaises(intake.IntakeError):
                    intake.inventory(archive, self.root / "output")
                self.assertFalse((self.root / "output").exists())

    def test_rejects_case_collision_and_parent_file(self):
        for entries in (
            [("Photo.jpg", b"a"), ("photo.JPG", b"b")],
            [("parent.jpg", b"a"), ("parent.jpg/child.jpg", b"b")],
        ):
            with self.subTest(entries=entries):
                with self.assertRaises(intake.IntakeError):
                    intake.inspect_archive(self.archive(entries))

    def test_rejects_symlinks_and_disguised_executables(self):
        symlink = zipfile.ZipInfo("link.jpg")
        symlink.create_system = 3
        symlink.external_attr = (stat.S_IFLNK | 0o777) << 16
        for entries in (
            [(symlink, b"../outside.jpg")],
            [("image.jpg", b"MZexecutable")],
            [("photo.py", b"print('unsafe')")],
        ):
            with self.subTest(entries=entries):
                with self.assertRaises(intake.IntakeError):
                    intake.inspect_archive(self.archive(entries))

    def test_rejects_expansion_limits(self):
        archive = self.archive([("large.jpg", b"x" * 10000)])
        for limits in ({"file_bytes": 9999}, {"total_bytes": 9999}, {"ratio": 2}):
            with self.subTest(limits=limits):
                with self.assertRaises(intake.IntakeError):
                    intake.inspect_archive(archive, limits)

    def test_rejects_bad_crc_before_extracting(self):
        archive = self.root / "broken.zip"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_STORED) as output:
            output.writestr("image.jpg", b"abcdefg")
        archive.write_bytes(archive.read_bytes().replace(b"abcdefg", b"abcxefg", 1))
        with self.assertRaises(zipfile.BadZipFile):
            intake.inventory(archive, self.root / "output")
        self.assertFalse((self.root / "output").exists())

    def test_preserves_originals_records_failures_and_duplicate_groups(self):
        jpeg = self.jpeg(orientation=6)
        archive = self.archive([("a.jpg", jpeg), ("b.jpg", jpeg), ("broken.jpg", b"not an image")])
        output = self.root / "output"
        result = intake.inventory(archive, output)
        self.assertEqual(result["image_count"], 3)
        self.assertEqual(result["images_decode"], "failed")
        self.assertEqual(result["exact_duplicate_groups"], [[1, 2]])
        self.assertEqual(result["decoded_pixel_duplicate_groups"], [[1, 2]])
        self.assertEqual(result["images"][0]["oriented_width"], 1200)
        self.assertEqual(result["images"][0]["oriented_height"], 2200)
        self.assertTrue(result["images"][0]["metadata"]["has_capture_time"])
        self.assertEqual((output / "originals/a.jpg").read_bytes(), jpeg)
        self.assertEqual(result["images"][0]["quality_review"]["status"], "needs_full_resolution_review")
        self.assertTrue((output / result["contact_sheets"][0]).is_file())
        (output / "originals/a.jpg").write_bytes(b"changed")
        with self.assertRaises(intake.IntakeError):
            intake.inventory(archive, output)

    def test_derivatives_orient_strip_metadata_no_upscale_and_repeat(self):
        archive = self.archive([
            ("large.jpg", self.jpeg(orientation=6)),
            ("small.jpg", self.jpeg(size=(400, 200))),
        ])
        output = self.root / "output"
        intake.inventory(archive, output)
        entries = [{
            "source_path": name,
            "product_id": "sample",
            "category": "sample",
            "view": view,
            "order": order,
            "alt": "Sample item",
            "mapping_status": "needs_confirmation",
            "quality_review": {"status": "needs_full_resolution_review", "finding": None},
            "crop": {"mode": "contain", "decision": "Preserve full frame for review"},
        } for name, view, order in (("large.jpg", "front", 1), ("small.jpg", "back", 2))]
        mapping = self.root / "mapping.json"
        mapping.write_text(json.dumps({
            "schema_version": 1, "reviewed_by": "test reviewer", "images": entries,
        }), encoding="utf-8")
        result = intake.derivatives(output, mapping)
        self.assertEqual((result["images"][0]["width"], result["images"][0]["height"]), (873, 1600))
        self.assertEqual((result["images"][1]["width"], result["images"][1]["height"]), (400, 200))
        self.assertEqual(result["publication_status"], "not_approved")
        self.assertEqual(
            [variant["requested_long_edge"] for variant in result["images"][0]["variants"]],
            [320, 800, 1600],
        )
        first_hashes = [item["derivative_sha256"] for item in result["images"]]
        self.assertEqual(first_hashes, [
            item["derivative_sha256"] for item in intake.derivatives(output, mapping)["images"]
        ])
        for record in result["images"]:
            with Image.open(output / record["derivative_path"]) as image:
                self.assertFalse(image.getexif())
                self.assertFalse(any(key in image.info for key in ("exif", "icc_profile", "xmp")))

    def test_keeps_reviewed_quality_candidates_private_and_rejects_rejected(self):
        output = self.root / "output"
        intake.inventory(self.archive([("candidate.jpg", self.jpeg(size=(80, 40)))]), output)
        entry = {
            "source_path": "candidate.jpg",
            "product_id": "sample",
            "category": "sample",
            "view": "front",
            "order": 1,
            "alt": "Sample item",
            "mapping_status": "needs_confirmation",
            "quality_review": {"status": "needs_confirmation", "finding": "Owner must review softness"},
            "crop": {"mode": "contain", "decision": "Preserve full frame"},
        }
        mapping = self.root / "mapping.json"
        mapping.write_text(json.dumps({
            "schema_version": 1, "reviewed_by": "test reviewer", "images": [entry],
        }), encoding="utf-8")
        result = intake.derivatives(output, mapping)
        self.assertEqual(result["images"][0]["quality_review"]["status"], "needs_confirmation")
        self.assertEqual(result["images"][0]["publication_status"], "not_approved")
        entry["quality_review"]["status"] = "rejected"
        mapping.write_text(json.dumps({
            "schema_version": 1, "reviewed_by": "test reviewer", "images": [entry],
        }), encoding="utf-8")
        with self.assertRaises(intake.IntakeError):
            intake.derivatives(output, mapping)


if __name__ == "__main__":
    unittest.main()
