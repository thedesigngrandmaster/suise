import { serve } from "https://deno.land/std/http/server.ts";
import nacl from "npm:tweetnacl";
import bs58 from "npm:bs58";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { publicKey, signature, nonce } = await req.json();

  if (!publicKey || !signature || !nonce) {
    return new Response("Missing fields", { status: 400 });
  }

  const message = new TextEncoder().encode(
    `Sign in to Suise\nNonce: ${nonce}`
  );

  const isValid = nacl.sign.detached.verify(
    message,
    new Uint8Array(signature),
    bs58.decode(publicKey)
  );

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check nonce
  const { data: nonceRow } = await supabase
    .from("wallet_nonces")
    .select("*")
    .eq("wallet_address", publicKey)
    .single();

  if (!nonceRow || nonceRow.nonce !== nonce || new Date(nonceRow.expires_at) < new Date()) {
    return new Response("Invalid or expired nonce", { status: 401 });
  }

  // Remove nonce after use
  await supabase.from("wallet_nonces").delete().eq("wallet_address", publicKey);

  // Find or create user
  const { data: walletUser } = await supabase
    .from("wallet_users")
    .select("user_id")
    .eq("wallet_address", publicKey)
    .single();

  let userId = walletUser?.user_id;

  if (!userId) {
    const { data: newUser } = await supabase.auth.admin.createUser({
      email: `${publicKey}@wallet.suise`,
      email_confirm: true,
    });

    userId = newUser.user.id;

    await supabase.from("wallet_users").insert({
      wallet_type: "phantom",
      wallet_address: publicKey,
      user_id: userId,
    });
  }

  // Create session
  const { data: session } = await supabase.auth.admin.createSession({ user_id: userId });

  return new Response(JSON.stringify(session), {
    headers: { "Content-Type": "application/json" },
  });
});
