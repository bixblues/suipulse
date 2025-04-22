import React from "react";
import ReactDOM from "react-dom/client";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <SuiClientProvider
      networks={{
        testnet: { url: getFullnodeUrl("testnet") },
      }}
      defaultNetwork="testnet"
    >
      <WalletProvider>
        <App />
      </WalletProvider>
    </SuiClientProvider>
  </React.StrictMode>
);
