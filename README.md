# Poker Scoring App

A **real-time collaborative** web application for agile teams to estimate story points using the Fibonacci sequence in planning poker sessions.

## 🚀 **Vercel Ready** - Deploy in Seconds!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/poker-scoring-app)

✅ **Zero Configuration Deployment**  
✅ **Serverless & Scalable**  
✅ **Real-time Polling (2-4s updates)**  
✅ **Free Hosting on Vercel**

## ✨ Features

- **🔢 Fibonacci Sequence Voting**: Use the standard Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, 34, 55, 89) for story point estimation
- **⚡ Real-time Collaboration**: Multiple team members can join the same session using WebSockets and vote simultaneously
- **🔒 Anonymous Voting**: Votes are hidden until all players have voted, preventing bias
- **📊 Automatic Calculations**: Displays average score and suggested story points
- **💻 Clean UI**: Modern, responsive design built with Next.js and Tailwind CSS
- **📝 Story Description**: Add context by describing the story or feature being estimated
- **🌐 Session Management**: Create or join sessions with shareable session IDs
- **👥 Live Player Status**: See who's online, who has voted, and who's still thinking
- **📱 Copy Session ID**: Easy sharing with team members

## 🏁 How to Use

### For Session Creator:
1. **Create Session**: A unique session ID is automatically generated
2. **Enter Your Name**: Add your name to join as the first player
3. **Share Session ID**: Copy and share the session ID with your team
4. **Add Story**: Describe the story or feature you're estimating

### For Team Members:
1. **Get Session ID**: Receive the session ID from your team lead
2. **Join Session**: Enter your name and the session ID
3. **Wait for Story**: See the story description added by the team

### For Everyone:
4. **Vote**: Select your estimate using the Fibonacci sequence buttons
5. **Wait**: Once you've voted, wait for other team members to finish
6. **Reveal**: When all players have voted, anyone can click "Reveal Votes"
7. **Review**: See individual votes, average score, and suggested story points
8. **Reset**: Start a new round by clicking "Reset Votes"

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Socket.IO** - Real-time WebSocket communication
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Lucide React** - Beautiful icons
- **Custom Express Server** - Handles WebSocket connections

## Planning Poker Best Practices

- **Discuss first**: Before voting, make sure everyone understands the story
- **No discussion during voting**: Avoid influencing others while they're voting
- **Reveal together**: Wait for everyone to vote before revealing
- **Discuss discrepancies**: If votes vary significantly, discuss the differences
- **Re-vote if needed**: After discussion, you can reset and vote again

## Development

To start editing the app, modify `src/app/page.tsx` or `src/components/PokerScoring.tsx`. The page auto-updates as you edit the file.

## 🚀 Deploy

### 🎆 **Instant Deploy to Vercel** (Recommended)

1. **Push to GitHub**:
   ```bash
   git add . && git commit -m "Deploy poker app" && git push
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Click "Deploy" - No configuration needed!

📝 **Read the full [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** for details.

### 🔌 **Alternative: Self-Hosted with Socket.IO**

For instant WebSocket updates on your own server:

```bash
npm run build
npm run start:socket
```

**Socket.IO version** provides instant real-time updates but requires a persistent server.
