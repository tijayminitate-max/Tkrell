# Tkrell Features Implementation Guide

## ✅ Completed Features

### 1. Light/Dark Mode Toggle
**Status:** ✅ IMPLEMENTED

**What was added:**
- `ThemeToggle` component with sun/moon icon
- Added to navigation bar on Home page
- Uses existing ThemeContext for state management
- Fully styled with Tailwind dark mode classes

**Files modified:**
- `client/src/components/ThemeToggle.tsx` (new)
- `client/src/pages/Home.tsx`

**How to use:**
- Click the sun/moon icon in the top navigation
- Theme preference is saved to localStorage
- All pages support dark mode via Tailwind's `dark:` classes

---

### 2. Database Schema Updates
**Status:** ✅ IMPLEMENTED

**New Tables Added:**

#### `uploads` table
- For sharing study materials (PDFs, images, documents)
- Fields: title, description, fileUrl, subject, topic, gradeLevel
- Visibility: public, private, or class-only
- Tracks: downloads, views, likes
- Tags for better organization

#### `conversations` table
- For 1-on-1 direct messaging
- Links two users (participant1 and participant2)
- Tracks last message timestamp

#### `messages` table
- Stores all messages (DMs and class chats)
- Supports: text, file, and image messages
- Links to either a conversation (DM) or class (group chat)
- Tracks read status

#### `likes` table
- Users can like notes and uploads
- Tracks who liked what and when

**Enhanced Tables:**
- `notes` table now has: visibility, tags, views, likes

---

## 🚧 Next Steps - Implementation Needed

### 3. Content Organization System

**Backend (tRPC routes needed):**
```typescript
// server/routers/content.ts
- getPublicNotes(filters: { subject?, gradeLevel?, tags? })
- getPublicUploads(filters: { subject?, gradeLevel?, tags? })
- searchContent(query: string)
- getContentByTag(tag: string)
```

**Frontend Components needed:**
- `ContentBrowser.tsx` - Browse public notes/uploads
- `ContentFilters.tsx` - Filter by subject, grade, tags
- `ContentCard.tsx` - Display note/upload preview
- `TagSelector.tsx` - Select/create tags

**Pages to create:**
- `/browse` - Public content library
- `/notes/:id` - View individual note
- `/uploads/:id` - View/download upload

---

### 4. Upload/Share System

**Backend (tRPC routes needed):**
```typescript
// server/routers/uploads.ts
- createUpload(data: { title, description, file, visibility, tags })
- updateUpload(id, data)
- deleteUpload(id)
- getMyUploads()
- toggleVisibility(id, visibility)
- likeUpload(id)
- incrementDownload(id)
```

**Frontend Components needed:**
- `UploadForm.tsx` - Upload files with metadata
- `UploadList.tsx` - List user's uploads
- `UploadCard.tsx` - Display upload with actions
- `VisibilitySelector.tsx` - Choose public/private/class

**File Upload Integration:**
- Use AWS S3 (already configured in your project)
- Or integrate with Supabase Storage
- Max file size: 10MB for free tier

**Pages to update:**
- `/upload` - Already exists, needs enhancement
- `/profile` - Show user's uploads

---

### 5. Chat/DM System

**Backend (tRPC routes needed):**
```typescript
// server/routers/chat.ts
- getConversations() - List all user's DMs
- getConversation(userId) - Get/create conversation with user
- sendMessage(conversationId, content, type)
- getMessages(conversationId, limit, offset)
- markAsRead(messageId)
- getClassMessages(classId)
- sendClassMessage(classId, content)
```

**Frontend Components needed:**
- `ChatSidebar.tsx` - List of conversations
- `ChatWindow.tsx` - Message thread
- `MessageInput.tsx` - Send messages
- `MessageBubble.tsx` - Display individual message
- `UserSearch.tsx` - Find users to message

**Real-time features (optional):**
- Use WebSockets or Supabase Realtime
- Show typing indicators
- Push notifications for new messages

**Pages to create:**
- `/messages` - Main chat interface
- `/messages/:conversationId` - Specific conversation

---

## 📋 Implementation Priority

### Phase 1 (Essential - Do First)
1. ✅ Light/Dark Mode - DONE
2. ✅ Database Schema - DONE
3. 🔄 Upload System - Start here
4. 🔄 Content Organization

### Phase 2 (Important)
5. 🔄 Basic Chat/DM System
6. 🔄 Supabase Auth Integration

### Phase 3 (Enhancement)
7. Real-time chat features
8. Advanced content filtering
9. Notifications system

---

## 🔧 Quick Start Commands

### Run database migrations:
```bash
cd tkrell-refactored
pnpm db:push
```

### Start development server:
```bash
pnpm dev
```

### Build for production:
```bash
pnpm build
```

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **tRPC Docs:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **AWS S3 Upload:** Already configured in `server/storage.ts`

---

## 🎯 Feature Specifications

### Content Visibility Rules:
- **Public:** Anyone can view (even without login)
- **Private:** Only the creator can view
- **Class:** Only class members can view

### User Roles:
- **Student:** Can upload, share, chat with other students
- **Teacher:** Can upload, share, chat with students, manage classes
- **Admin:** Full access to all features

### File Upload Limits:
- Free tier: 10MB per file, 100MB total
- Premium tier: 50MB per file, 1GB total

---

## 💡 Tips for Implementation

1. **Start with backend routes** - Get data flowing first
2. **Test with Postman/Thunder Client** - Verify routes work
3. **Build UI components** - One feature at a time
4. **Add error handling** - Show user-friendly messages
5. **Test on mobile** - Ensure responsive design

---

## 🐛 Known Issues to Address

1. Vercel environment variables not set (VITE_APP_TITLE, VITE_APP_LOGO)
2. Backend URL needs verification (https://tkrell.onrender.com)
3. OAuth configuration warnings (can be ignored if not using OAuth)

---

## 📞 Need Help?

- Check the existing code in `server/routers/` for examples
- Look at `client/src/pages/` for UI patterns
- Review `drizzle/schema.ts` for database structure

