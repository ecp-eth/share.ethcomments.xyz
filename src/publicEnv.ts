import { HexSchema } from "@ecp.eth/sdk/core/schemas";
import { never } from "./lib/utils";

/**
 * Public environment variables.
 */
export const publicEnv = {
  NEXT_PUBLIC_COMMENTS_INDEXER_URL:
    process.env.NEXT_PUBLIC_COMMENTS_INDEXER_URL ??
    "https://api.ethcomments.xyz",
  NEXT_PUBLIC_SIGNER_URL:
    process.env.NEXT_PUBLIC_SIGNER_URL ??
    "https://share-ethcomments-signer-service.vercel.app",
  NEXT_PUBLIC_PINATA_GATEWAY_URL:
    process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ??
    "https://gateway.pinata.cloud",
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    never("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"),
  NEXT_PUBLIC_APP_SIGNER_ADDRESS: HexSchema.parse(
    process.env.NEXT_PUBLIC_APP_SIGNER_ADDRESS ??
      never("Missing NEXT_PUBLIC_APP_SIGNER_ADDRESS")
  ),
  NEXT_PUBLIC_CHAIN_ID: process.env.CHAIN_ID ?? 8453,
} as const;
