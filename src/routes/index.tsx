import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { ExpertSearch } from "@/components/site/ExpertSearch";
import { ExpertGrid } from "@/components/site/ExpertGrid";
import { FloatingFabs } from "@/components/site/FloatingFabs";
import { SandraLauncher } from "@/components/sandra/SandraLauncher";
import { SandraPopup } from "@/components/sandra/SandraPopup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Positive Mind Care — Expert Mental Health Care" },
      {
        name: "description",
        content:
          "Trusted psychiatrists and therapists offering online and in-clinic mental health care across India. Book an expert in minutes.",
      },
      { property: "og:title", content: "Positive Mind Care — Expert Mental Health Care" },
      {
        property: "og:description",
        content: "Compassionate, evidence-based mental health care, online or in-clinic.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);
  return (
    <main className="relative min-h-screen">
      <Nav />
      <Hero />
      <ExpertSearch />
      <ExpertGrid />
      <SandraLauncher onOpen={() => setOpen(true)} />
      <FloatingFabs onChatClick={() => setOpen(true)} />
      <SandraPopup open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
