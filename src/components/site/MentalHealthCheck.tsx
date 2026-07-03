import { Link } from "@tanstack/react-router";
import { Gauge } from "./Gauge";

const CHECKS = [
  { slug: "anxiety", label: "Check Anxiety", value: 0.16 },
  { slug: "depression", label: "Check Depression", value: 0.32 },
  { slug: "ocd", label: "Check OCD", value: 0.7 },
  { slug: "addiction", label: "Check Addiction", value: 0.86 },
] as const;

export function MentalHealthCheck() {
  return (
    <section className="mt-10 w-full bg-[#f6f5da] py-16 sm:py-20">
      <div className="mx-auto w-[min(92vw,1200px)]">
        <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-10">
          <h2 className="font-display text-3xl font-bold leading-tight text-deep-green sm:text-4xl">
            Check your Mental Health in{" "}
            <span className="underline decoration-2 underline-offset-4">Just 2 Minute</span>
          </h2>
          <p className="text-sm leading-relaxed text-deep-green/70 sm:text-base md:pt-2">
            Join our community and get access to exclusive content on mental wellness. Take a
            free test and get your report.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {CHECKS.map((c) => (
            <Link
              key={c.slug}
              to="/check/$type"
              params={{ type: c.slug }}
              className="group flex flex-col items-center gap-4 rounded-3xl bg-[#7c8a66] p-5 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="grid aspect-square w-full place-items-center rounded-2xl bg-white p-5">
                <Gauge value={c.value} className="w-full max-w-[220px]" />
              </div>
              <span className="text-lg font-bold text-cream sm:text-xl">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
