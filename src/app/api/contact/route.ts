import { NextResponse } from "next/server";
import { getResend, escapeHtml } from "@/lib/email";
import { CONTACT_EMAIL } from "@/lib/content";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const business =
    typeof body.business === "string" ? body.business.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const fieldErrors: Record<string, string> = {};
  if (!name || name.length > 120 || /[\r\n]/.test(name)) {
    fieldErrors.name = "Enter a name of up to 120 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (business.length > 160 || /[\r\n]/.test(business)) {
    fieldErrors.business =
      "Enter a business name of up to 160 characters, or leave it blank.";
  }
  if (!message || message.length > 5000) {
    fieldErrors.message = "Enter a message of up to 5,000 characters.";
  }
  if (Object.keys(fieldErrors).length) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "We couldn’t send this right now. Please email us directly." },
      { status: 500 },
    );
  }

  try {
    const { error } = await getResend().emails.send({
      from: "Novus Co. Website <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `New contact message from ${name}${business ? ` (${business})` : ""}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${business ? `<p><strong>Business:</strong> ${escapeHtml(business)}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      console.error("Resend error (contact):", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
