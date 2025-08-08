# CG Airdrop & Vesting Plugin

**A plugin for the Common Ground platform**

This project is a plugin for the [Common Ground](https://app.cg) community platform. It serves as a current best practice example for utilizing community roles for backend authentication. Communities can now manage both airdrops and vestings in a simple and secure manner, leveraging Common Ground's role-based access control for all sensitive operations.

You can use your own community to run and test this plugin locally. You can also set up a testing community for this purpose.

## Features

- **CSV Upload**: Upload recipient lists with addresses and token amounts
- **Merkle Tree Generation**: Generate cryptographic merkle trees for efficient airdrop distribution
- **Smart Contract Deployment**: Deploy AirdropClaim contracts with merkle root verification
- **Vesting Management**: Create and manage token vesting contracts
- **Wallet Integration**: Connect MetaMask or other Web3 wallets using wagmi
- **Database Management**: Store and manage airdrop and vesting metadata with Prisma and SQLite
- **API Routes**: RESTful API endpoints for airdrop and vesting operations
- **Role-based Authentication**: Uses Common Ground community roles for secure backend authentication

## Token Compatibility

- **ERC20**: Fully supported for airdrops and vestings
- **LUKSO LSP7**: Fully supported for airdrops and vestings

## Smart Contracts

Contracts available in `contracts/contracts/`:
- **AirdropClaim.sol**: Main contract for token distribution using merkle proofs (ERC20 & LSP7 compatible)
- **LSP7Vesting.sol**: Vesting contract for time-based token release (ERC20 & LSP7 compatible)
- **MockToken.sol**: ERC20 token for testing
- **MockLSP7.sol**: LUKSO LSP7 token for testing

## Local Setup

- Go to your community settings
- Create a plugin
- As plugin URL, set http://localhost:5173
- Copy the key data (variables are named slightly different there)
- Create a file .env.local in the root folder of this repository
- There, add the private and public key, and a cookie secret. Make sure you use exactly the variable names shown below:

```
VITE_PLUGIN_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n---data---\n-----END PUBLIC KEY-----\n"
PLUGIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n---data---\n-----END PRIVATE KEY-----\n"
COOKIE_SECRET=some_random_value
```

- Be sure your node version is at least >= 24 (try something like [nvm](https://github.com/nvm-sh/nvm) to manage your node versions)
- run `npm install`
- run `npm run hardhat:compile`
- run `npm run prisma:migrate`
- run `npm run dev`
- the plugin should now load when visiting it in your community

To use a local hardhat node for testing with smart contracts (optional):
- run `npm run hardhat:node`
- run `npm run hardhat:deploy` to deploy an erc20 and an lsp7 token for local testing
- add the local HardHat chain to your local wallet plugin (Metamask, Rabby, etc.)
  - You can simply do that by connecting your wallet and selecting HardHat in the chain dropdown

## Docker setup

- Change into the project directory
- Copy docker.env.local.example to docker.env.local
- There, update the plugin public and private key, and other changes according to your needs
- Now, run `docker build -t airdrop .`
- Run `docker run --rm --name airdrop -p 3000:3000 airdrop`
- You can now add the plugin for testing with `http://localhost:3000/`

## Available npm Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

### Smart Contracts
- `npm run hardhat:node` - Start a local Hardhat node
- `npm run hardhat:compile` - Compile Solidity contracts with Hardhat
- `npm run hardhat:deploy` - Deploy mock ERC20 and LSP7 contracts to local Hardhat node

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply new migration
- `npm run prisma:reset` - Reset database and reapply all migrations
- `npm run prisma:deploy` - Apply pending migrations (production)
- `npm run prisma:studio` - Open Prisma Studio GUI at `http://localhost:5555`
- `npm run db:seed` - Run database seeds

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your Web3 wallet
2. **Upload CSV**: Upload a CSV file with columns `address` and `amount`
3. **Generate Tree**: The app automatically generates a merkle tree from your data
4. **Deploy Contract**: Enter a token contract address and deploy the AirdropClaim contract
5. **Manage Airdrops & Vestings**: Use the UI and API to create and manage airdrops and vestings

## CSV Format

Your CSV file should have these columns:
```csv
address,amount
0x1234567890123456789012345678901234567890,1000000000000000000
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,500000000000000000
```

Amounts should be in wei (smallest token unit).

## Vesting Functionality

The plugin allows communities to create and manage token vesting contracts for their members. Vestings are time-based token releases, where a beneficiary can claim tokens gradually over a specified period. The process is as follows:

- **Create Vesting**: Admins specify a beneficiary address, token address (ERC20 or LSP7), start and end time, and a display name. The contract is deployed on-chain, and the vesting record is stored in the database.
- **Manage Vestings**: The UI provides a list of all vestings for the community. Each vesting shows details such as beneficiary, contract address, start/end time, released/releasable/vested amounts, and total vesting amount.
- **Claiming**: Beneficiaries can connect their wallet and claim their vested tokens directly from the UI.
- **Role-based Access**: Only community admins (as determined by Common Ground roles) can create or delete vestings. All actions are authenticated using signed community/user data from the Common Ground platform.

## Project Structure

```
├── app/
│   ├── components/   # React UI components (airdrop, vesting, menu, etc.)
│   ├── context/      # React context providers (CG data, plugin lib)
│   ├── contracts/    # TypeScript contract bindings (frontend)
│   ├── hooks/        # React hooks (contracts, token data, etc.)
│   ├── lib/          # Utility libraries (db, CG utils)
│   ├── routes/       # Route handlers and API endpoints
│   ├── app.css       # Global styles
│   ├── root.tsx      # App root
│   ├── routes.ts     # Route config
│   ├── sessions.server.ts # Session management
│   └── types.ts      # Shared types
├── contracts/        # Hardhat root folder, with Solidity smart contracts, deployment scripts
├── prisma/           # Database schema and migrations
├── generated/        # Generated Prisma client and contract types
├── public/           # Static assets
```
