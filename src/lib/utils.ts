import type { Chain } from "wagmi/chains";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function never(msg: string = "Unreachable code"): never {
  throw new Error(msg);
}

/**
 * Get a chain by id
 * @param id
 * @param chains
 * @returns
 */
export function getChainById<TChain extends Chain>(
  id: number,
  chains: Readonly<TChain[]>
): TChain | undefined {
  for (const [, chain] of Object.entries(chains)) {
    if (chain.id === id) {
      return chain;
    }
  }
  return undefined;
}
