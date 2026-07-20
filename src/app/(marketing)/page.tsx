import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "List your inventory",
    body: "Schools and companies sign in, then catalog surplus laptops, Chromebooks, tablets, and peripherals—with photos, quantities, and condition.",
  },
  {
    number: "02",
    title: "Share a private gallery",
    body: "Harbor creates a secure link to your store. There is no public marketplace. Only people you invite can see what you are selling.",
  },
  {
    number: "03",
    title: "Vendors bid",
    body: "Verified recycling buyers open your link, review the gallery, and submit bids. You compare offers and choose who takes the lot.",
  },
  {
    number: "04",
    title: "Close with confidence",
    body: "Coordinate pickup, recover value, and keep a clear record of the transaction—without exposing inventory to the open web.",
  },
];

const audiences = [
  {
    title: "School districts & campuses",
    body: "Retire classroom fleets in bulk. Share one gallery link with trusted recyclers instead of managing dozens of one-off quotes.",
    href: "/sell",
    cta: "Start selling",
  },
  {
    title: "Corporate IT & facilities",
    body: "Clear refresh cycles and surplus stockrooms with a private storefront you control—visible only to vendors you choose.",
    href: "/sell",
    cta: "List surplus",
  },
  {
    title: "Recycling vendors",
    body: "Access invitation-only galleries from education and enterprise sellers. Sign in to review lots and place competitive bids.",
    href: "/buy",
    cta: "Bid on lots",
  },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero — full-bleed, brand-first */}
      <section className="relative min-h-[min(92vh,860px)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=2400&q=80"
          alt="Rows of computers ready for responsible reuse and recycling"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/88 via-[var(--ink)]/72 to-[var(--ink)]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/50 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[min(92vh,860px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 md:justify-center md:pb-24 md:pt-20">
          <p className="animate-fade-up font-display text-4xl tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Harbor
          </p>
          <h1 className="animate-fade-up delay-1 mt-4 max-w-xl text-2xl font-semibold leading-snug tracking-tight text-white/95 sm:text-3xl md:text-4xl">
            Private galleries for surplus device recycling
          </h1>
          <p className="animate-fade-up delay-2 mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            List retired tech, share a link with verified buyers, and let
            vendors bid—without a public marketplace.
          </p>
          <div className="animate-fade-up delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth?mode=signup&intent=sell"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)]"
            >
              Sell devices
            </Link>
            <Link
              href="/auth?mode=signup&intent=buy"
              className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Buy &amp; bid
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 border-b border-[var(--border)] bg-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              The process
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              From surplus closet to sealed bid
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Harbor is invitation-based. Your inventory never appears on a
              public browse page—only behind the gallery links you send.
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              className="animate-draw-line pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-[var(--border)] lg:block"
              aria-hidden
            />
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`relative animate-fade-up ${
                  ["delay-1", "delay-2", "delay-3", "delay-4"][i]
                }`}
              >
                <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-white font-display text-lg text-[var(--accent)] shadow-[0_0_0_6px_#fff]">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy callout — one job */}
      <section className="border-b border-[var(--border)] bg-[var(--accent-soft)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Private by design
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              No eBay-style front page
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Device lots stay hidden until you share the gallery URL. Vendors
              must have an account to bid. You decide who sees your inventory
              and when.
            </p>
          </div>
          <div className="animate-float relative overflow-hidden rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Example share link
            </p>
            <p className="mt-3 break-all font-mono text-sm text-[var(--accent)]">
              harbor.app/g/g_9f2c8e1a7b4d…f7
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-sm">
                <span className="text-[var(--ink)]">Chromebooks · Grade 6–8</span>
                <span className="text-[var(--muted)]">240 units</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-sm">
                <span className="text-[var(--ink)]">iPads · Classroom cart</span>
                <span className="text-[var(--muted)]">48 units</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ink)]">Chargers &amp; cases</span>
                <span className="text-[var(--muted)]">Lot</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-[var(--muted)]">
              Visible only to signed-in vendors with the link.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Built for both sides
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              Education, enterprise, and recycling partners
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              One platform. Two logins. Sellers publish private stores; buyers
              respond with bids.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {audiences.map((item) => (
              <div key={item.title} className="flex flex-col">
                <h3 className="text-lg font-semibold text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-dark)]"
                >
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"
                alt="Laptop and workstation equipment typical of education and corporate refresh cycles"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                What moves through Harbor
              </p>
              <h2 className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
                The devices districts and companies retire every year
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
                Catalog entire fleets or selective lots. Buyers know what they
                are bidding on before they commit.
              </p>
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Laptops & notebooks",
                  "Chromebooks",
                  "Tablets & iPads",
                  "Desktops & all-in-ones",
                  "Monitors & displays",
                  "Network equipment",
                  "Peripherals & accessories",
                  "Chargers, carts & cases",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-[var(--ink)]"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--ink)]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Ready when your refresh cycle is
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            Create an account to sell surplus or bid on invitation-only
            galleries. Login is required for both.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth?mode=signup&intent=sell"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)]"
            >
              Create seller account
            </Link>
            <Link
              href="/auth?mode=signup&intent=buy"
              className="inline-flex items-center justify-center rounded-md border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create buyer account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
