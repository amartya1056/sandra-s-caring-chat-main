import { MessageCircle, Phone } from "lucide-react";

export function FloatingFabs({ onChatClick }: { onChatClick: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href="#"
        aria-label="WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"
      >
        <Phone className="h-6 w-6" />
      </a>
      <button
        onClick={onChatClick}
        aria-label="Open chat"
        className="grid h-14 w-14 place-items-center rounded-full bg-cream text-deep-green shadow-xl transition hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
