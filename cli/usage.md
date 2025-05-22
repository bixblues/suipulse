# SuiPulse CLI Usage Examples

This document provides real-world examples of using the SuiPulse CLI for various use cases.

## 1. Real-time Financial Data Stream

### Overview

Create and manage a real-time financial data stream for tracking SUI/USD price.

### Steps

1. **Create a financial data stream**

   ```bash
   suipulse stream create --metadata financial_metadata.json
   ```

   ```json
   // financial_metadata.json
   {
     "name": "SUI-USD-Price-Stream",
     "description": "Real-time SUI/USD price tracking",
     "tags": ["finance", "price", "sui"],
     "version": "1.0.0"
   }
   ```

2. **Add permission for a trading bot**

   ```bash
   suipulse permission add --id <stream-id> --address <trading-bot-address> --level 0
   ```

3. **Update the stream with price data**

   ```bash
   suipulse stream update --id <stream-id> --data price_update.json
   ```

   ```json
   // price_update.json
   {
     "timestamp": "2024-03-20T12:00:00Z",
     "price": 1.45,
     "volume": 1000000,
     "change_24h": 0.05
   }
   ```

4. **Create a snapshot for historical analysis**

   ```bash
   suipulse snapshot create --stream-id <stream-id>
   ```

5. **Watch the stream for real-time updates**
   ```bash
   suipulse stream watch --id <stream-id>
   ```

## 2. Supply Chain Tracking System

### Overview

Create a comprehensive supply chain tracking system with multiple interconnected streams.

### Steps

1. **Create a batch of streams for different supply chain stages**

   ```bash
   suipulse batch create --config supply_chain_config.json
   ```

   ```json
   // supply_chain_config.json
   {
     "streams": [
       {
         "name": "Manufacturing-Status",
         "description": "Manufacturing process tracking"
       },
       {
         "name": "Shipping-Status",
         "description": "Shipping and logistics tracking"
       },
       {
         "name": "Quality-Control",
         "description": "Quality control checkpoints"
       }
     ],
     "options": {
       "parallel": true
     }
   }
   ```

2. **Compose the streams into a hierarchical structure**

   ```bash
   suipulse stream compose --parent-id <manufacturing-id> --child-id <shipping-id>
   suipulse stream compose --parent-id <shipping-id> --child-id <quality-id>
   ```

3. **Add permissions for different stakeholders**

   ```bash
   suipulse permission add --id <manufacturing-id> --address <manufacturer-address> --level 1
   suipulse permission add --id <shipping-id> --address <logistics-address> --level 1
   suipulse permission add --id <quality-id> --address <qc-address> --level 1
   ```

4. **Update streams with status data**

   ```bash
   suipulse stream update --id <manufacturing-id> --data manufacturing_status.json
   suipulse stream update --id <shipping-id> --data shipping_status.json
   suipulse stream update --id <quality-id> --data quality_status.json
   ```

5. **Create snapshots at key milestones**
   ```bash
   suipulse snapshot create --stream-id <manufacturing-id>
   suipulse snapshot create --stream-id <shipping-id>
   suipulse snapshot create --stream-id <quality-id>
   ```

## 3. NFT Collection Analytics

### Overview

Track and analyze NFT collection metrics in real-time.

### Steps

1. **Create a stream for NFT collection metrics**

   ```bash
   suipulse stream create --metadata nft_analytics_metadata.json
   ```

   ```json
   // nft_analytics_metadata.json
   {
     "name": "SuiPunks-Analytics",
     "description": "Real-time analytics for SuiPunks collection",
     "tags": ["nft", "analytics", "sui"],
     "version": "1.0.0"
   }
   ```

2. **Add permissions for analytics dashboard**

   ```bash
   suipulse permission add --id <stream-id> --address <dashboard-address> --level 0
   ```

3. **Update with collection metrics**

   ```bash
   suipulse stream update --id <stream-id> --data nft_metrics.json
   ```

   ```json
   // nft_metrics.json
   {
     "timestamp": "2024-03-20T12:00:00Z",
     "floor_price": 1000,
     "total_sales": 500,
     "unique_holders": 300,
     "volume_24h": 50000
   }
   ```

4. **Create snapshots for historical analysis**

   ```bash
   suipulse snapshot create --stream-id <stream-id>
   ```

5. **Transfer snapshot to analytics team**
   ```bash
   suipulse snapshot transfer --id <snapshot-id> --recipient <analytics-team-address>
   ```

## 4. DeFi Protocol Monitoring

### Overview

Monitor various DeFi protocol metrics in real-time.

### Steps

