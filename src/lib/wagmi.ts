import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";

export const BUILDER_DATA_SUFFIX = "0x" as `0x${string}`;

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: "FateBook",
      preference: "eoaOnly",
    }),
  ],
  ssr: true,
  dataSuffix: BUILDER_DATA_SUFFIX,
  transports: {
    [base.id]: http(),
  },
});
