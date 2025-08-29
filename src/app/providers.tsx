"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { Toaster } from "sonner";
import { base } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={base}>
          {children}
          <Toaster position="top-center" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
