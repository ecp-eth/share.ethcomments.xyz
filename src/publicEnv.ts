export const publicEnv = {
  NEXT_PUBLIC_COMMENTS_INDEXER_URL:
    process.env.NEXT_PUBLIC_COMMENTS_INDEXER_URL ||
    "https://api.ethcomments.xyz",
  NEXT_PUBLIC_PINATA_GATEWAY_URL:
    process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
    "https://gateway.pinata.cloud",
} as const;
