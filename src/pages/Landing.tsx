import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import {
  FolderPlus,
  UserPlus,
  ArrowRightLeft,
  Heart,
  Users,
  Camera,
  MessageCircle,
  Compass,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    n: "1",
    icon: FolderPlus,
    title: "Create a folder",
    body: "Start a shared album for a trip, a relationship, or any chapter you want to keep.",
  },
  {
    n: "2",
    icon: UserPlus,
    title: "Invite people",
    body: "Bring in the people who were there. Everyone can add memories to the same place.",
  },
  {
    n: "3",
    icon: ArrowRightLeft,
    title: "Hand it over",
    body: "When the time is right, transfer ownership for real. The new owner takes the lead.",
  },
];

const audiences = [
  {
    icon: Heart,
    title: "Couples",
    body: "Build a shared album of your life together — and hand it over when it matters.",
  },
  {
    icon: Users,
    title: "Friends",
    body: "Collect trip memories in one folder. Ownership can move to whoever keeps the story.",
  },
  {
    icon: Camera,
    title: "Creators",
    body: "Grow collections you may later sell or pass on. Real ownership, not just access.",
  },
];

const productMoments = [
  {
    icon: FolderPlus,
    title: "Shared folder view",
    body: "Everyone's photos in one calm place. Contribution is visible without noise.",
  },
  {
    icon: ArrowRightLeft,
    title: "Ownership transfer",
    body: "A clear confirmation step. When you hand a folder over, control moves with it.",
  },
  {
    icon: Compass,
    title: "Explore albums",
    body: "Discover public folders from the community when you want something lighter.",
  },
  {
    icon: MessageCircle,
    title: "Chat in context",
    body: "Talk about the moments inside a folder, without leaving the memory behind.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#0E131F]">
      <header className="sticky top-0 z-40 border-b border-black/[0.04] bg-[#FCFCFC]/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5"
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9C76F5] rounded-lg"
            aria-label="Suise home"
          >
            <BrandHeader />
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              className="text-[#0E131F]/80 hover:text-[#0E131F]"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
            <Button
              className="rounded-full bg-[#9C76F5] text-white hover:bg-[#8B63E8] shadow-none"
              onClick={() => navigate("/auth")}
            >
              Get started
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-[#9C76F5]/25 bg-[#9C76F5]/8 px-3 py-1 text-xs font-medium text-[#0E131F]/80">
              Shared memories, real ownership
            </span>
            <h1 className="mt-5 font-bricolage text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Memories that can truly be shared
              <br className="hidden sm:block" />
              <span className="text-[#0E131F]/90"> and handed over.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#0E131F]/65 lg:mx-0">
              Create a shared album with the people who were there. When you're ready,
              pass the whole folder to someone else — for real, not just as a share link.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full bg-[#9C76F5] px-7 text-white hover:bg-[#8B63E8]"
                onClick={() => navigate("/auth")}
              >
                Start your vault
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-[#0E131F]/12 bg-transparent"
                onClick={() => {
                  document.getElementById("how-ownership")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See how ownership works
              </Button>
            </div>
            <p className="mt-5 text-xs text-[#0E131F]/45">
              Built on Sui · No crypto jargon · Real ownership transfer
            </p>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div
                className="absolute -inset-8 rounded-[2.5rem] bg-[#9C76F5]/10 blur-3xl"
                aria-hidden
              />
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.04] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
            Why this exists
          </h2>
          <p className="mt-3 max-w-2xl text-[#0E131F]/65 leading-relaxed">
            In most apps, the person who creates an album stays the owner forever. Share
            links don't change that. Suise lets ownership move when life does.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-[#FCFCFC] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0E131F]/4">
                Traditional apps
              </p>
              <p className="mt-3 text-lg font-semibold">Ownership stays put</p>
              <p className="mt-2 text-sm text-[#0E131F]/6">
                You can invite people and send links, but the original uploader keeps
                control. Leaving, selling, or handing something over isn't really possible.
              </p>
            </div>
            <div className="rounded-2xl border border-[#9C76F5]/25 bg-[#9C76F5]/[0.06] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9C76F5]">
                Suise
              </p>
              <p className="mt-3 text-lg font-semibold">Ownership actually moves</p>
              <p className="mt-2 text-sm text-[#0E131F]/6">
                Transfer a folder and the new owner gets real control — including the
                ability to manage access. You can fully step away if that's the agreement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.04]">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="mt-3 max-w-xl text-[#0E131F]/65">
            Three human steps. No jargon required.
          </p>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9C76F5]/15 text-sm font-bold text-[#9C76F5]">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0E131F]/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how-ownership" className="border-t border-black/[0.04] bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
              Ownership that can leave your hands
            </h2>
            <p className="mt-4 text-[#0E131F]/65 leading-relaxed">
              Handing over a folder isn't a share link. The new owner becomes the owner.
              If you both agree, you can fully lose access afterward. That is the point —
              memories that can be given, not only viewed.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
            <div className="flex-1 rounded-2xl border border-black/[0.06] bg-[#FCFCFC] p-5 text-center">
              <p className="text-xs text-[#0E131F]/45 uppercase tracking-wide">You</p>
              <p className="mt-2 font-semibold">Current owner</p>
            </div>
            <div className="flex justify-center text-[#9C76F5]" aria-hidden>
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div className="flex-1 rounded-2xl border border-[#9C76F5]/30 bg-[#9C76F5]/[0.08] p-5 text-center">
              <p className="text-xs text-[#9C76F5] uppercase tracking-wide">Them</p>
              <p className="mt-2 font-semibold">New owner</p>
            </div>
          </div>

          <ul className="mt-8 space-y-3 max-w-xl">
            {[
              "Control of the folder moves in one deliberate step",
              "Memories, history, and co-owners travel with it",
              "Optional on-chain seal if you want a public receipt",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-[#0E131F]/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9C76F5]" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-black/[0.04]">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
            Who it's for
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl border border-black/[0.06] bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9C76F5]/12">
                  <a.icon className="h-5 w-5 text-[#9C76F5]" />
                </div>
                <h3 className="mt-4 font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0E131F]/65">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.04] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
            Inside the product
          </h2>
          <p className="mt-3 max-w-xl text-[#0E131F]/65">
            Quiet surfaces for real moments — not marketing illustrations.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {productMoments.map((m) => (
              <div
                key={m.title}
                className="flex gap-4 rounded-2xl border border-black/[0.06] bg-[#FCFCFC] p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9C76F5]/12">
                  <m.icon className="h-5 w-5 text-[#9C76F5]" />
                </div>
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-[#0E131F]/65 leading-relaxed">{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.04]">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl rounded-2xl border border-black/[0.06] bg-white p-8">
            <p className="text-sm leading-relaxed text-[#0E131F]/7">
              Built in 48 hours during a Sui hackathon. Placed 4th. The idea of real
              transferable ownership is what still matters.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.04] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center lg:py-24">
          <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
            A shared album you can actually hand over
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[#0E131F]/65">
            Start a vault. Invite the people who matter. Transfer ownership when life asks
            for it.
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full bg-[#9C76F5] px-8 text-white hover:bg-[#8B63E8]"
            onClick={() => navigate("/auth")}
          >
            Start your vault
          </Button>
          <p className="mt-4 text-xs text-[#0E131F]/4">Free to begin. No crypto required to explore.</p>
        </div>
      </section>

      <footer className="border-t border-black/[0.04] bg-[#FCFCFC]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandHeader />
            <p className="mt-2 max-w-xs text-xs text-[#0E131F]/5">
              Shared memories with real ownership transfer.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#0E131F]/6" aria-label="Legal">
            <Link to="/privacy" className="hover:text-[#0E131F] underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-[#0E131F] underline-offset-4 hover:underline">
              Terms
            </Link>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="hover:text-[#0E131F] underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
