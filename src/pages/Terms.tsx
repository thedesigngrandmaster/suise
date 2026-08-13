import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-bricolage text-3xl font-bold tracking-tight mb-2">
          Terms of Use
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: August 13, 2026
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Agreement</h2>
          <p>
            By using Suise you agree to these terms. If you do not agree, do not use the
            service.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">What Suise is</h2>
          <p>
            Suise lets people create shared photo folders and transfer ownership of those
            folders to someone else. Optional on-chain seals may record a transfer on the
            Sui network. Suise is not a bank, marketplace, or investment product.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Your account</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate account information.</li>
            <li>You are responsible for activity under your account.</li>
            <li>You must be at least 13 years old (or the age required in your country).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Content and ownership</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              You keep rights to content you upload, subject to the licenses needed for us
              to host and display it.
            </li>
            <li>
              When you transfer folder ownership, control of that folder (including the
              ability to manage access and delete) moves to the new owner as designed.
            </li>
            <li>
              Do not upload content you do not have the right to share, or illegal,
              harmful, or abusive material.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Harass, threaten, or impersonate others.</li>
            <li>Attempt to break security, scrape at abusive rates, or reverse-engineer the service beyond permitted law.</li>
            <li>Use Suise to distribute malware, spam, or illegal goods.</li>
            <li>Circumvent access controls or ownership rules.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Wallets and blockchain</h2>
          <p>
            Connecting a wallet is optional. On-chain actions are irreversible once
            confirmed by the network. We are not responsible for lost keys, failed
            transactions, or network fees. Read wallet prompts carefully before signing.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Service changes and availability</h2>
          <p>
            We may change or discontinue features. We aim for reliability but do not
            guarantee uninterrupted access.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p>
            Suise is provided &quot;as is.&quot; To the fullest extent allowed by law, we
            disclaim warranties of merchantability, fitness for a particular purpose, and
            non-infringement. Ownership transfers inside the product are a software
            feature; they are not legal advice about property law in your jurisdiction.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Limitation of liability</h2>
          <p>
            To the fullest extent allowed by law, Suise and its operators are not liable
            for indirect, incidental, or consequential damages, or for loss of content
            beyond a reasonable restoration effort.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Termination</h2>
          <p>
            You may stop using Suise at any time. We may suspend or terminate accounts that
            violate these terms or create risk for other users.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Governing law</h2>
          <p>
            These terms are governed by the laws applicable to the operators of Suise,
            without regard to conflict-of-law rules. Local mandatory consumer protections
            still apply where they cannot be waived.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            Questions about these terms: use the in-app feedback channel or the contact
            method listed on the Suise website.
          </p>
        </section>
      </main>
    </div>
  );
}
