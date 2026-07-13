import { Resend } from "resend";

type WaitlistNotification = {
  email: string;
  interest: string;
  sourcePage: string;
};

export async function sendWaitlistNotification(payload: WaitlistNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.WAITLIST_NOTIFY_EMAIL;

  if (!apiKey || !from || !to) {
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to,
    subject: "New Strategy Ledger waitlist signup",
    text: [
      `Email: ${payload.email}`,
      `Interest: ${payload.interest}`,
      `Source: ${payload.sourcePage}`
    ].join("\n")
  });
}
