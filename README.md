# BoardVault — Shared Boardgame Library

A web app for managing a shared boardgame library among friends: track ownership shares, who's housing each game, purchase prices, and cover images.

**Stack:** React + Vite (GitHub Pages) · Supabase (PostgreSQL + Auth + Storage)

---

## ⚡ Quick Setup (~15 minutes)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project** (free tier is enough)
2. Note your **Project URL** and **anon public key** from  
   `Settings → API`

### 2. Run the SQL Schema

In Supabase → **SQL Editor → New Query**, paste and run the entire SQL block found inside `src/lib/supabase.js` (between the `/*` and `*/` comment markers).

This creates:
- `profiles` — user info (name, avatar)
- `boardgames` — game data (title, price, image, current holder)
- `ownership_shares` — % per person per game
- `housing_history` — log of who held each game over time
- Storage bucket `game-images` — for cover photos
- Row Level Security policies
- Auto-create profile trigger on signup

### 3. Configure Auth in Supabase

Go to `Authentication → URL Configuration`:
- **Site URL:** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`
- **Redirect URLs:** add the same URL

### 4. Fork & Configure GitHub Repo

```bash
# Clone / push this project to a new GitHub repo
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Add **Repository Secrets** at `Settings → Secrets → Actions`:

| Secret Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` |

### 5. Enable GitHub Pages

`Settings → Pages → Source → GitHub Actions`

Push any commit to `main` — the site will auto-deploy in ~1 minute.

---

## 🎮 Features

- **Auth** — Email/password sign in & sign up (Supabase Auth)
- **Game Library** — Card grid with cover image, price, housing indicator, ownership bar
- **Add / Edit Games** — Title, description, price, cover image upload, who's housing it, ownership % sliders per member
- **Members Page** — Shows each person's stats (games housed, games shared)
- **Profile** — Edit display name, change password
- **Search & Filter** — By title or by who's housing the games
- **Housing History** — Automatically logged on every save

---

## 🗂 Project Structure

```
src/
  lib/supabase.js        ← Supabase client + SQL schema (comments)
  hooks/useAuth.jsx      ← Auth context (signIn, signUp, signOut)
  components/
    Layout.jsx           ← Nav bar + page shell
    UI.jsx               ← Btn, Card, Modal, Toast, Avatar, Badge...
    GameForm.jsx         ← Add/edit game modal with ownership sliders
  pages/
    LoginPage.jsx        ← Sign in / create account
    HomePage.jsx         ← Library grid + search/filter
    UsersPage.jsx        ← Members list with stats
    ProfilePage.jsx      ← Edit name + change password
.github/workflows/
  deploy.yml             ← Auto-deploy to GitHub Pages on push
```

---

## 🔧 Local Development

```bash
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

---

## 💡 Tips

- **Invite members:** They sign up themselves via the app. Supabase sends a confirmation email.
- **Disable email confirmation** (optional for private groups): Supabase → `Authentication → Email → Confirm email → OFF`
- **Image uploads** go to Supabase Storage bucket `game-images` (public, 50MB free)
- Ownership shares must add up to **100%** to be saved
