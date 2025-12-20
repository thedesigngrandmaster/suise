
export async function getZkLoginSignature(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("getZkLoginSignature can only run in the browser");
  }

  const suiWallet = (window as any).suiWallet;
  if (!suiWallet) {
    throw new Error("No Sui wallet found. Please install or connect a Sui wallet.");
  }

  const message = "Sign this message to log in";

  // Use the wallet's signMessage function
  const signed = await suiWallet.signMessage({
    message,
  });

  // The wallet may return an object with a 'signature' property
  // Check your wallet's API if different
  if (!signed || !signed.signature) {
    throw new Error("Failed to sign the message with Sui wallet.");
  }

  return signed.signature;
}

/**
 * Example helper to get the connected Sui address
 */
export async function getSuiAddress(): Promise<string> {
  const suiWallet = (window as any).suiWallet;
  if (!suiWallet) throw new Error("No Sui wallet found");

  const accounts = await suiWallet.connect();
  if (!accounts || accounts.length === 0) {
    throw new Error("No Sui accounts found");
  }

  return accounts[0].address;
}
