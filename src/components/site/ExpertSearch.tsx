import { ChevronDown, Search } from "lucide-react";

const filters = ["All Types", "All Modes", "All Genders", "Rating", "Ascending"];

export function ExpertSearch() {
  return (
    <section className="mx-auto w-[min(96vw,1100px)]">
      <div className="glass flex flex-col items-stretch gap-2 p-2 md:flex-row md:items-center md:gap-1 md:rounded-full md:p-2">
        <div className="flex flex-1 items-center gap-3 px-4 py-2">
          <Search className="h-5 w-5 text-cream/70" />
          <input
            type="text"
            placeholder="Start typing to search experts…"
            className="w-full bg-transparent text-cream placeholder:text-cream/50 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 px-1">
          {filters.map((f) => (
            <button
              key={f}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-cream/90 transition hover:bg-white/10"
            >
              {f}
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
