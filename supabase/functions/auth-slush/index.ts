import { serve } from "https://deno.land/std/http/server.ts";
import { verifyMessage } from "npm:@mysten/sui.js/cryptography";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { address, message, signature } = await req.json();

  if (!address || !message || !signature) {
    return new Response("Missing fields", { status: 400 });
  }

  const isValid = verifyMessage(message, signature, address);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: walletUser } = await supabase
    .from("wallet_users")
    .select("user_id")
    .eq("wallet_address", address)
    .single();

  let userId = walletUser?.user_id;

  if (!userId) {
    const { data: newUser } = await supabase.auth.admin.createUser({
      email: `${address}@wallet.suise`,
      email_confirm: true,
    });

    userId = newUser.user.id;

    await supabase.from("wallet_users").insert({
      wallet_type: "slush",
      wallet_address: address,
      user_id: userId,
    });
  }

  const { data: session } = await supabase.auth.admin.createSession({ user_id: userId });

  return new Response(JSON.stringify(session), {
    headers: { "Content-Type": "application/json" },
  });
});
