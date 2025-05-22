import { readFileSync } from "fs";
import { homedir } from "os";
import * as yaml from "js-yaml";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";
import chalk from "chalk";

/**
 * Reads the Sui CLI config and keystore to get the active Ed25519Keypair.
 * Throws if the config or key is missing.
 */
export function getActiveSuiKeypair(): Ed25519Keypair {
  const configPath = `${homedir()}/.sui/sui_config/client.yaml`;
  const keystorePath = `${homedir()}/.sui/sui_config/sui.keystore`;

  console.log(chalk.blue("Reading Sui CLI config from:"), configPath);
  console.log(chalk.blue("Reading keystore from:"), keystorePath);

  // Read and parse the config file
  let config: any;
  try {
    const configContent = readFileSync(configPath, "utf-8");
    config = yaml.load(configContent);
    console.log(chalk.green("Successfully loaded config"));
  } catch (err) {
    throw new Error(`Failed to read Sui CLI config at ${configPath}`);
  }

  const activeAddress = config?.active_address;
  if (!activeAddress) {
    throw new Error("No active address found in Sui CLI config");
  }
  console.log(chalk.blue("Active address:"), activeAddress);

  // Read and parse the keystore file (array of base64 private keys)
  let keystore: string[];
  try {
    const keystoreContent = readFileSync(keystorePath, "utf-8");
    keystore = JSON.parse(keystoreContent);
    console.log(chalk.green("Successfully loaded keystore"));
    console.log(chalk.blue("Number of keys in keystore:"), keystore.length);
  } catch (err) {
    throw new Error(`Failed to read Sui CLI keystore at ${keystorePath}`);
  }

  // Find the private key for the active address
  for (const b64 of keystore) {
    try {
      // The keystore contains the private key in a specific format
      // We need to decode it and create a keypair
      const privateKey = fromB64(b64);
      // The first byte is a flag, we need to skip it
      const actualPrivateKey = privateKey.slice(1);
      const keypair = Ed25519Keypair.fromSecretKey(actualPrivateKey);
      const address = keypair.getPublicKey().toSuiAddress();
      console.log(chalk.blue("Checking key with address:"), address);
      if (address === activeAddress) {
        console.log(chalk.green("Found matching keypair!"));
        return keypair;
      }
    } catch (err) {
      console.log(
        chalk.yellow("Failed to load keypair from keystore entry:", err)
      );
    }
  }

  throw new Error(
    `No private key found in keystore for active address: ${activeAddress}`
  );
}
