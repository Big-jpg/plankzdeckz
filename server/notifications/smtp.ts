import nodemailer from "nodemailer";
import { NotificationDeliveryError, type NotificationMessage } from "./delivery";

export function getOrderEmailConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  const host = environment.EMAIL_SERVER_HOST?.trim();
  const port = Number(environment.EMAIL_SERVER_PORT);
  const user = environment.EMAIL_SERVER_USER?.trim();
  const pass = environment.EMAIL_SERVER_PASSWORD;
  const from = environment.EMAIL_FROM?.trim();
  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !user ||
    !pass ||
    !from ||
    /[\r\n]/.test(from)
  ) {
    return null;
  }
  return {
    from,
    server: {
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user, pass },
      connectionTimeout: 5_000,
      greetingTimeout: 5_000,
      socketTimeout: 5_000,
      dnsTimeout: 5_000,
    },
  };
}

export interface OrderEmailTransport {
  sendMail(
    message: NotificationMessage & { from: string },
  ): Promise<{ accepted: Array<string | { address: string }> }>;
  close(): void;
}

export async function sendOrderEmail(
  message: NotificationMessage,
  createTransport: (
    options: NonNullable<ReturnType<typeof getOrderEmailConfiguration>>["server"],
  ) => OrderEmailTransport = (options) => nodemailer.createTransport(options),
): Promise<void> {
  const configuration = getOrderEmailConfiguration();
  if (!configuration) throw new NotificationDeliveryError("smtp_not_configured");
  const transport = createTransport(configuration.server);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      transport.sendMail({ from: configuration.from, ...message }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          transport.close();
          reject(new NotificationDeliveryError("smtp_timeout"));
        }, 10_000);
      }),
    ]);
    const accepted = result.accepted.some(
      (address) =>
        (typeof address === "string" ? address : address.address).toLowerCase() ===
        message.to.toLowerCase(),
    );
    if (!accepted) throw new NotificationDeliveryError("smtp_recipient_rejected");
  } finally {
    if (timeout) clearTimeout(timeout);
    transport.close();
  }
}
