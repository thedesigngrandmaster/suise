import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#0E131F]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FCFCFC]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            aria-label="Suise home"
          >
            <BrandHeader />
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 prose prose-neutral">
        <h1 className="font-bricolage text-3xl font-bold tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: August 13, 2026
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">What this covers</h2>
          <p>
            Suise is a shared memory product. This policy explains what information we
            collect, why we collect it, and how you can control it. We write it in plain
            language so you can actually read it.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Information we collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account data</strong> — email, display name, username, and optional
              profile photo when you sign up.
            </li>
            <li>
              <strong>Content you create</strong> — folders (albums), photos, captions,
              chats, and connection requests.
            </li>
            <li>
              <strong>Usage data</strong> — basic product analytics (pages viewed, feature
              use) so we can fix bugs and improve the product. We do not sell this.
            </li>
            <li>
              <strong>Wallet addresses</strong> — only if you choose to connect a wallet
              for optional on-chain ownership seals.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">How we use it</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To run the product (auth, storage, messaging, ownership transfers).</li>
            <li>To show you your own content and content shared with you.</li>
            <li>To send essential service messages (password resets, security notices).</li>
            <li>To keep the platform safe (abuse prevention, rate limits).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Who can see your content</h2>
          <p>
            Private folders are visible only to you and people you invite. Public folders
            appear on Explore. Ownership transfers move control of a folder to the new
            owner; that is intentional product behavior, not a privacy leak.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Third parties</h2>
          <p>
            We use Supabase for authentication and database, and optional blockchain
            networks (currently Sui) when you seal an ownership transfer. Those providers
            process data only to deliver the service. We do not sell personal data to
            advertisers.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Your choices</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Update or delete profile information in Settings.</li>
            <li>Leave or transfer folders you own.</li>
            <li>Disconnect a wallet at any time.</li>
            <li>
              Request account deletion by contacting us — we will remove personal data
              except what we must keep for legal or safety reasons.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Security</h2>
          <p>
            We use industry-standard transport encryption (HTTPS), access controls, and
            row-level security on the database. No system is perfect; report issues to us
            promptly.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Children</h2>
          <p>
            Suise is not directed at children under 13. If you believe a child has created
            an account, contact us and we will remove it.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Changes</h2>
          <p>
            If we make material changes, we will update the date above and, when
            appropriate, notify you in the product.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            Questions about privacy: use the in-app feedback channel or the contact method
            listed on the Suise website.
          </p>
        </section>
      </main>
    </div>
  );
}
