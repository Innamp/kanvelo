# 🚀 Kanvelo (React.js + SQLite)

A modern, high-performance sprint task management application built with **React.js** and **Vite**, featuring a pastel Kanban aesthetic and Jira-style workflows, with persistent storage in **SQLite** and immediate compatibility for GitHub Pages deployment.

---

## ✨ Features

- **Built with React.js & Vite**: Fast HMR, reactive state management, and modern component architecture.
- **Pixel-Accurate UI (Reference Design)**:
  - Sage/mint desktop canvas background (`#dce7e1`)
  - Floating rounded app shell (`#f3f8f6`)
  - Floating left pill sidebar with navigation icons and active yellow Board button (`#f5c242`)
  - Top header with search shortcut (`⌘S`), notification bell with active unread dot, and user profile chip
  - Project banner with metadata pills, team avatars stack, and quick actions
  - **4 Pastel Kanban Columns**:
    - 🌸 **To Do** (`#fdecf2`)
    - 🍑 **In Progress** (`#fef2e4`)
    - 🧊 **In Review** (`#e0f4fc`)
    - 🍇 **Completed** (`#ede8fc`)
  - **Task Cards**: Priority tag badges (`High`, `Medium`, `Low`), bold title, notes subtitle, teal progress track with percentage, assignee avatars, attachment count, and comment count.
- **Interactive Drag & Drop**: Move tasks smoothly across stages with real-time updates.
- **SQLite Database Support**: Backed by `database.sqlite` (over 490+ seeded tasks).
- **Multiple Views**: Board view, List view, Overview dashboard (metrics & velocity), and Calendar milestones.
- **Zero Python / Zero Excel Runtime Dependency**: Completely clean and lightweight.
- **GitHub & GitHub Pages Ready**: Includes automatic offline/fallback data sync so the demo works on static hosts without server setup.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS3 (Custom properties, Flexbox, Grid)
- **Database**: SQLite (`database.sqlite`) via lightweight PHP PDO REST API (`api.php`)
- **Offline / Static Support**: LocalStorage & static JSON dataset fallback

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Build for Production / GitHub Pages
```bash
npm run build
```
The optimized bundle is output to `dist/`.

---

## 🐙 Deploying to GitHub & GitHub Pages

1. **Commit All Changes**:
```powershell
git add .
git commit -m "Migrate stack to React.js + SQLite and cleanup legacy files"
```

2. **Push to Your GitHub Repository**:
```powershell
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

3. **Deploy to GitHub Pages**:
- Go to repository **Settings > Pages**
- Set **Source** to **Deploy from a branch**
- Select the `main` branch or use the `dist` build folder
- Your interactive React app will be live on GitHub!
