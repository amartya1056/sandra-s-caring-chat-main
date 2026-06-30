import { ChevronDown, Leaf } from "lucide-react";

const links = ["Home", "About Us", "Deep TMS", "Services", "Our Experts", "Awareness", "Contact"];
const withDropdown = new Set(["Services", "Awareness"]);

export function Nav() {
  return (
    <header className="fixed left-1/2 top-4 z-40 w-[min(96vw,1200px)] -translate-x-1/2">
      <nav className="glass flex items-center justify-between gap-6 px-5 py-3">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-deep-green">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-lg text-cream">Positive Mind Care</span>
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l}>
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-cream/90 transition hover:bg-white/10"
              >
                {l}
                {withDropdown.has(l) && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
              </a>
            </li>
          ))}
        </ul>
        <button className="rounded-full bg-cream px-5 py-2 text-sm font-semibold text-deep-green shadow-sm transition hover:bg-cream/90">
          SIGN IN
        </button>
      </nav>
    </header>
  );
}
