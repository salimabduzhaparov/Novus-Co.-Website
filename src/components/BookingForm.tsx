"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./ui/Icon";
import { bookServiceOptions } from "@/lib/content";

export function BookingForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-8 sm:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-14 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-light/50 text-accent-light">
              <Icon name="check" size={26} />
            </div>
            <h3 className="text-xl font-semibold">Request received.</h3>
            <p className="max-w-sm text-sm text-silver">
              Thanks — we&apos;ll follow up by email to confirm your 10-minute
              preview call.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-silver-dim">
                Service interest
              </label>
              <select
                name="service"
                defaultValue=""
                required
                className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-ink focus:border-accent-light/60 focus:outline-none"
              >
                <option value="" disabled className="bg-elevated">
                  Select a service
                </option>
                {bookServiceOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-elevated">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Your name" required />
              <Field label="Business name" name="business" placeholder="Your business" required />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" placeholder="you@business.com" required />
              <Field label="Phone" name="phone" type="tel" placeholder="(000) 000-0000" required />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Preferred date" name="date" type="date" />
              <Field label="Preferred time" name="time" type="time" />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-silver-dim">
                What do you need?
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="A short note on your business and what you're looking for."
                className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-ink placeholder:text-silver-dim focus:border-accent-light/60 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <motion.button
              type="submit"
              disabled={sending}
              whileHover={{ scale: sending ? 1 : 1.02 }}
              whileTap={{ scale: sending ? 1 : 0.98 }}
              className="w-full rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(47,109,246,0.4)] transition-shadow hover:shadow-[0_0_56px_rgba(47,109,246,0.6)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {sending ? "Sending…" : "Request my preview call"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-wide text-silver-dim">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-ink placeholder:text-silver-dim focus:border-accent-light/60 focus:outline-none [color-scheme:dark]"
      />
    </div>
  );
}
