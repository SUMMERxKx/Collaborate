# Collaborate - Real-time Collaborative Workspace

A modern collaborative workspace application that enables teams to work together in real-time. Create groups, share ideas on an interactive canvas, and communicate through live chat - all in one seamless platform.

## Key Features

### 🔐 Secure Group Spaces
- Create private workspaces for your team
- Generate secure passkeys for group access
- Manage group members and permissions
- Join multiple groups for different projects

### 🎨 Interactive Canvas
- Real-time collaborative drawing and editing
- Rich toolset for creativity:
  - Freehand drawing with customizable brush
  - Text annotations and labels
  - Sticky notes for quick ideas
  - Task cards for project management
- All changes sync instantly across all users
- Object selection, modification, and deletion
- Infinite canvas with pan and zoom

### 💬 Live Group Chat
- Real-time messaging within each group
- Message history persistence
- User presence indicators
- Automatic scrolling for new messages
- Emoji support for expressive communication

### 👥 User Management
- Secure authentication system
- Personal dashboard
- Group membership overview
- Activity tracking

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, utility-first styling
- **Fabric.js** - Canvas manipulation
- **Zustand** - State management

### Backend & Infrastructure
- **Supabase**
  - PostgreSQL database
  - Real-time subscriptions
  - User authentication
  - Row-level security
- **NextAuth.js** - Authentication framework

## Getting Started

1. **Clone and Install:**
   ```bash
   git clone https://github.com/SUMMERxKx/Collaborate.git
   cd collaborate
   npm install
   ```

2. **Environment Setup:**
   Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Database Setup:**
   - Create a Supabase project
   - Run schema from `supabase/schema.sql`
   - Configure auth providers

4. **Start Development:**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure
```
collaborate/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # Reusable React components
│   │   ├── auth/        # Authentication components
│   │   ├── canvas/      # Canvas and drawing tools
│   │   ├── chat/        # Real-time chat components
│   │   └── group/       # Group management
│   ├── lib/             # Utilities and configurations
│   ├── store/           # Zustand state stores
│   └── types/           # TypeScript definitions
├── public/              # Static assets
└── supabase/           # Database schema and configs
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.
