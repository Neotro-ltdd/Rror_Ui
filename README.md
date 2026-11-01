# Rorr Intelligence Telemetry — Frontend UI

> Modern, real-time observability and crash forensics dashboard built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **SignalR**.

---

## 1. Features

- **Live Telemetry Stream**: Real-time incoming incident log stream via SignalR WebSockets with smooth glow/pulse arrival animations.
- **Incident Inspection & AI Diagnostics**: Deep crash inspection, stack trace forensics, inner exception viewer, request payload inspection, and AI root cause analysis powered by Google Gemini.
- **Enterprise Staff Governance**: Staff provisioning with direct multi-project assignments, 6-digit OTP verification, and instant access revocation.
- **Project Isolation & Filtering**: Switch seamlessly between individual project telemetry streams or monitor cross-project global feeds.
- **Metrics & Performance**: Aggregated health metrics, severity distributions, and top error endpoints.
- **Accessibility & UX**: WCAG AA compliant custom dialogs, keyboard shortcuts, and dark cybersecurity aesthetic.

---

## 2. Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-Time Streaming**: [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr)
- **HTTP Client**: [Axios](https://axios-http.com/) with JWT Bearer token request interceptors and session revocation guards

---

## 3. Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- npm or pnpm

### Development Server
```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```

The app will start at `http://localhost:3000`. API calls to `/api` and `/hubs` are automatically proxied to the backend running at `http://localhost:5000`.

### Production Build
```bash
# Type check and build bundle
npm run build
```
Output will be generated in `dist/`.

---

## 4. Environment Configuration

In production, the frontend can be:
1. **Co-located**: Served directly from the .NET backend `wwwroot/` folder on the same domain.
2. **Standalone**: Deployed on Vercel, Netlify, or Cloudflare Pages with CORS enabled on the backend API.

---

## 5. License
Enterprise Proprietary - All Rights Reserved.
