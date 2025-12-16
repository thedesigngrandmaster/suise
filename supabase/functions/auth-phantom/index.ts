import { serve } from "https://deno.land/std/http/server.ts";
import nacl from "https://esm.sh/tweetnacl";
import bs58 from "https://esm.sh/bs58";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { publicKey, signature, message, nonce } = await req.json();

  // 1. Verify nonce
  const { data: nonceRow } = await supabase
    .from("auth_nonces")
    .select("*")
    .eq("address", publicKey)
    .eq("nonce", nonce)
    .single();

  if (!nonceRow) {
    return new Response("Invalid nonce", { status: 401 });
  }

  await supabase.from("auth_nonces").delete().eq("id", nonceRow.id);

  // 2. Verify signature
  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(message),
    new Uint8Array(signature),
    bs58.decode(publicKey)
  );

  if (!verified) {
    return new Response("Invalid signature", { status: 401 });
  }

  // 3. Create user
  await supabase.auth.admin.createUser({
    email: `${publicKey}@phantom.suise`,
    user_metadata: { wallet: publicKey, provider: "phantom" },
    email_confirm: true,
  });

  // 4. Return session
  const session = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: `${publicKey}@phantom.suise`,
  });

  return new Response(JSON.stringify(session), {
    headers: { "Content-Type": "application/json" },
  });
});
