# 🌊 WavePlay — "Your Music. Your Way."

> A production-quality, full-featured music streaming web application built with React 19, TypeScript, Tailwind CSS, Redux Toolkit, Node.js, Express, and MongoDB.

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-18%20Passed-brightgreen.svg)]()

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture & Design System](#-architecture--design-system)
5. [Directory Structure](#-directory-structure)
6. [Getting Started (Local Development)](#-getting-started-local-development)
7. [Environment Variables](#-environment-variables)
8. [Database & Demo Mode](#-database--demo-mode)
9. [Audio Engine & Formats](#-audio-engine--formats)
10. [REST API Documentation](#-rest-api-documentation)
11. [Testing](#-testing)
12. [Docker Deployment](#-docker-deployment)
13. [Production Deployment](#-production-deployment)
14. [Security & Legal Music Considerations](#-security--legal-music-considerations)

---

## 🎵 Project Overview

**WavePlay** is an original music streaming web application with its own brand identity, audio player engine, local audio processing capabilities, and responsive UI inspired by the usability of modern streaming platforms.

The application allows users to:
- Stream legally accessible full-length music across 10 diverse genres.
- Play local audio files (MP3, WAV, FLAC, M4A, OGG, AAC) directly from their computer with zero upload required.
- Stream direct user-provided web audio URLs with real-time CORS & format reachability validation.
- Create, manage, and reorder custom playlists.
- Save favorite tracks, albums, and follow artists.
- Enjoy an immersive full-screen Now Playing page with audio wave visualizer and lyrics/info tabs.
- Crossfade between songs (0–12s) and control playback speed (0.5x – 2.0x).
- Control music using keyboard shortcuts and OS media keys via the Web Media Session API.

---

## ✨ Key Features

### 🎧 Audio Engine & Controls
- **Centralized Dual-Element Player**: Smooth crossfading (0–12 seconds) without audio glitches.
- **Full Audio Controls**: Play, Pause, Next, Previous, Seek slider, Volume slider, Mute/Unmute.
- **Repeat & Shuffle**: None, Repeat All, Repeat One; Fisher-Yates shuffle with queue restore.
- **Playback Speeds**: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x.
- **Web Media Session API**: Native lock screen and OS multimedia keys integration (Play/Pause/Next/Prev/Seek).
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `←` / `→`: Seek backward / forward 5s
  - `M`: Mute / Unmute
  - `N`: Next track
  - `P`: Previous track
  - `L`: Like / Save track

### 📁 Local Music & Remote URLs
- **Local File Player (`/local-music`)**: Drag-and-drop or select multiple audio files. Metadata is extracted and cached in **IndexedDB** for persistence across page reloads.
- **URL Stream Player (`/add-url`)**: Add direct audio URLs with automated content-type and reachability validation. Friendly errors for CORS or network restrictions.

### 🔍 Discovery & Library
- **Live Debounced Search (`/search`)**: Search across Tracks, Artists, Albums, and Playlists.
- **Browse All Genres**: Synthwave, Lo-fi, Rock, Electronic, Classical, Jazz, Pop, Indian/World, Ambient.
- **Dynamic Home Page (`/`)**: Time-of-day greetings, quick shortcuts, Made For You, Popular Tracks, and New Releases.
- **Your Library (`/library`)**: Filterable views of Playlists, Liked Songs, Saved Albums, and Local Audio files.
- **Listening History (`/history`)**: Organized timeline (Today, Yesterday, Previous 7 Days, Older).
- **Queue Drawer**: Reorder tracks, move up/down, remove, or clear queue.
- **Right-Click Context Menus**: Play, Play Next, Add to Queue, Add to Playlist, Like, Go to Artist/Album, Share.

### 🎨 UI & Responsive Experience
- **WavePlay Design System**: Deep obsidian dark mode (`#0c0d12`) and clean light mode with luminous violet & cyan wave accents.
- **Responsive Layout**: Desktop sidebar and top bar; Mobile bottom navigation and sticky mini-player.
- **PWA (Progressive Web App)**: Installable on desktop and mobile with `manifest.json` and service worker offline caching shell.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6 / Vite 8
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism & Animations
- **State Management**: Redux Toolkit (Slices: `auth`, `player`, `library`, `settings`, `ui`)
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Storage**: IndexedDB (Native IDB API for local tracks)
- **Testing**: Vitest

### Backend
- **Runtime**: Node.js v22+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose (with automated In-Memory Demo Fallback Engine)
- **Security**: Helmet, CORS, Express Rate Limit, bcryptjs, JSON Web Tokens (JWT)
- **Testing**: Vitest + Supertest

---

## 📐 Architecture & Design System

```text
React 19 Frontend (Vite + TypeScript + Redux Toolkit)
       |
       | REST API (Bearer JWT Authentication)
       v
Express.js Backend (TypeScript + Rate Limiting + Helmet)
       |
       +---> [DBStore Repository Pattern]
                |
                +---> MongoDB (via Mongoose when MONGODB_URI is available)
                |
                +---> In-Memory Mock Repository (Instant Zero-Config Demo Mode)
```

---

## 📂 Directory Structure

```text
waveplay/
├── client/                      # React 19 Frontend
│   ├── public/
│   │   ├── favicon.svg          # WavePlay Sonic Crest Logo
│   │   ├── manifest.json        # PWA Web App Manifest
│   │   └── sw.js                # Service Worker
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/           # TrackRow, TrackCard, AlbumCard, ArtistCard, PlaylistCard
│   │   │   ├── common/          # Logo, ContextMenu, ToastContainer, Skeletons
│   │   │   ├── layout/          # Sidebar, TopBar, BottomNav
│   │   │   ├── modals/          # AuthModal, AddUrlModal, AddToPlaylist, CreatePlaylist
│   │   │   └── player/          # PlayerBar, MiniPlayer, QueueDrawer, AudioProvider
│   │   ├── features/player/     # AudioEngine.ts (Dual HTMLAudioElement crossfade engine)
│   │   ├── pages/               # Home, Search, Library, Liked, Playlist, Album, Artist, LocalMusic, History, NowPlaying, Settings, Profile
│   │   ├── services/api.ts      # Typed REST API service
│   │   ├── storage/             # indexedDB.ts, localMusicStore.ts
│   │   ├── store/               # Redux store & slices
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/db.ts         # MongoDB connection with In-Memory fallback
│   │   ├── controllers/         # auth, tracks, artists, albums, playlists, library, search, recommendations
│   │   ├── data/seedData.ts     # 10 Artists, 20 Albums, 52 playable tracks, 10 playlists
│   │   ├── middleware/          # JWT auth, error handler
│   │   ├── models/              # Mongoose models: User, Track, Artist, Album, Playlist, History, Library
│   │   ├── routes/              # Express API route modules
│   │   ├── storage/dbStore.ts   # Unified storage repository
│   │   ├── types/               # Backend TypeScript definitions
│   │   └── server.ts            # Main application entry point
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml           # Full containerized stack (Client, Server, MongoDB)
├── package.json                 # Monorepo workspace configuration
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** >= 18 (Tested on Node.js v24.18.0)
- **npm** >= 9

### 1. Installation
Clone or navigate to the project directory:

```bash
cd waveplay
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Run in Development Mode
You can start both the backend API (port 5000) and frontend client (port 5173) simultaneously:

```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1 (Backend API)
npm run dev:server

# Terminal 2 (Frontend Client)
npm run dev:client
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🔑 Environment Variables

### Server (`server/.env`)
Create `server/.env` (a pre-configured `.env` is already created with sensible defaults):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/waveplay
JWT_SECRET=waveplay-super-secure-secret-key-2025
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🗄️ Database & Demo Mode

WavePlay features an **Automated In-Memory Demo Fallback Engine**:
- **With MongoDB**: If a MongoDB service is running or a MongoDB Atlas URI is configured in `MONGODB_URI`, WavePlay connects using Mongoose and can be seeded using `npm run seed --prefix server`.
- **Without MongoDB (Demo Mode)**: If no MongoDB daemon is detected on your system, the server automatically starts in **In-Memory Demo Mode**. It instantly populates the 10 artists, 20 albums, 52 playable tracks, demo user (`demo@waveplay.io`), and sample playlists.
- You can log in instantly with one click using the **"One-Click Instant Demo Login"** button on the sign-in modal!

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Service health status and catalog metrics | No |
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Sign in with email and password | No |
| `POST` | `/api/auth/demo-login` | Instant demo account authentication | No |
| `GET` | `/api/auth/me` | Fetch active authenticated profile | Yes |
| `GET` | `/api/tracks` | Paginated list of tracks (optional `?genre=`) | No |
| `GET` | `/api/tracks/popular` | Most played tracks | No |
| `GET` | `/api/tracks/new-releases` | Newly released tracks | No |
| `GET` | `/api/tracks/:id` | Track metadata by ID | No |
| `GET` | `/api/artists` | Get all artists in catalog | No |
| `GET` | `/api/artists/:id` | Artist details, top 5 songs, albums | No |
| `GET` | `/api/albums` | Get all albums | No |
| `GET` | `/api/albums/:id` | Album details and tracklist | No |
| `GET` | `/api/playlists` | Browse public or user playlists | No |
| `POST` | `/api/playlists` | Create a new playlist | Yes |
| `PUT` | `/api/playlists/:id` | Update playlist metadata | Yes |
| `DELETE` | `/api/playlists/:id` | Delete playlist | Yes |
| `POST` | `/api/playlists/:id/tracks` | Add track to playlist | Yes |
| `DELETE` | `/api/playlists/:id/tracks/:trackId` | Remove track from playlist | Yes |
| `PUT` | `/api/playlists/:id/tracks/reorder` | Reorder playlist tracks | Yes |
| `GET` | `/api/me/library` | User saved tracks, albums, artists, playlists | Yes |
| `GET` | `/api/me/liked` | User liked songs | Yes |
| `POST` | `/api/me/liked/:trackId` | Like or unlike a song | Yes |
| `POST` | `/api/me/saved-albums/:id` | Save or unsave an album | Yes |
| `POST` | `/api/me/followed-artists/:id`| Follow or unfollow an artist | Yes |
| `GET` | `/api/me/history` | User playback history | Yes |
| `POST` | `/api/me/history` | Record played track & position | No (Optional) |
| `GET` | `/api/search?q=` | Live search across tracks, artists, albums, playlists | No |
| `GET` | `/api/recommendations` | Personalized tracks and featured playlists | No |
| `POST` | `/api/audio/validate-url` | Test reachability & headers of remote audio URL | No |

---

## 🧪 Testing

Both backend and frontend have comprehensive unit and integration test suites:

```bash
# Run all tests (Monorepo)
npm test

# Run backend API tests only (Vitest + Supertest)
npm run test --prefix server

# Run frontend tests only (Vitest)
npm run test --prefix client
```

**Results:**
- **Server Tests**: 6 passed (Health, Catalog pagination, Search, Demo Auth, Recommendations, URL validation).
- **Client Tests**: 12 passed (Player reducer, Queue management, Play/Pause, Shuffle, Repeat modes, Seek, Metadata parser, Time formatting).

---

## 🐳 Docker Deployment

To spin up the entire application stack (Frontend, Backend, and MongoDB) using Docker:

```bash
docker-compose up --build -d
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`

---

## 🌐 Production Deployment

### Frontend (e.g. Vercel, Netlify, Cloudflare Pages)
1. Build the production client bundle:
   ```bash
   npm run build --prefix client
   ```
2. The output will be in `client/dist`.
3. Set the environment variable `VITE_API_BASE_URL` if hosting backend separately.

### Backend (e.g. Render, Railway, AWS ECS)
1. Build the TypeScript backend:
   ```bash
   npm run build --prefix server
   ```
2. Start the production server:
   ```bash
   npm start --prefix server
   ```
3. Configure `MONGODB_URI` pointing to your MongoDB Atlas cluster.

---

## 🔒 Security & Legal Music Considerations

1. **Password Security**: Passwords are never stored in plaintext and are hashed using `bcryptjs` with salt rounds.
2. **JWT Authentication**: Secure stateless tokens signed with `JWT_SECRET` and set with 7-day expiration.
3. **HTTP Protections**: `helmet` headers, CORS restrictions, and API rate limiting via `express-rate-limit`.
4. **Legitimate Audio Streaming**:
   - The default sample catalog uses verified Creative Commons (CC-BY), CC0, and public domain audio sources.
   - The application does NOT bypass DRM, authentication, paywalls, or provider access controls.
   - User-provided URLs are checked against browser security rules (CORS). Unsupported codecs or DRM-protected streams are clearly diagnosed and reported to the user with actionable messages.
   - Local audio files remain 100% on the user's device and are never uploaded without consent.

---

## 📄 License

MIT © WavePlay Team. "Your Music. Your Way."
