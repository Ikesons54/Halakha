# HALAKHA (הלכה) — Scripture Discovery & Study Platform

> **Walking in the Way of Yeshua: Scripture, Hebrew Roots, and 5-Layer Biblical Discoveries**

Powered by **© Copyright 2026 FWXplus**. All rights reserved.

---

## 📖 Overview

**HALAKHA** is a modern, responsive Scripture exploration and biblical study application designed to connect Tanakh (Torah, Prophets, Writings) and Apostolic writings with their rich Hebrew linguistic roots and historical context.

### Core Features

- **5-Layer Discovery Ideas**: Contextual scripture insights structured around Hook, Summary, Context, Interpretation, and Application.
- **Tanakh & Apostolic Reader**: Division-by-division browsing (Torah, Nevi'im, Ketuvim, Gospels, Epistles) with cross-reference connections.
- **Interactive Biblical Knowledge Graph**: Real-time canvas visualizing typological and thematic relationships across scripture.
- **Curated Study Paths**: Step-by-step modular lessons with progress tracking and completion verification.
- **Personal Stash Repository**: Private saved discoveries, custom collections, and personal reflection notes.
- **Admin CMS Dashboard**: Role-based content curation protected by Row-Level Security (RLS).

---

## 🏗️ Architecture & Database

HALAKHA supports an enterprise-grade dual-database architecture:

### 1. Supabase PostgreSQL & Row Level Security (RLS)
- **Client Configuration**: Initialized in `src/lib/supabase.ts` using credentials from `firebase-applet-config.json` with support for environment variables.
- **Database Schema**: Full PostgreSQL table definitions located in `supabase/schema.sql`, featuring:
  - `profiles`, `topics`, `scriptures`, `ideas`, `study_paths`, `knowledge_graphs`
  - `saved_ideas`, `collections`, `notes`, `user_progress`
  - Granular RLS policies enforcing public read access for curated content, admin-only writes for `ideas` and `scriptures`, and private user-only access (`auth.uid() = user_id`) for reflections and saved collections.

### 2. Firestore Cloud Sub-Collections & Security Rules
- **User Sub-Collections**: Direct isolated paths at `/users/{userId}/saved_ideas`, `/users/{userId}/collections`, `/users/{userId}/notes`, and `/users/{userId}/user_progress`.
- **Security Rules**: Deployed in `firestore.rules` enforcing admin-only writes to top-level `ideas` and `scriptures`, while restricting normal users to their own private sub-collections.

### 3. Unified DatabaseService
- Located at `src/lib/database.ts`.
- Prioritizes Supabase Auth for session handling while providing continuous fallback support.
- Performs real-time subscriptions and CRUD operations directly to user private sub-collections.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd halakha

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application runs on `http://localhost:3000`.

### GitHub Pages Deployment

The Pages workflow requires both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository Actions secrets. Add them under **Settings → Secrets and variables → Actions → Repository secrets**, using the project URL and anon/publishable key from Supabase. The workflow checks these values before building so a missing secret cannot produce a successful but nonfunctional deployment.

### Production Build

```bash
npm run build
npm start
```

---

## 🔒 Security & Admin Access

- **Admin Account**: `savedsoul898@gmail.com` is configured with master administrative privileges in both Firestore security rules and Supabase RLS functions (`public.is_admin()`).
- Non-admin authenticated accounts have read-only access to published study content and exclusive write access to their own notes, progress, and stash entries.

---

## 📄 License & Attribution

Powered by **© Copyright 2026 FWXplus**.
