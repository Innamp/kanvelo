# 🚀 NovaBoard - Sprint Task Manager

A modern, high-performance interactive task management application built with a pastel Kanban design aesthetic (inspired by NovaBoard & Jira), backed by **SQLite** (`database.sqlite`) and ready for immediate deployment on GitHub or local hosting.

---

## ✨ Features

- **Pixel-Accurate UI Design**:
  - Soft sage/mint canvas background with floating app container
  - Vertical floating pill sidebar with brand icon and navigation shortcuts
  - Top header with global search (`⌘S`), notifications, and user profile
  - 4 Pastel Kanban columns:
    - 🌸 **To Do** (`#fdecf2`)
    - 🍑 **In Progress** (`#fef2e4`)
    - 🧊 **In Review** (`#e0f4fc`)
    - 🍇 **Completed** (`#ede8fc`)
- **Interactive Kanban**:
  - HTML5 Drag-and-Drop to move tasks between stages
  - Progress bar with percentage and animated track
  - Priority pills (`High`, `Medium`, `Low`)
  - Assignee avatars, attachment indicators, and comment counters
- **SQLite Database Integration**:
  - Persistent storage in `database.sqlite` via lightweight `api.php`
  - Over 490+ real sprint backlog tasks seeded from sprint tracker
  - Sprint switcher: Sprint 10, Sprint 9, Sprint 8, and All
- **Full CRUD Capabilities**:
  - Add new tasks with title, platform, assignee, stage, and priority
  - Click any card to edit details or delete task
  - Real-time instant updates across all views
- **Multi-View Modes**:
  - **Board View**: 4-column drag-and-drop Kanban
  - **List View**: Jira/Linear-style interactive table
  - **Overview View**: Analytics dashboard with completion rate and workload metrics
  - **Calendar View**: Sprint release timeline
- **GitHub Ready**:
  - Automatic fallback mode enables running on static **GitHub Pages** without server configuration.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties & Flexbox/Grid), Vanilla JavaScript (ES6+)
- **Database**: SQLite3 (`database.sqlite`)
- **Backend API**: PHP 8 (PDO SQLite) via `api.php`

---

## 🚀 Getting Started

### Option 1: Running with PHP Built-in Server (Recommended)
Make sure PHP is installed, then run in the project directory:
```bash
php -S localhost:8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Option 2: Running with XAMPP
1. Place this project inside `C:/xampp/htdocs/sprint/`
2. Start **Apache** from the XAMPP Control Panel.
3. Open **`http://localhost/sprint/`** in your browser.

### Option 3: Deploying to GitHub & GitHub Pages

To publish this project to your GitHub account:

1. **Initialize Git and Commit**:
```bash
git init
git add .
git commit -m "Initial commit: NovaBoard Sprint Task Manager with SQLite"
```

2. **Add Remote & Push to GitHub**:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

3. **Enable GitHub Pages**:
- Go to your repository settings on GitHub: **Settings > Pages**
- Under **Build and deployment**, select:
  - Source: **Deploy from a branch**
  - Branch: `main` / `/ (root)`
- Click **Save**. Your live app will be published instantly!
