# VOLTNET SDK - Project Structure

```
voltnet-sdk/
├── 📦 Package Configuration
│   ├── package.json           # NPM package configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── jest.config.js         # Jest testing configuration
│   └── .eslintrc.js          # ESLint configuration
│
├── 📝 Documentation
│   ├── README.md             # Main documentation
│   ├── QUICKSTART.md         # Quick start guide
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── CHANGELOG.md          # Version history
│   └── LICENSE               # MIT License
│
├── 🔧 Configuration Files
│   ├── .gitignore           # Git ignore rules
│   ├── .npmignore           # NPM ignore rules
│   └── .editorconfig        # Editor configuration
│
├── 🏗️ Source Code (src/)
│   ├── index.ts             # Main entry point & exports
│   ├── types.ts             # TypeScript type definitions
│   ├── VoltnetClient.ts     # Main VOLTNET client
│   ├── EnergyMeter.ts       # Energy measurement module
│   ├── PricingEngine.ts     # Pricing & cost calculations
│   ├── P2PMarket.ts         # P2P trading marketplace
│   ├── TransactionManager.ts # Transactions & settlements
│   ├── utils.ts             # Utility functions
│   └── utils.test.ts        # Unit tests
│
├── 💡 Examples (examples/)
│   ├── README.md            # Examples documentation
│   ├── basic-usage.ts       # Basic SDK usage
│   ├── solar-trading.ts     # Solar energy trading
│   └── ev-charging.ts       # EV charging optimization
│
└── 🔄 CI/CD (.github/workflows/)
    ├── ci.yml               # Continuous integration
    └── publish.yml          # NPM publishing workflow
```

## Core Modules

### 1. VoltnetClient
Main client for VOLTNET API interaction
- Profile management
- Balance tracking
- Statistics
- Real-time WebSocket updates

### 2. EnergyMeter
Energy measurement and device management
- Submit measurements
- Device registration
- Query historical data
- Signature verification

### 3. PricingEngine
Dynamic pricing and cost calculations
- Current prices
- Price history
- Forecasting
- Optimal charging times

### 4. P2PMarket
Peer-to-peer energy marketplace
- Create/browse offers
- Accept offers
- Market statistics
- Location-based search

### 5. TransactionManager
Transaction and settlement management
- Transaction tracking
- Settlement processing
- Receipt generation
- Export functionality

## Key Features

✅ Full TypeScript support with comprehensive types
✅ Real-time updates via WebSocket
✅ Automatic retry logic with exponential backoff
✅ Comprehensive error handling
✅ Utility functions for calculations
✅ Example implementations
✅ Full test coverage
✅ CI/CD pipeline
✅ ESLint & Prettier configuration
✅ Detailed documentation

## File Statistics

- **TypeScript files**: 9
- **Example files**: 3
- **Test files**: 1
- **Documentation files**: 5
- **Configuration files**: 7
- **Total lines**: ~3,500+

## Installation Size

- Source: ~150 KB
- Compiled (dist): ~200 KB
- Total package: ~350 KB (with docs)

## Dependencies

### Production
- axios: HTTP client
- eventemitter3: Event handling

### Development
- TypeScript
- Jest (testing)
- ESLint (linting)
- ts-jest (TypeScript Jest support)

## Build Output

After running `npm run build`, the `dist/` directory will contain:

```
dist/
├── index.js
├── index.d.ts
├── types.js
├── types.d.ts
├── VoltnetClient.js
├── VoltnetClient.d.ts
├── EnergyMeter.js
├── EnergyMeter.d.ts
├── PricingEngine.js
├── PricingEngine.d.ts
├── P2PMarket.js
├── P2PMarket.d.ts
├── TransactionManager.js
├── TransactionManager.d.ts
├── utils.js
└── utils.d.ts
```

## Getting Started

1. Extract the archive:
   ```bash
   tar -xzf voltnet-sdk.tar.gz
   cd voltnet-sdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build:
   ```bash
   npm run build
   ```

4. Run examples:
   ```bash
   npx ts-node examples/basic-usage.ts
   ```

## Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm publish` - Publish to NPM

---

Built with ⚡ by the VOLTNET Team
