import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!
  );

  const { address, signature, message, nonce } = await req.json();

  // 1. Verify nonce exists
  const { data: nonceRow } = await supabase
    .from("auth_nonces")
    .select("*")
    .eq("address", address)
    .eq("nonce", nonce)
    .single();

  if (!nonceRow) {
    return new Response("Invalid nonce", { status: 401 });
  }

  // 2. Delete nonce (one-time use)
  await supabase.from("auth_nonces").delete().eq("id", nonceRow.id);

  // 3. Create Supabase user
  const { data, error } = await supabase.auth.admin.createUser({
    email: `${address}@slush.suise`,
    user_metadata: { wallet: address, provider: "slush" },
    email_confirm: true,
  });

  if (error && !error.message.includes("already registered")) {
    return new Response(error.message, { status: 400 });
  }

  // 4. Create session
  const session = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: `${address}@slush.suise`,
  });

  return new Response(JSON.stringify(session), {
    headers: { "Content-Type": "application/json" },
  });
});
