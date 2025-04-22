import { SuiPulse } from "@suipulse/sdk";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient } from "@mysten/sui.js/client";
import { createContext, useContext } from "react";

const PACKAGE_ID = process.env.REACT_APP_PACKAGE_ID || "YOUR_PACKAGE_ID";

export class SuiPulseService {
  private static instance: SuiPulseService;
  private suiPulse: SuiPulse | null = null;

  private constructor() {}

  static getInstance(): SuiPulseService {
    if (!SuiPulseService.instance) {
      SuiPulseService.instance = new SuiPulseService();
    }
    return SuiPulseService.instance;
  }

  initialize(keypair: Ed25519Keypair) {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
    this.suiPulse = new SuiPulse(client, PACKAGE_ID, keypair);
    return this.suiPulse;
  }

  getSuiPulse(): SuiPulse {
    if (!this.suiPulse) {
      throw new Error("SuiPulse not initialized");
    }
    return this.suiPulse;
  }

  cleanup() {
    if (this.suiPulse) {
      this.suiPulse.cleanup();
      this.suiPulse = null;
    }
  }
}

export const SuiPulseContext = createContext<SuiPulseService | null>(null);

export const useSuiPulseService = () => {
  const context = useContext(SuiPulseContext);
  if (!context) {
    throw new Error(
      "useSuiPulseService must be used within a SuiPulseProvider"
    );
  }
  return context;
};
