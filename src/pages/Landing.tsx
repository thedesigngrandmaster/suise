import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SoftOrb } from "@/components/landing/SoftOrb";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import {
  Archive,
  Compass,
  Users,
  MessageCircle,
  Wallet,
  Sparkles,
  Share2,
  ArrowRightLeft,
  FolderPlus,
} from "lucide-react";

const steps = [
  {
    icon: FolderPlus,
    title: "Create a shared folder",
    body: "Start an album for a trip, a night out, a whole chapter. Invite the people who were there.",
  },
  {
    icon: Share2,
    title: "Contribute together",
    body: "Everyone adds their memories. Contribution is tracked, so the people who show up get credit.",
  },
  {
    icon: ArrowRightLeft,
    title: "Transfer ownership",
    body: "Hand an album over for real. Ownership moves on Sui — quietly, safely, in one deliberate step.",
  },
];

const features = [
  { icon: Archive, title: "Vault", body: "Your private memories, beautifully organised." },
  { icon: Compass, title: "Explore", body: "Discover public albums from the community." },
  { icon: Users, title: "Connect", body: "Follow people and co-own albums together." },
  { icon: MessageCircle, title: "Chat", body: "Talk about the moments as they happen." },
  { icon: Wallet, title: "Wallet", body: "A calm, native surface for what you own." },
  { icon: Sparkles, title: "Earn", body: "Rewards for contributing to shared albums." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-bricolage text-xl font-bold tracking-tight">
            Suise
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign in
            </Button>
            <Button
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => navigate("/auth")}
            >
              Get started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="soft-surface pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="soft-chip mb-6 text-secondary">
              <Sparkles className="h-4 w-4" />
              Shared memories, real ownership
            </span>
            <h1 className="font-bricolage text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Memories that can
              <br />
              truly be shared —
              <br />
              <span className="text-secondary">and handed over.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Suise turns albums into shared folders anyone can contribute to.
              When a moment belongs to someone else, you can transfer the whole
              album to them — ownership moves for real, secured on Sui.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-secondary px-7 text-secondary-foreground hover:bg-secondary/90"
                onClick={() => navigate("/auth")}
              >
                Start your vault
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full border border-border/70 bg-card px-7"
                onClick={() => navigate("/explore")}
              >
                Explore albums
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" /> Built on Sui
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-secondary" /> No crypto jargon
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" /> 48h hackathon → real product
              </span>
            </div>
          </div>

          <div className="lg:pl-8">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* How ownership works */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <h2 className="font-bricolage text-3xl font-bold tracking-tight sm:text-4xl">
          How ownership works
        </h2>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Three quiet steps. No wallets to manage, no jargon to learn.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <article key={step.title} className="soft-card soft-lift p-6">
              <SoftOrb className="mb-6 aspect-[16/10] w-full" />
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/12 text-secondary">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-bricolage text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-5 pb-16 lg:pb-24">
        <div className="soft-card p-6 sm:p-10">
          <h2 className="font-bricolage text-2xl font-bold tracking-tight sm:text-3xl">
            Everything in one calm place
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="soft-lift rounded-2xl border border-border/60 bg-background p-5"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community strip */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border/60 bg-card px-6 py-8 sm:px-10">
          {[
            ["12k+", "memories preserved"],
            ["3.4k", "shared folders"],
            ["870", "ownership transfers"],
            ["100%", "on-chain, invisible"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-bricolage text-2xl font-bold text-secondary">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-5 pb-20">
        <div className="soft-surface mx-auto max-w-6xl rounded-[2rem] px-6 py-16 text-center sm:px-10">
          <h2 className="mx-auto max-w-2xl font-bricolage text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Keep the moment. Share the folder. Pass it on.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Your first vault takes about a minute to set up.
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full bg-secondary px-8 text-secondary-foreground hover:bg-secondary/90"
            onClick={() => navigate("/auth")}
          >
            Create your account
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/50 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-bricolage font-bold text-foreground">Suise</span>
          <span>© {new Date().getFullYear()} Suise. Memories, shared.</span>
        </div>
      </footer>
    </div>
  );
}