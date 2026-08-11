import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const REPLIES = [
  "Hey! Thanks for reaching out 👋",
  "Appreciate the message — what are you working on lately?",
  "Nice to meet you! Feel free to check out my folders.",
  "Thanks for connecting! Always happy to swap memories.",
  "Hi there! Glad you found me here.",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    // 1. Accept pending connection requests addressed to a bot.
    const { data: accepted } = await admin
      .from("connections")
      .update({ status: "accepted" })
      .in("addressee_id", botIds)
      .eq("status", "pending")
      .select("id");

    // 2. Reply to unread messages sent to a bot.
    const { data: unread } = await admin
      .from("messages")
      .select("id, sender_id, receiver_id")
      .in("receiver_id", botIds)
      .eq("read", false)
      .order("created_at", { ascending: true })
      .limit(50);

    let replied = 0;
    for (const msg of unread ?? []) {
      await admin.from("messages").update({ read: true }).eq("id", msg.id);
      await admin.from("messages").insert({
        sender_id: msg.receiver_id,
        receiver_id: msg.sender_id,
        content: REPLIES[Math.floor(Math.random() * REPLIES.length)],
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
