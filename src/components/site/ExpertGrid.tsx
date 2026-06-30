import { Clock, Star } from "lucide-react";
import doc1 from "@/assets/doc1.jpg";
import doc2 from "@/assets/doc2.jpg";
import doc3 from "@/assets/doc3.jpg";
import doc4 from "@/assets/doc4.jpg";

type Expert = {
  name: string;
  online?: boolean;
  photo: string;
  years: number;
  tags: string[];
  price: string;
  duration: string;
  slot: string;
};

const experts: Expert[] = [
  {
    name: "Dr. Rahul Yadav",
    photo: doc1,
    years: 10,
    tags: ["Obsessive-Compulsive Disorder", "De-addiction", "Depression"],
    price: "₹1500",
    duration: "30 mins",
    slot: "Next available",
  },
  {
    name: "Dr. Kirti Yadav",
    photo: doc2,
    years: 6,
    tags: ["Obsessive-Compulsive Disorder", "De-addiction", "Depression"],
    price: "₹1500",
    duration: "30 mins",
    slot: "11:00 AM",
  },
  {
    name: "Dr. Ratika Sharma",
    online: true,
    photo: doc3,
    years: 14,
    tags: ["De-addiction services", "Community", "Relationship issues"],
    price: "₹2000",
    duration: "20 mins",
    slot: "11:00 AM",
  },
  {
    name: "Dr. Akriti Jaiswal",
    online: true,
    photo: doc4,
    years: 7,
    tags: ["De-addiction", "Behavioral Disorders"],
    price: "₹1500",
    duration: "30 mins",
    slot: "10:00 AM",
  },
];

export function ExpertGrid() {
  return (
    <section className="mx-auto mt-10 w-[min(96vw,1200px)] pb-32">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {experts.map((e) => (
          <article
            key={e.name}
            className="glass-strong group flex flex-col overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative mb-4 overflow-hidden rounded-2xl">
              <img
                src={e.photo}
                alt={e.name}
                width={512}
                height={512}
                loading="lazy"
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 grid place-items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <span className="rounded-full bg-cream/95 px-3 py-1.5 text-xs font-semibold text-deep-green">
                  VIEW PROFILE
                </span>
              </div>
              {e.online && (
                <span className="absolute left-3 top-3 rounded-full bg-deep-green/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
                  Online
                </span>
              )}
            </div>

            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-display text-lg text-cream">{e.name}</h3>
              <span className="flex items-center gap-0.5 text-gold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-semibold">5.0</span>
              </span>
            </div>
            <p className="mb-3 text-xs text-cream/70">Experience: {e.years} years</p>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {e.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-tag-blue px-2.5 py-1 text-[10px] font-medium text-tag-blue-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-wider text-cream/60">Consultation</p>
                <p className="font-display text-xl text-cream">
                  {e.price} <span className="text-xs font-normal text-cream/70">/ {e.duration}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-orange-availability">
                <Clock className="h-3.5 w-3.5" />
                Next available slot: <span className="font-semibold">{e.slot}</span>
              </div>
              <button className="w-full rounded-full bg-deep-green py-2.5 text-sm font-semibold text-cream shadow-md transition hover:brightness-110">
                BOOK
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
