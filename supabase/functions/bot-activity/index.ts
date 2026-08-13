import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Classify a user message so bots reply with the right intent. */
function classifyMessage(raw: string): "greeting" | "question" | "purchase" | "general" {
  const text = raw.trim().toLowerCase();

  const purchasePatterns = [
    /\b(buy|purchase|pay for|how much|price|cost|sell me|want to buy)\b/,
    /\b(album|folder|collection)\b.*\b(buy|purchase|sell|price|cost)\b/,
    /\b(buy|purchase|sell|price|cost)\b.*\b(album|folder|collection)\b/,
  ];
  if (purchasePatterns.some((p) => p.test(text))) return "purchase";

  const greetingPatterns = [
    /^(hi|hello|hey|hiya|yo|sup|good (morning|afternoon|evening)|howdy)\b/,
    /^(hi|hello|hey)[\s!,.]*$/,
  ];
  if (greetingPatterns.some((p) => p.test(text))) return "greeting";

  if (
    text.includes("?") ||
    /^(what|who|where|when|why|how|can you|do you|is there|are you)\b/.test(text)
  ) {
    return "question";
  }

  return "general";
}

const REPLIES: Record<"greeting" | "question" | "purchase" | "general", string[]> = {
  greeting: [
    "Hey! Thanks for saying hi 👋",
    "Hello! Glad you're here — feel free to look around my folders.",
    "Hi there! Always happy to connect over shared memories.",
    "Hey! Nice to meet you.",
  ],
  question: [
    "Good question — the short answer is: open a folder, invite people, and you can hand ownership over for real when you're ready.",
    "Happy to help. Most people start by creating a shared folder and inviting the people who were there.",
    "Ask away anytime. If it's about a specific folder, open it and use the ownership options there.",
    "Great question. The core idea is simple: shared albums where ownership can actually move to someone else.",
  ],
  purchase: [
    "I don't sell folders through chat. If an owner wants to hand something over, they use the transfer ownership flow in the app — it's free and deliberate.",
    "Album ownership isn't bought in chat. The owner can transfer it to you directly from the folder when they're ready.",
    "There's no purchase button here. Real ownership moves only when the current owner chooses to hand the folder over in Suise.",
    "Thanks for asking — we keep ownership transfers intentional. Ask the owner to use Hand over on the folder instead of buying through chat.",
  ],
  general: [
    "Thanks for the message — what are you working on lately?",
    "Appreciate you reaching out. Feel free to check out my folders.",
    "Nice to meet you! Always happy to swap memories.",
    "Thanks for connecting!",
  ],
};

function pickReply(kind: keyof typeof REPLIES): string {
  const list = REPLIES[kind];
  return list[Math.floor(Math.random() * list.length)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: bots } = await admin
      .from("profiles")
      .select("id")
      .eq("is_bot", true);

    const botIds = (bots ?? []).map((b: { id: string }) => b.id);
    if (botIds.length === 0) {
      return new Response(JSON.stringify({ accepted: 0, replied: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: accepted } = await admin
      .from("connections")
      .update({ status: "accepted" })
      .in("addressee_id", botIds)
      .eq("status", "pending")
      .select("id");

    const { data: unread } = await admin
      .from("messages")
      .select("id, sender_id, receiver_id, content")
      .in("receiver_id", botIds)
      .eq("read", false)
      .order("created_at", { ascending: true })
      .limit(50);

    let replied = 0;
    for (const msg of unread ?? []) {
      await admin.from("messages").update({ read: true }).eq("id", msg.id);

      const kind = classifyMessage(msg.content ?? "");
      const content = pickReply(kind);

      await admin.from("messages").insert({
        sender_id: msg.receiver_id,
        receiver_id: msg.sender_id,
        content,
      });
      replied++;
    }

    return new Response(
      JSON.stringify({ accepted: accepted?.length ?? 0, replied }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
