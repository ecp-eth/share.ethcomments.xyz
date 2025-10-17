import { never } from "./lib/utils";

/**
 * Non public environment variables.
 */
export const env = {
  PINATA_JWT: process.env.PINATA_JWT ?? never(),
} as const;
