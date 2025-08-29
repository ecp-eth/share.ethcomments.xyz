# ECP share

A Next.js application that allows users to write comments to the Ethereum Comments Protocol (ECP). Built with TypeScript, Tailwind CSS, shadcn/ui, RainbowKit for wallet connection, and the ECP SDK.

## Features

- 🔗 **Wallet Connection**: Connect your Ethereum wallet using RainbowKit
- ✍️ **Rich Text Editor**: Write comments using the ECP React Editor with support for mentions and file uploads
- 📝 **Comment Form**: Fill out all required fields for posting comments to the ECP protocol
- 🎨 **Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS
- 🔒 **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Wallet Connection**: RainbowKit + Wagmi
- **Ethereum Comments Protocol**: @ecp.eth/sdk + @ecp.eth/react-editor
- **Blockchain**: Viem for Ethereum interactions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- An Ethereum wallet (MetaMask, WalletConnect, etc.)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ecp-share
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your WalletConnect project ID:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect Your Wallet**: Click the "Connect Wallet" button and select your preferred wallet
2. **Select Channel**: Choose a channel for your comment (General, Development, Community)
3. **Write Your Comment**: Use the rich text editor to write your comment
4. **Add Target URI** (Optional): Specify the URL or URI this comment is about
5. **Add Metadata** (Optional): Include additional metadata in JSON format
6. **Post Comment**: Click "Post Comment" to submit your comment to the ECP protocol

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page component
│   └── providers.tsx      # RainbowKit and Wagmi providers
├── components/            # React components
│   ├── comment-form.tsx   # Main comment form component
│   └── ui/               # shadcn/ui components
└── lib/                  # Utility functions
    ├── utils.ts          # Utility functions
    └── wagmi.ts          # Wagmi configuration
```

## Configuration

### WalletConnect Project ID

To use WalletConnect for wallet connections, you need to:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your project ID
4. Add it to your `.env.local` file

### Supported Networks

The application is configured to support:

- Ethereum Mainnet
- Sepolia Testnet

You can modify the supported networks in `src/lib/wagmi.ts`.

## ECP Protocol Integration

This application integrates with the Ethereum Comments Protocol using:

- **@ecp.eth/sdk**: Core SDK for interacting with the ECP protocol
- **@ecp.eth/react-editor**: Rich text editor component with mentions and file uploads

### Comment Structure

Each comment includes:

- **Content**: The main comment text (rich text format)
- **Channel ID**: The channel where the comment is posted
- **Target URI** (Optional): The URL or URI the comment is about
- **Metadata** (Optional): Additional structured data
- **Author**: The Ethereum address of the comment author
- **App**: The application signature for posting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Learn More

- [Ethereum Comments Protocol Documentation](https://docs.ethcomments.xyz/)
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
