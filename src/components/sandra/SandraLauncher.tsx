export function SandraLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Talk with Sandra"
      className="group fixed bottom-6 left-6 z-40 flex items-center gap-3 rounded-full border border-white/15 bg-black/55 px-4 py-3 text-left text-cream backdrop-blur-md transition hover:bg-black/65"
      style={{ animation: "launcher-pulse 2.4s ease-in-out infinite" }}
    >
      <span className="relative grid h-10 w-10 place-items-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #F6C544, #E8732A, #F3F0E0, #F6C544)",
            animation: "orb-rotate 4s linear infinite",
            filter: "blur(2px)",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-[3px] rounded-full bg-black/70"
        />
        <span
          aria-hidden
          className="relative h-3 w-3 rounded-full bg-cream"
          style={{ animation: "orb-pulse 1.6s ease-in-out infinite", boxShadow: "0 0 12px #F6C544" }}
        />
      </span>
      <span className="flex flex-col leading-tight pr-2">
        <span className="text-sm font-bold tracking-wide">TALK WITH SANDRA</span>
        <span className="text-[11px] text-cream/75">Need Support? Connect With Us</span>
      </span>
    </button>
  );
}
