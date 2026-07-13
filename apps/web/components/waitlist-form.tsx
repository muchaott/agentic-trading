"use client";

import { useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [state, setState] = useState<SubmitState>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        interest: form.get("interest"),
        sourcePage: window.location.pathname,
        consentDisclosureVersion: "waitlist_disclosure_v0_1"
      })
    });

    setState(response.ok ? "success" : "error");
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <label>
        Email
        <input name="email" required type="email" placeholder="you@example.com" />
      </label>
      <label>
        Interest
        <select name="interest" required defaultValue="research">
          <option value="research">Research updates</option>
          <option value="paid_research">Paid research later</option>
          <option value="signals_later">Signals if approved later</option>
          <option value="partnership">Partnership</option>
        </select>
      </label>
      <button disabled={state === "submitting"} type="submit">
        {state === "submitting" ? "Joining..." : "Join waitlist"}
      </button>
      {state === "success" ? (
        <p className="notice">You are on the list. If email is configured, a confirmation will be sent.</p>
      ) : null}
      {state === "error" ? (
        <p className="notice risk">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}
