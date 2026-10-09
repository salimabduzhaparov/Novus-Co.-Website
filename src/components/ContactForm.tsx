"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "./ui/Icon";

type FieldErrors = Record<string, string>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus();
    else if (Object.keys(fieldErrors).length) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    } else if (error) errorRef.current?.focus();
  }, [sent, fieldErrors, error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = Object.fromEntries(
      Array.from(
        new FormData(event.currentTarget).entries(),
        ([key, value]) => [key, String(value).trim()],
      ),
    );
    const errors: FieldErrors = {};
    if (!data.name) errors.name = "Enter your name.";
    if (!emailPattern.test(data.email))
      errors.email = "Enter a valid email address.";
    if (!data.message) errors.message = "Tell us a little about what you need.";
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) return;

    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.fieldErrors) setFieldErrors(body.fieldErrors);
        throw new Error(
          body?.error || "We couldn’t send your message. Please try again.",
        );
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="form-panel rounded-3xl p-6 sm:p-10">
      {sent ? (
        <div className="flex flex-col items-start gap-4 py-12" role="status">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent"
            aria-hidden="true"
          >
            <Icon name="check" size={24} />
          </span>
          <h2
            ref={successRef}
            tabIndex={-1}
            className="text-2xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Message received.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-silver">
            Thanks for getting in touch. We’ll reply to the email address you
            provided.
          </p>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          aria-busy={sending}
          className="space-y-6"
        >
          <p className="text-sm leading-relaxed text-silver">
            All fields are required unless marked optional.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Your name"
              name="name"
              autoComplete="name"
              maxLength={120}
              required
              error={fieldErrors.name}
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              error={fieldErrors.email}
            />
          </div>
          <Field
            label="Business name (optional)"
            name="business"
            autoComplete="organization"
            maxLength={160}
            error={fieldErrors.business}
          />
          <div>
            <label htmlFor="contact-message" className="field-label mb-2 block">
              How can we help?
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              maxLength={5000}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={
                fieldErrors.message ? "contact-message-error" : undefined
              }
              className="form-input w-full resize-y rounded-xl px-4 py-3 text-base"
            />
            {fieldErrors.message && (
              <p
                id="contact-message-error"
                className="mt-2 text-sm text-red-700"
              >
                {fieldErrors.message}
              </p>
            )}
          </div>
          <p className="sr-only" role="alert">
            {Object.keys(fieldErrors).length
              ? "Please check the highlighted fields."
              : ""}
          </p>
          {error && (
            <p
              ref={errorRef}
              tabIndex={-1}
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-800 focus:outline-2 focus:outline-offset-2 focus:outline-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {sending ? "Sending your message…" : "Send message"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  maxLength,
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  maxLength: number;
  required?: boolean;
  error?: string;
}) {
  const id = `contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label mb-2 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="form-input w-full rounded-xl px-4 py-3 text-base"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
