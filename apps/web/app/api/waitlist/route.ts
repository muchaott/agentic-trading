import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWaitlistNotification } from "@/lib/email";
import { getServiceSupabase } from "@/lib/supabase";

const waitlistSchema = z.object({
  email: z.string().email(),
  interest: z.enum(["research", "paid_research", "signals_later", "partnership"]),
  sourcePage: z.string().min(1).max(240).default("/"),
  consentDisclosureVersion: z.string().min(1).default("waitlist_disclosure_v0_1")
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid waitlist request" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: true,
        mode: "dry_run",
        message: "Waitlist request validated. Supabase is not configured yet."
      },
      { status: 202 }
    );
  }

  const { error } = await supabase.from("waitlist_interest").insert({
    email: parsed.data.email,
    interest: parsed.data.interest,
    source_page: parsed.data.sourcePage,
    consent_disclosure_version: parsed.data.consentDisclosureVersion
  });

  if (error) {
    return NextResponse.json({ error: "Could not save waitlist request" }, { status: 500 });
  }

  await sendWaitlistNotification(parsed.data);

  return NextResponse.json({ ok: true }, { status: 201 });
}
