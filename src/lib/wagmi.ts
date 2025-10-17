import { publicEnv } from "@/publicEnv";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "ECP share",
  projectId: publicEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [base],
  ssr: true,
});
