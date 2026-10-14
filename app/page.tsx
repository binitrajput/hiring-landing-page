"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  currentRole: "",
  whyFit: "",
  resume: null as File | null,
};

export default function Home() {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormData((current) => ({ ...current, resume: file }));
    setErrors((current) => ({ ...current, resume: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("linkedinUrl", formData.linkedinUrl);
    payload.append("currentRole", formData.currentRole);
    payload.append("whyFit", formData.whyFit);

    if (formData.resume) {
      payload.append("resume", formData.resume);
    }

    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as {
        errors?: Record<string, string>;
        message?: string;
      };

      if (!response.ok) {
        setErrors(data.errors ?? {});
        return;
      }

      setSuccessMessage(data.message ?? "Thanks! We have your interest.");
      setFormData(defaultForm);
      setErrors({});
      event.currentTarget.reset();
    } catch {
      setErrors({ form: "Something went wrong. Please try again in a moment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-lg font-bold text-cyan-300">
              A
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Native</p>
              <p className="text-sm font-semibold text-white">Innovator</p>
            </div>
          </div>
          <a
            href="#interest-form"
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Apply now
          </a>
        </header>

        <section className="grid gap-10 pb-8 pt-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:pt-20">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
              We are hiring
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Help shape the next generation of AI-native businesses.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              We are looking for an <span className="font-semibold text-white">AI Native Innovator</span> to turn emerging AI capabilities into real products, workflows, and business value.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#interest-form"
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Express interest
              </a>
              <a
                href="#role-details"
                className="rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              >
                Learn more
              </a>
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <dt className="text-sm text-slate-400">Focus</dt>
                <dd className="mt-2 text-xl font-semibold">AI products</dd>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <dt className="text-sm text-slate-400">Mode</dt>
                <dd className="mt-2 text-xl font-semibold">Prototype fast</dd>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <dt className="text-sm text-slate-400">Impact</dt>
                <dd className="mt-2 text-xl font-semibold">Real business value</dd>
              </div>
            </dl>
          </div>

          <aside className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6 shadow-2xl shadow-cyan-950/20">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">What this role is</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Not just AI curiosity. AI execution.</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="flex gap-3">
                <span className="mt-1 text-cyan-300">•</span>
                <span>Turn ideas into prototypes, experiments, and shipped workflows.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-cyan-300">•</span>
                <span>Work across product, strategy, and technical execution.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-cyan-300">•</span>
                <span>Design how AI creates leverage inside teams and customer experiences.</span>
              </li>
            </ul>
          </aside>
        </section>

        <section id="role-details" className="grid gap-8 py-12 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Who it is for</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Builders with imagination</h3>
            <p className="mt-4 text-slate-300">
              This role is for people who think in systems, are excited by experimentation, and love turning ambiguity into something real.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">You will do</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Prototype, learn, ship</h3>
            <p className="mt-4 text-slate-300">
              Design AI-native experiences, test customer-facing ideas, and turn inspiration into measurable outcomes.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Why it is exciting</p>
            <h3 className="mt-3 text-xl font-semibold text-white">High leverage, early impact</h3>
            <p className="mt-4 text-slate-300">
              You will be part of defining how AI changes the shape of work, product, and customer value from the ground up.
            </p>
          </div>
        </section>

        <section className="pb-8 pt-8">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Interest form</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Tell us why you should be on the short list</h2>
          </div>

          {successMessage ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center shadow-xl shadow-emerald-900/10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">✓</div>
              <h3 className="mt-5 text-2xl font-semibold text-white">Thank you for your interest.</h3>
              <p className="mt-3 text-slate-200">{successMessage}</p>
              <p className="mt-3 text-sm text-slate-300">We will review your submission and be in touch soon.</p>
            </div>
          ) : (
            <form
              id="interest-form"
              onSubmit={handleSubmit}
              className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30 sm:p-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="Jane Smith"
                  />
                  {errors.name ? <p className="mt-2 text-sm text-red-300">{errors.name}</p> : null}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="jane@example.com"
                  />
                  {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email}</p> : null}
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-200">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone ? <p className="mt-2 text-sm text-red-300">{errors.phone}</p> : null}
                </div>

                <div>
                  <label htmlFor="linkedinUrl" className="mb-2 block text-sm font-medium text-slate-200">
                    LinkedIn or portfolio
                  </label>
                  <input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="https://linkedin.com/in/yourname"
                  />
                  {errors.linkedinUrl ? <p className="mt-2 text-sm text-red-300">{errors.linkedinUrl}</p> : null}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="currentRole" className="mb-2 block text-sm font-medium text-slate-200">
                    Current role
                  </label>
                  <input
                    id="currentRole"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="Product lead, ML engineer, founder, designer..."
                  />
                  {errors.currentRole ? <p className="mt-2 text-sm text-red-300">{errors.currentRole}</p> : null}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="whyFit" className="mb-2 block text-sm font-medium text-slate-200">
                    Why are you a fit?
                  </label>
                  <textarea
                    id="whyFit"
                    name="whyFit"
                    value={formData.whyFit}
                    onChange={handleFieldChange}
                    rows={6}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="Tell us about the work you have done, the problems you love solving, and why this opportunity stands out."
                  />
                  {errors.whyFit ? <p className="mt-2 text-sm text-red-300">{errors.whyFit}</p> : null}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="resume" className="mb-2 block text-sm font-medium text-slate-200">
                    Resume (optional)
                  </label>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="block w-full rounded-xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                  />
                  {errors.resume ? <p className="mt-2 text-sm text-red-300">{errors.resume}</p> : null}
                </div>
              </div>

              {errors.form ? (
                <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errors.form}
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit my interest"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
