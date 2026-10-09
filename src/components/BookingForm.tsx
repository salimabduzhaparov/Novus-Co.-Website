"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "./ui/Icon";
import { bookServiceOptions } from "@/lib/content";

type FieldErrors = Record<string, string>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingForm() {
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
    if (!bookServiceOptions.some((option) => option === data.service))
      errors.service = "Choose a service, or select ‘Not sure yet’.";
    if (!data.name) errors.name = "Enter your name.";
    if (!data.business) errors.business = "Enter your business name.";
    if (!emailPattern.test(data.email))
      errors.email = "Enter a valid email address.";
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) return;

    setSending(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.fieldErrors) setFieldErrors(body.fieldErrors);
        throw new Error(
          body?.error || "We couldn’t send your request. Please try again.",
        );
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t send your request. Please try again.",
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
            Your request is in.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-silver">
            Thanks for telling us about your business. We’ll reply by email to
            arrange a 10-minute call about your preview. Your time will be
            confirmed in that reply.
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
          <div>
            <label htmlFor="booking-service" className="field-label mb-2 block">
              What can we help with?
            </label>
            <select
              id="booking-service"
              name="service"
              defaultValue=""
              required
              aria-invalid={Boolean(fieldErrors.service)}
              aria-describedby={
                fieldErrors.service ? "booking-service-error" : undefined
              }
              className="form-input w-full rounded-xl px-4 py-3 text-base"
            >
              <option value="" disabled>
                Select a service
              </option>
              {bookServiceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.service && (
              <p
                id="booking-service-error"
                className="mt-2 text-sm text-red-700"
              >
                {fieldErrors.service}
              </p>
            )}
          </div>
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
              label="Business name"
              name="business"
              autoComplete="organization"
              maxLength={160}
              required
              error={fieldErrors.business}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              error={fieldErrors.email}
            />
            <Field
              label="Phone (optional)"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={80}
              error={fieldErrors.phone}
            />
          </div>
          <div>
            <label htmlFor="booking-message" className="field-label mb-2 block">
              Anything else? (optional)
            </label>
            <p
              id="booking-message-hint"
              className="mb-3 text-sm leading-relaxed text-silver"
            >
              Share your current website, what you need, or a good time to talk.
              Include your time zone if you suggest a time.
            </p>
            <textarea
              id="booking-message"
              name="message"
              rows={4}
              maxLength={5000}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={`booking-message-hint${fieldErrors.message ? " booking-message-error" : ""}`}
              className="form-input w-full resize-y rounded-xl px-4 py-3 text-base"
            />
            {fieldErrors.message && (
              <p
                id="booking-message-error"
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
            {sending ? "Sending your request…" : "Request my free preview"}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="text-sm leading-relaxed text-silver">
            No payment or commitment. We’ll arrange the time with you by email.
          </p>
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
  const id = `booking-${name}`;
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
