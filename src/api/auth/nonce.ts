import { supabase } from "@/integrations/supabase/client";

export async function getNonce(address: string) {
  const nonce = crypto.randomUUID();

  await supabase.from("auth_nonces").insert({
    address,
    nonce,
  });

  return nonce;
}
