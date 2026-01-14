# Klyra Contracts - Smart Contract Deployment Guide

Smart contracts for Klyra Quest platform on Mantle Sepolia, built with Foundry.

---

## 📋 Overview

This directory contains the Foundry workspace for Klyra Quest smart contracts:
- **QuestManager** - Main quest orchestration contract (ERC-8004 compatible)
- **RewardVault** - Holds KLYRA ERC-20 tokens for quest rewards
- **BadgeNFT** - ERC-721 NFT badges awarded for quest completions
- **KlyraToken** - ERC-20 token (KLYRA) used for rewards
- **ERC-8004 Registry Adapters** - Agent, Reputation, Validation, Identity registries

---

## 🛠️ Prerequisites

1. **Install Foundry**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Verify installation**
   ```bash
   forge --version
   cast --version
   anvil --version
   ```

---

## 📦 Setup

1. **Install dependencies**
   ```bash
   cd contracts
   forge install OpenZeppelin/openzeppelin-contracts
   forge install foundry-rs/forge-std
   ```

2. **Build contracts**
   ```bash
   forge build
   ```

3. **Run tests**
   ```bash
   forge test
   forge test -vvv  # Verbose output
   forge test --gas-report  # Gas usage report
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the `contracts/` directory (optional, can also pass via CLI):

```bash
# Network Configuration
RPC_URL=https://rpc.sepolia.mantle.xyz
PRIVATE_KEY=0x...  # Your deployer private key (with 0x prefix)

# Completion Oracle Address (will be set automatically if using script)
COMPLETION_ORACLE=0x...

# Identity Registry Address (will be deployed automatically)
IDENTITY_REGISTRY_ADDRESS=0x...

# Agent Controller Address
AGENT_CONTROLLER_ADDRESS=0x...

# Agent Metadata URI (IPFS)
AGENT_METADATA_URI=ipfs://...
```

**⚠️ Security Note:** Never commit `.env` files to git. Add `.env` to `.gitignore`.

---

## 🚀 Deployment

### Quick Deploy (Recommended)

The deployment script (`script/Deploy.s.sol`) orchestrates the entire deployment:

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $MANTLE_ETHERSCAN_API_KEY
```

### Step-by-Step Deployment

If you prefer to deploy contracts individually:

1. **Deploy ERC-8004 Registries**
   ```bash
   # Deploy Identity Registry
   cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY \
     --create $(cat out/IdentityRegistry.sol/IdentityRegistry.json | jq -r .bytecode.object)
   
   # Deploy other registries similarly
   ```

2. **Deploy KlyraToken (ERC-20)**
   ```bash
   cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY \
     --create $(cat out/KlyraToken.sol/KlyraToken.json | jq -r .bytecode.object)
   ```

3. **Deploy RewardVault**
   ```bash
   # After KlyraToken is deployed
   cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY \
     --create $(cat out/RewardVault.sol/RewardVault.json | jq -r .bytecode.object) \
     --constructor-args <KLYRA_TOKEN_ADDRESS>
   ```

4. **Deploy BadgeNFT (ERC-721)**
   ```bash
   cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY \
     --create $(cat out/BadgeNFT.sol/BadgeNFT.json | jq -r .bytecode.object)
   ```

5. **Deploy QuestManager**
   ```bash
   # After all dependencies are deployed
   cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY \
     --create $(cat out/QuestManager.sol/QuestManager.json | jq -r .bytecode.object) \
     --constructor-args <REWARD_VAULT> <BADGE_NFT> <REPUTATION_REGISTRY> <VALIDATION_REGISTRY> <AGENT_REGISTRY_ADAPTER>
   ```

6. **Setup contracts**
   - Transfer RewardVault ownership to QuestManager
   - Set QuestManager address in RewardVault
   - Set completion oracle in QuestManager
   - Register agent in AgentRegistryAdapter

---

## 📝 Deployment Script Details

The `script/Deploy.s.sol` script:

1. **Deploys ERC-8004 Registries** in the correct order:
   - IdentityRegistry
   - ReputationRegistry
   - ValidationRegistry
   - AgentRegistryAdapter

2. **Deploys KlyraToken** (ERC-20)

3. **Deploys RewardVault** and sets QuestManager as owner

4. **Deploys BadgeNFT** (ERC-721)

5. **Deploys QuestManager** with all registry addresses

6. **Configures contracts**:
   - Sets completion oracle
   - Sets RewardVault in QuestManager
   - Sets BadgeNFT in QuestManager
   - Registers agent (if provided)

7. **Outputs all addresses** for use in backend/frontend `.env` files

---

## 🧪 Testing

```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/QuestManager.t.sol

# Run with gas reporting
forge test --gas-report

# Run with verbose output
forge test -vvv

# Run with trace (for debugging)
forge test -vvvv
```

---

## 📊 Gas Optimization

```bash
# Generate gas snapshot
forge snapshot

# Compare snapshots
forge snapshot --diff
```

---

## 🔍 Verification

After deployment, verify contracts on Mantle Sepolia Explorer:

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  <CONTRACT_NAME>:<CONTRACT_PATH> \
  --chain-id 5003 \
  --etherscan-api-key $MANTLE_ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(...)" <args>)
```

Example:
```bash
forge verify-contract \
  0x3fEDf3864646b8fcBB79139e9527A4657209c1c2 \
  QuestManager:src/QuestManager.sol \
  --chain-id 5003 \
  --etherscan-api-key $MANTLE_ETHERSCAN_API_KEY
```

---

## 📋 Post-Deployment Checklist

After deployment, ensure:

- [ ] All contract addresses captured and saved
- [ ] QuestManager has completion oracle set
- [ ] RewardVault has QuestManager as owner
- [ ] RewardVault funded with KLYRA tokens
- [ ] Agent registered in AgentRegistryAdapter
- [ ] Contracts verified on explorer
- [ ] Addresses added to backend `.env.local`
- [ ] Addresses added to frontend `.env.local` (if needed)

---

## 🔗 Useful Commands

```bash
# Format code
forge fmt

# Update dependencies
forge update

# Clean build artifacts
forge clean

# Generate documentation
forge doc --build

# Inspect contract storage
cast storage <CONTRACT_ADDRESS> <SLOT> --rpc-url $RPC_URL

# Call contract function (read-only)
cast call <CONTRACT_ADDRESS> "functionName(uint256)" <ARGS> --rpc-url $RPC_URL

# Send transaction
cast send <CONTRACT_ADDRESS> "functionName(uint256)" <ARGS> \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

---

## 📚 Resources

- **Foundry Book**: https://book.getfoundry.sh/
- **Mantle Sepolia**: https://docs.mantle.xyz/network/network-details/mantle-sepolia-testnet
- **Mantle Explorer**: https://explorer.sepolia.mantle.xyz
- **ERC-8004**: https://eips.ethereum.org/EIPS/eip-8004

---

## 🆘 Troubleshooting

**Issue: `forge install` fails**
- Ensure git is installed
- Check network connectivity
- Try removing `lib/` and reinstalling

**Issue: Deployment fails with "insufficient funds"**
- Ensure deployer wallet has enough MNT (native token)
- Check gas price settings

**Issue: Verification fails**
- Ensure constructor arguments are correct
- Check compiler version matches deployed bytecode
- Verify network (chain-id 5003 for Mantle Sepolia)

---

## 📝 License

Copyright Klyra Quest team. All rights reserved.
