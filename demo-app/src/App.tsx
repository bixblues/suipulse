import React, { useEffect } from "react";
import { ConnectButton, useCurrentWallet } from "@mysten/dapp-kit";
import { SuiPulseContext, SuiPulseService } from "./services/suipulse.ts";
import { DeFiDashboard } from "./components/DeFiDashboard/DeFiDashboard.tsx";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

function App() {
  const { currentWallet } = useCurrentWallet();
  const suiPulseService = SuiPulseService.getInstance();

  useEffect(() => {
    if (currentWallet?.accounts[0]) {
      // Create a new keypair for the session
      const keypair = new Ed25519Keypair();
      suiPulseService.initialize(keypair);
    }
    return () => {
      suiPulseService.cleanup();
    };
  }, [currentWallet, suiPulseService]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">SuiPulse Demo</h1>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentWallet ? (
          <SuiPulseContext.Provider value={suiPulseService}>
            <DeFiDashboard />
          </SuiPulseContext.Provider>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to SuiPulse Demo
            </h2>
            <p className="text-gray-500 mb-8">
              Connect your wallet to start exploring decentralized data streams.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
