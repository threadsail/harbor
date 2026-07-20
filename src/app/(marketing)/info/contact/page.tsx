export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        Contact
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
        Planning a device refresh, or joining as a recycling vendor? Tell us
        about your organization and timeline.
      </p>
      <div className="mt-10 border border-[var(--border)] bg-white p-6 sm:p-8">
        <p className="text-sm font-semibold text-[var(--ink)]">Email</p>
        <a
          href="mailto:hello@harbor.example"
          className="mt-2 inline-block text-[var(--accent)] hover:underline"
        >
          hello@harbor.example
        </a>
        <p className="mt-6 text-sm font-semibold text-[var(--ink)]">
          What to include
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <li>Whether you are selling or buying</li>
          <li>Approximate device volume and types</li>
          <li>Target pickup or bid window</li>
        </ul>
      </div>
    </div>
  );
}
