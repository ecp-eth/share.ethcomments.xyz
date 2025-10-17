import { publicEnv } from "@/publicEnv";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import * as chains from "wagmi/chains";
import { getChainById, never } from "./utils";

const selectedChain =
  getChainById(
    Number(publicEnv.NEXT_PUBLIC_CHAIN_ID) || 8453,
    Object.values(chains)
  ) ?? never("Chain not supported");

export const config = getDefaultConfig({
  appName: "ECP share",
  projectId: publicEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [selectedChain],
  ssr: true,
});
