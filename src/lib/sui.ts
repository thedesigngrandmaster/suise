import { Transaction } from "@mysten/sui/transactions";

/** Network the app talks to. Testnet keeps handovers free to seal. */
export const SUI_NETWORK = (import.meta.env.VITE_SUI_NETWORK as string) || "testnet";

/** Optional deployed Move package. When empty we fall back to a plain seal transfer. */
export const SUI_PACKAGE_ID = (import.meta.env.VITE_SUI_PACKAGE_ID as string) || "";

/** Amount (MIST) attached to an ownership seal transaction. 0.001 SUI. */
const SEAL_AMOUNT = 1_000_000n;

export function shortAddress(address?: string | null, size = 4) {
  if (!address) return "";
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

export function formatSui(mist?: string | number | bigint | null, digits = 4) {
  if (mist === null || mist === undefined) return "0";
  const value = Number(BigInt(mist)) / 1e9;
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/**
 * Builds the transaction that seals a folder handover on Sui.
 * Uses the deployed Move package when configured, otherwise sends a tiny
 * signed transfer to the recipient so the handover has an on-chain receipt.
 */
export function buildOwnershipSealTx(params: {
  recipient: string;
  albumId: string;
}): Transaction {
  const tx = new Transaction();

  if (SUI_PACKAGE_ID) {
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::suiseSC::seal_transfer`,
      arguments: [
        tx.pure.string(params.albumId),
        tx.pure.address(params.recipient),
      ],
    });
    return tx;
  }

  const [coin] = tx.splitCoins(tx.gas, [SEAL_AMOUNT]);
  tx.transferObjects([coin], params.recipient);
  return tx;
}
