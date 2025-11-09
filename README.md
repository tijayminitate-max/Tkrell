# Tkrell - AI-Powered Education Platform for Kenya

![Tkrell Logo](https://via.placeholder.com/150x50/00BFA6/FFFFFF?text=Tkrell)

**Tkrell** is a comprehensive, AI-powered educational platform designed for Kenyan students from Kindergarten to IGCSE. Combining the best features of IXL's mastery learning, SaveMyExams' exam resources, Duolingo's gamification, and Eneza's accessibility, Tkrell provides personalized learning with **Mr. T**, your friendly AI tutor.

## 🌟 Features

### 🧠 AI-Powered Learning
- **Question Generator**: Mr. T creates custom exam-style questions on any topic
- **Smart Grading**: Instant feedback on MCQs, short answers, and essays
- **AI Tutor Chat**: Ask Mr. T anything about your studies
- **Document Summarization**: Upload PDFs and get concise study notes

### 🎮 Gamification
- **XP System**: Earn experience points for completing quizzes
- **Streaks**: Maintain daily learning streaks 🔥
- **Coins & Rewards**: Collect coins and unlock achievements
- **Leaderboards**: Compete with students across Kenya by county and school
- **Levels**: Progress through levels as you learn

### 📚 Multi-Level Support
- **Kindergarten (KG1-KG2)**: Flashcards, audio prompts, matching games
- **Primary (P1-P8)**: MCQ quizzes, worksheets, KCPE preparation
- **Secondary (F1-F4)**: KCSE past papers, timed exams, mark schemes
- **IGCSE**: International track with Edexcel alignment

### 👥 Classroom Tools
- Teachers can create classes and manage students
- Assign quizzes and track progress
- View analytics and performance reports

### 🌐 Offline Support
- PWA (Progressive Web App) for offline access
- Pre-loaded question bank for areas with limited internet
- SMS integration (via Twilio) for notifications

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v22.13.0 or higher
- **pnpm**: v10.4.1 or higher
- **MySQL/TiDB**: Database for data storage
- **OpenAI API Key**: For AI features (optional for offline mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tkrell.git
   cd tkrell
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=mysql://user:password@host:port/database

   # OpenAI (optional - falls back to seed questions if not provided)
   OPENAI_API_KEY=sk-your-openai-api-key

   # Supabase (for auth and storage)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key

   # JWT Secret
   JWT_SECRET=your-random-secret-key

   # OAuth
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

   # App Configuration
   VITE_APP_TITLE=Tkrell - AI-Powered Education Platform
   VITE_APP_LOGO=https://your-logo-url.com/logo.png
   ```

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3000/api

## 📁 Project Structure

```
Tkrell/
├── client/                 # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Backend (Express + tRPC)
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   └── _core/             # Core framework files
├── drizzle/               # Database schema
│   └── schema.ts          # Table definitions
├── docs/                  # Documentation
│   ├── PRIVACY.md         # Privacy policy
│   ├── TERMS.md           # Terms of service
│   ├── DMCA.md            # DMCA policy
│   └── BRANDING.md        # Brand guidelines
└── README.md              # This file
```

## 🎨 Design System

### Colors
- **Primary (Teal)**: `#00BFA6` - Trust, growth, intelligence
- **Secondary (Coral)**: `#FF6B6B` - Energy, motivation, warmth
- **Background (Cream)**: `#FFF8E1` - Comfort, clarity, focus

### Typography
- **Font**: System font stack (sans-serif)
- **Headings**: Bold (700), clean and modern
- **Body**: Regular (400), readable with 1.5 line height

See [BRANDING.md](./BRANDING.md) for full design guidelines.

## 🔧 Tech Stack

### Frontend
- **React 19**: Modern UI library
- **Vite**: Fast build tool
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **tRPC**: End-to-end type-safe API
- **Wouter**: Lightweight routing

### Backend
- **Express.js**: Web framework
- **tRPC**: Type-safe API layer
- **Drizzle ORM**: Type-safe database queries
- **MySQL/TiDB**: Relational database

### AI & Services
- **OpenAI API**: GPT-4o-mini for question generation, grading, chat
- **Supabase**: Auth, database, file storage
- **Twilio** (optional): SMS notifications

## 📖 Usage

### For Students

1. **Sign Up**: Create a free account (1 year free trial)
2. **Set Up Profile**: Select your grade level (KG to IGCSE)
3. **Generate Quizzes**: Enter a topic and let Mr. T create questions
4. **Take Quizzes**: Answer questions and get instant feedback
5. **Chat with Mr. T**: Ask questions and get personalized help
6. **Upload Notes**: Get AI-generated summaries and flashcards
7. **Track Progress**: Monitor your XP, streaks, and leaderboard rank

### For Teachers

1. **Create a Class**: Set up your classroom
2. **Add Students**: Upload a roster or invite students
3. **Assign Quizzes**: Create and assign custom quizzes
4. **View Analytics**: Track student progress and performance

## 🔐 Security & Privacy

- **Data Encryption**: All data encrypted in transit (HTTPS) and at rest
- **Privacy First**: We do not sell user data
- **DMCA Compliance**: We respect copyright and respond to takedown requests
- **Parental Consent**: Required for users under 18

See [PRIVACY.md](./PRIVACY.md) and [TERMS.md](./TERMS.md) for details.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **IXL**: Inspiration for mastery-based learning
- **SaveMyExams**: Inspiration for comprehensive exam resources
- **Duolingo**: Inspiration for gamification and engagement
- **Eneza**: Inspiration for accessibility and SMS support
- **OpenAI**: For powering Mr. T, our AI tutor

## 📞 Contact

- **Website**: https://tkrell.com
- **Email**: support@tkrell.com
- **Twitter**: @TkrellEdu
- **GitHub**: https://github.com/yourusername/tkrell

---

**Made with ❤️ in Kenya** 🇰🇪

Empowering the next generation of learners with AI-powered education.
