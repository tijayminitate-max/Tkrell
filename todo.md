# Tkrell Project TODO

## Phase 1: Database Schema & Project Structure
- [x] Extend database schema with all required tables (users, quizzes, questions, results, notes, uploads, past_papers, leaderboard, ai_cache, chats, analytics_events, referrals, classes, student_profiles, syllabus)
- [x] Add gamification fields to users table (xp, coins, streak, level, streak_freeze_tokens, free_expires_at)
- [x] Create student profiles table for grade/level selection (KG1-KG2, P1-P8, F1-F4, IGCSE)
- [x] Set up file structure for legal documents (PRIVACY.md, TERMS.md, DMCA.md, BRANDING.md)

## Phase 2: AI Backend Services & tRPC Procedures
- [x] Implement AI question generator procedure (topic → 5-10 KCSE-style questions)
- [x] Implement AI grader procedure (MCQ, short answer, essay support)
- [x] Implement upload & summarize procedure (PDF/DOCX → notes + flashcards + quiz)
- [x] Implement Mr. T AI tutor chat procedure with persona
- [ ] Create classroom management procedures (create class, upload roster, assign quizzes)
- [x] Implement referral system procedures (create, redeem)
- [x] Implement analytics & leaderboard procedures
- [x] Add AI response caching to reduce costs
- [ ] Create fallback to seed questions when no OpenAI key

## Phase 3: Frontend UI with Gamification
- [x] Design color palette (teal #00BFA6, coral #FF6B6B, cream #FFF8E1)
- [x] Create landing page with hero, CTA, testimonials
- [x] Build dashboard showing streak, XP, coins, level, recent quizzes
- [x] Create quiz generation & taking interface
- [x] Build upload interface for PDFs/documents
- [x] Create notes/flashcards viewer
- [x] Implement Mr. T chat interface
- [x] Add gamification elements (XP notifications, streak counter, confetti on perfect scores)
- [x] Create grade/level selector in profile
- [ ] Build classroom interface for teachers
- [ ] Implement referral code system UI
- [x] Create leaderboard page (county/school-based ranking)
- [x] Add progress bars and mastery tracking

## Phase 4: Offline Support & Seed Data
- [ ] Implement PWA configuration
- [ ] Add localStorage caching for offline mode
- [ ] Create seed_questions.json with sample KCSE questions
- [ ] Implement offline fallback logic in AI procedures

## Phase 5: Testing & Documentation
- [x] Test end-to-end quiz flow (generate → answer → grade → XP update)
- [ ] Test upload PDF → summary + questions
- [x] Test Mr. T chat responses
- [ ] Test referral code rewards
- [ ] Verify gamification updates (XP, streaks, coins)
- [x] Test multi-level support (KG, Primary, Secondary, IGCSE)
- [x] Create comprehensive README with setup instructions
- [x] Write PRIVACY.md, TERMS.md, DMCA.md
- [x] Create BRANDING.md with design guidelines
- [x] Save checkpoint for deployment


## Phase 6: PWA & Offline Support
- [ ] Create PWA manifest.json with app icons
- [ ] Implement service worker for offline caching
- [ ] Add seed_questions.json with 100+ KCSE questions
- [ ] Implement offline fallback in quiz generator
- [ ] Add install prompt for mobile devices

## Phase 7: Classroom Management
- [ ] Create classroom creation UI
- [ ] Build student roster upload (CSV)
- [ ] Implement quiz assignment interface
- [ ] Add teacher analytics dashboard
- [ ] Create student progress tracking

## Phase 8: Referral System
- [ ] Build referral code generation UI
- [ ] Create referral tracking page
- [ ] Add rewards display and redemption
- [ ] Implement social sharing buttons
- [ ] Add referral leaderboard

## Phase 9: Competitive Improvements
- [ ] Add daily challenges feature
- [ ] Implement achievement badges system
- [ ] Create study timer with Pomodoro technique
- [ ] Add voice input for questions (accessibility)
- [ ] Implement dark mode toggle
- [ ] Add progress analytics charts
- [ ] Create personalized study recommendations
- [ ] Add peer-to-peer study groups

## Phase 10: Deployment Preparation
- [ ] Configure custom domain settings
- [ ] Create deployment documentation
- [ ] Prepare ZIP package for download
- [ ] Add Vercel configuration
- [ ] Add Railway configuration
