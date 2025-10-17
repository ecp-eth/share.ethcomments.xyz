import { never } from "./lib/utils";

/**
 * Public environment variables.
 */
export const publicEnv = {
  NEXT_PUBLIC_COMMENTS_INDEXER_URL:
    process.env.NEXT_PUBLIC_COMMENTS_INDEXER_URL ??
    "https://api.ethcomments.xyz",
  NEXT_PUBLIC_PINATA_GATEWAY_URL:
    process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ??
    "https://gateway.pinata.cloud",
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    never("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"),
} as const;