1. **Create streams for different protocol metrics**

   ```bash
   suipulse batch create --config defi_metrics_config.json
   ```

   ```json
   // defi_metrics_config.json
   {
     "streams": [
       {
         "name": "TVL-Tracker",
         "description": "Total Value Locked tracking"
       },
       {
         "name": "Yield-Rates",
         "description": "Protocol yield rates"
       },
       {
         "name": "User-Activity",
         "description": "User interaction metrics"
       }
     ],
     "options": {
       "parallel": true
     }
   }
   ```

2. **Set up custom network for testnet monitoring**

   ```bash
   suipulse config set-custom --url https://testnet.sui.io --package-id <package-id>
   ```

3. **Update streams with protocol data**

   ```bash
   suipulse stream update --id <tvl-id> --data tvl_data.json
   suipulse stream update --id <yield-id> --data yield_data.json
   suipulse stream update --id <activity-id> --data activity_data.json
   ```

4. **Create and verify snapshots**
   ```bash
   suipulse snapshot create --stream-id <tvl-id>
   suipulse snapshot verify --id <snapshot-id> --stream-id <tvl-id>
   ```

## 5. Gaming Leaderboard System

### Overview

Create a real-time gaming leaderboard system.

### Steps

1. **Create a stream for game leaderboard**

   ```bash
   suipulse stream create --metadata leaderboard_metadata.json
   ```

   ```json
   // leaderboard_metadata.json
   {
     "name": "SuiGame-Leaderboard",
     "description": "Real-time gaming leaderboard",
     "tags": ["gaming", "leaderboard", "sui"],
     "version": "1.0.0"
   }
   ```

2. **Add permissions for game server**

   ```bash
   suipulse permission add --id <stream-id> --address <game-server-address> --level 1
   ```

3. **Update with player scores**

   ```bash
   suipulse stream update --id <stream-id> --data leaderboard_update.json
   ```

   ```json
   // leaderboard_update.json
   {
     "timestamp": "2024-03-20T12:00:00Z",
     "scores": [
       { "player": "0x123", "score": 1000 },
       { "player": "0x456", "score": 950 },
       { "player": "0x789", "score": 900 }
     ]
   }
   ```

4. **Create snapshots for season records**
   ```bash
   suipulse snapshot create --stream-id <stream-id>
   ```

## 6. DAO Governance Tracking

### Overview

Track and manage DAO governance activities.

### Steps

1. **Create streams for different governance aspects**

   ```bash
   suipulse batch create --config dao_governance_config.json
   ```

   ```json
   // dao_governance_config.json
   {
     "streams": [
       {
         "name": "Proposal-Tracker",
         "description": "DAO proposal tracking"
       },
       {
         "name": "Voting-Stats",
         "description": "Voting statistics"
       },
       {
         "name": "Treasury-Metrics",
         "description": "DAO treasury metrics"
       }
     ],
     "options": {
       "parallel": true
     }
   }
   ```

2. **Add permissions for different roles**

   ```bash
   suipulse permission add --id <proposal-id> --address <dao-admin-address> --level 2
   suipulse permission add --id <voting-id> --address <voting-module-address> --level 1
   suipulse permission add --id <treasury-id> --address <treasury-manager-address> --level 1
   ```

3. **Update streams with governance data**

   ```bash
   suipulse stream update --id <proposal-id> --data proposal_data.json
   suipulse stream update --id <voting-id> --data voting_data.json
   suipulse stream update --id <treasury-id> --data treasury_data.json
   ```

4. **Create snapshots for proposal records**
   ```bash
   suipulse snapshot create --stream-id <proposal-id>
   ```

## 7. Cross-Chain Bridge Monitoring

### Overview

Monitor cross-chain bridge operations and security metrics.

### Steps

1. **Create streams for bridge operations**

   ```bash
   suipulse batch create --config bridge_monitoring_config.json
   ```

   ```json
   // bridge_monitoring_config.json
   {
     "streams": [
       {
         "name": "Bridge-Volume",
         "description": "Bridge transaction volume"
       },
       {
         "name": "Security-Metrics",
         "description": "Bridge security metrics"
       },
       {
         "name": "User-Flow",
         "description": "User flow statistics"
       }
     ],
     "options": {
       "parallel": true
     }
   }
   ```

2. **Set up monitoring on mainnet**

   ```bash
   suipulse config set-network --network mainnet
   ```

3. **Update streams with bridge data**

   ```bash
   suipulse stream update --id <volume-id> --data volume_data.json
   suipulse stream update --id <security-id> --data security_data.json
   suipulse stream update --id <flow-id> --data flow_data.json
   ```

4. **Create and verify snapshots**

   ```bash
   suipulse snapshot create --stream-id <volume-id>
   suipulse snapshot verify --id <snapshot-id> --stream-id <volume-id>
   ```

5. **Watch streams for real-time monitoring**
   ```bash
   suipulse stream watch --id <volume-id>
   ```
