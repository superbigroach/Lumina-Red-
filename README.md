# Lumina Red — El nexo aliado del talento latino

> Decentralized social cooperative where the Latino community meets capital.
>
> By the creator of [Lucilla](https://lucilla.app) — the pay-per-visit marketing platform pioneering real-world use cases with Web3 and stablecoins on Base.

**Live:** [lumina-red.web.app](https://lumina-red.web.app)

---

## What is Lumina Red?

Lumina Red is a decentralized social cooperative that bridges the gap between Latino founders/newcomers and global allies who want to support them. It combines:

1. **Social networking** — profiles, posts, connections, feeds
2. **Business showcasing** — founder profiles, business galleries, updates
3. **Embedded finance** — donations + micro-equity crowdfunding via USDC

Built at the **Building Our Future in AI — Latin@ Summit** hackathon (Feb 2026, OCAD Toronto). Rebuilt with Firebase + Circle using the same Web3 infrastructure that powers [Lucilla](https://lucilla.app).

### Core Philosophy

- Feel like a **welcoming community hub**, NOT a crypto exchange
- Abstract Web3 complexity: "Digital Wallet" not "EOA", "Community Funds" not "USDC"
- Warm, vibrant, trustworthy aesthetic: **terracotta, teal, community murals**

## Features

| Feature | Description |
|---------|-------------|
| **Auth** | Firebase Auth — Google sign-in + email/password |
| **Social Feed** | Compose posts, like (toggle), comment — all real-time via Firestore |
| **Marketplace** | Browse businesses, category filters, search, 3 template businesses (labeled) |
| **Register Business** | Multi-step form: name/tagline/category → description/gallery → funding goal/equity pool |
| **Business Profile** | Image gallery, tabs (About/Founders/Updates), donate modal with USDC transaction recording |
| **Wallet** | 6-digit PIN creation, USDC/ETH balance display (Base Sepolia), transaction history |
| **User Profile** | Editable bio/city/country/socials, tabs for posts/connections/portfolio |
| **Connections** | Send friend requests, accept pending, view connections list |
| **Messaging** | Real-time chat conversations via Firestore |

### Pages

| Route | Page |
|-------|------|
| `/` | Landing — hero, features, featured businesses |
| `/auth` | Login / Sign up (Firebase Auth + Google) |
| `/feed` | Social feed — compose, like, comment (protected) |
| `/marketplace` | Business marketplace with filters (protected) |
| `/business/:id` | Business profile — gallery, tabs, donate/invest (protected) |
| `/create-business` | Multi-step business registration (protected) |
| `/profile` | User profile — edit bio, posts, connections, portfolio (protected) |
| `/wallet` | Wallet — create, balance, transactions (protected) |
| `/messages` | Real-time messaging (protected) |

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18 + Vite** | Frontend framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling (terracotta/teal/gold theme) |
| **Firebase Auth** | Google + email/password authentication |
| **Firestore** | Real-time database for all data |
| **Circle USDC** | Stablecoin wallets on Base Sepolia testnet |
| **viem** | Ethereum client for balance reading |
| **Lucide React** | Icons |
| **React Router** | Client-side routing |

## Firestore Collections

```
users/           — User profiles (bio, wallet, socials)
businesses/      — Business listings (funding, equity, template flag)
posts/           — Social feed posts
  └─ comments/   — Post comments (subcollection)
  └─ likes/      — Post likes (subcollection)
friendships/     — Friend requests and connections
transactions/    — USDC donations/investments
conversations/   — Chat conversations
  └─ messages/   — Chat messages (subcollection)
```

## Getting Started

```bash
cd app
npm install
npm run dev        # Start development server at localhost:5173
npm run build      # Build for production
```

## Deployment

Hosted on Firebase (project: `bankapp-de728`):
```bash
npm run build
npx firebase-tools deploy --only hosting,firestore:rules --project bankapp-de728
```

## Hackathon Context

| Detail | Info |
|--------|------|
| **Event** | Building Our Future in AI — The Latin@ Summit |
| **Date** | Feb 28, 2026 — OCAD Rosalie Sharp Pavilion, Toronto |
| **Theme** | Economic Mobility & Workforce Alignment |
| **Original Build** | Lovable (vibe coding) + Supabase + Circle |
| **Current Build** | React + Firebase + Circle (rebuilt from original specs) |

### Team

| Name | Role |
|------|------|
| Sebastian Borjas | Tech Lead |
| Sonia Castillo | Team Member |
| Cristian Florez | Team Member |
| Reggie Fiete | Team Member |
| Carolina Olaya | Team Member |

## Related Projects

- **[Lucilla](https://lucilla.app)** — Pay-per-visit marketing platform with USDC rewards on Base (main project)
- **[Casa Futura](https://casa-futura-sb.web.app)** — Tokenized real estate investment platform
- **[StellarStudio.SB](https://personalweb-f0fb2.web.app)** — Personal portfolio

## Author

**S. Borjas** — Full Stack Developer & Founder
- [lucilla.app](https://lucilla.app)
- [LinkedIn](https://www.linkedin.com/in/sborjasto/)
- [X/Twitter](https://x.com/sb_lucilla)
- [GitHub](https://github.com/superbigroach)
- s.borjas@lucilla.ca
