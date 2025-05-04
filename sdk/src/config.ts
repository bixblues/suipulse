export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  CUSTOM = "custom",
}

export interface NetworkConfig {
  packageId: string;
  url: string;
}

export const DEFAULT_NETWORKS: Record<Network, NetworkConfig> = {
  [Network.MAINNET]: {
    packageId: "0x...", // Replace with mainnet package ID when available
    url: "https://fullnode.mainnet.sui.io:443",
  },
  [Network.TESTNET]: {
    packageId:
      "0x94d890a5677922d1f2e51724ba9439a422235bc8e8de0ad7d8b4e06827c8d750",
    url: "https://fullnode.testnet.sui.io:443",
  },
  [Network.DEVNET]: {
    packageId: "0x...", // Replace with devnet package ID when available
    url: "https://fullnode.devnet.sui.io:443",
  },
  [Network.CUSTOM]: {
    packageId: "",
    url: "",
  },
};

export class SuiPulseConfig {
  private static instance: SuiPulseConfig;
  private network: Network;
  private customConfig?: NetworkConfig;

  private constructor() {
    // Default to testnet
    this.network = Network.TESTNET;
  }

  public static getInstance(): SuiPulseConfig {
    if (!SuiPulseConfig.instance) {
      SuiPulseConfig.instance = new SuiPulseConfig();
    }
    return SuiPulseConfig.instance;
  }

  public setNetwork(network: Network): void {
    this.network = network;
  }

  public setCustomConfig(config: NetworkConfig): void {
    this.network = Network.CUSTOM;
    this.customConfig = config;
  }

  public getConfig(): NetworkConfig {
    if (this.network === Network.CUSTOM && this.customConfig) {
      return this.customConfig;
    }
    return DEFAULT_NETWORKS[this.network];
  }

  public getPackageId(): string {
    return this.getConfig().packageId;
  }

  public getUrl(): string {
    return this.getConfig().url;
  }
}
