import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "ECP share",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID", // Get this from https://cloud.walletconnect.com
  chains: [base, mainnet, sepolia],
  ssr: true,
});
