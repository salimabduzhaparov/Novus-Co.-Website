import { NextResponse } from "next/server";
import { getResend, escapeHtml } from "@/lib/email";
import { CONTACT_EMAIL, bookServiceOptions } from "@/lib/content";

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

  const service = typeof body.service === "string" ? body.service.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const business =
    typeof body.business === "string" ? body.business.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const fieldErrors: Record<string, string> = {};
  if (!name || name.length > 120 || /[\r\n]/.test(name)) {
    fieldErrors.name = "Enter a name of up to 120 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (!bookServiceOptions.some((option) => option === service)) {
    fieldErrors.service = "Choose one of the listed services.";
  }
  if (!business || business.length > 160 || /[\r\n]/.test(business)) {
    fieldErrors.business = "Enter a business name of up to 160 characters.";
  }
  if (phone.length > 80 || /[\r\n]/.test(phone)) {
    fieldErrors.phone =
      "Enter a phone number of up to 80 characters, or leave it blank.";
  }
  if (message.length > 5000)
    fieldErrors.message = "Keep your note under 5,000 characters.";
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
      subject: `New call request from ${name} (${business})`,
      html: `
        <p><strong>Service interest:</strong> ${escapeHtml(service)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Business:</strong> ${escapeHtml(business)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
        ${message ? `<p><strong>Notes:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>` : ""}
      `,
    });

    if (error) {
      console.error("Resend error (book):", error);
      return NextResponse.json(
        { error: "Failed to send request. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Failed to send booking email:", err);
    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
