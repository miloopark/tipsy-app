# Tipsy Mobile App

Tipsy is a party game hub designed for fast-paced, ice-breaking fun. The MVP ships with the **Spin** game—an easy, tap-to-spin prompt wheel ideal for gatherings.

## Features
- Landing screen with lightweight email sign-in (no backend required yet).
- Player setup screen to capture everyone in the session.
- Session vibe selector (friends vs new friends) to tailor upcoming games.
- Game hub listing available games, starting with **Spin**.
- **Spin** and **Hot Seat** for the “meeting new friends” vibe.
- **Tipsy Trap** as the first “playing with friends” party challenge.
- Spin game with rotating prompt list to spark laughs instantly.
- Custom theming and typography (Magic font) for the Tipsy brand.

## Getting Started

### Prerequisites
- Node.js 20.19+ recommended (Expo SDK 54 requirement).
- Expo CLI (installed automatically via `npx` commands).
- Expo Go app on an iOS/Android device **or** a simulator/emulator on your machine.
- Magic font file (`Magic2.otf`) placed at `assets/fonts/Magic2.otf`.

### Installation
```bash
# from the repository root
npm install
```

### Running the App
```bash
# Start the Expo development server
npm run ios      # or npm run android / npm run web
```
- Scan the QR code with Expo Go, or launch the iOS/Android simulator when prompted.
- If Metro fails to resolve assets, try clearing caches: `npx expo start -c`.

## Project Structure
```
tipsy-app/
├── App.tsx               # App entry point with stack navigation & font loading
├── src/
│   ├── contexts/         # Auth context (email-only session)
│   ├── screens/          # Landing & game hub screens
│   ├── games/spin/       # Spin game implementation
│   ├── theme/            # Shared styles
│   └── types/            # Navigation types
├── assets/
│   ├── fonts/            # Magic2.otf lives here
│   └── images/           # (placeholder for future artwork)
├── package.json          # Expo + TypeScript dependencies & scripts
└── ...                   # Expo configuration files (tsconfig, babel, etc.)
```

## Roadmap Ideas
- Add more party games under the Tipsy umbrella.
- Local persistence for user info & custom spin prompts.
- Animations, haptics, and sound design to elevate gameplay.

## Support
Open an issue or reach out to the Tipsy team for questions and feedback.

## License
Copyright © 2025 Up Games LLC. All rights reserved.
