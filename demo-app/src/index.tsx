import React from "react";
import ReactDOM from "react-dom/client";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();
const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networks}
        defaultNetwork="testnet"
        children={<WalletProvider children={<App />} />}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
