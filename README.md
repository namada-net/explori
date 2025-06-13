# Namada Block Explorer

A modern block explorer for the Namada blockchain, built with React and the Namada Indexer.

## Features

- View latest blocks and their details
- Search for accounts by address
- View account balances and transaction history
- Real-time updates of blockchain data

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Running instance of [Namada Indexer](https://github.com/anoma/namada-indexer)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd namada-block-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint:
Edit `src/config.ts` and update the `API_BASE_URL` to point to your Namada Indexer instance.

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

This block explorer integrates with the Namada Indexer API. Make sure your indexer instance is running and accessible at the configured API endpoint.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
