import { NextResponse } from "next/server";
import { getResend, escapeHtml } from "@/lib/email";
import { CONTACT_EMAIL } from "@/lib/content";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const service = typeof body.service === "string" ? body.service.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const business = typeof body.business === "string" ? body.business.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const time = typeof body.time === "string" ? body.time.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!service || !name || !business || !email || !phone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json({ error: "Email is not configured yet." }, { status: 500 });
  }

  try {
    const { error } = await getResend().emails.send({
      from: "Novus Co. Website <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `New preview call request from ${name} (${business})`,
      html: `
        <p><strong>Service interest:</strong> ${escapeHtml(service)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Business:</strong> ${escapeHtml(business)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        ${date ? `<p><strong>Preferred date:</strong> ${escapeHtml(date)}</p>` : ""}
        ${time ? `<p><strong>Preferred time:</strong> ${escapeHtml(time)}</p>` : ""}
        ${message ? `<p><strong>Notes:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>` : ""}
      `,
    });

    if (error) {
      console.error("Resend error (book):", error);
      return NextResponse.json({ error: "Failed to send request. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("Failed to send booking email:", err);
    return NextResponse.json({ error: "Failed to send request. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
