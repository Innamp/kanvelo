import React, { useState, useMemo } from 'react';
import { VIEWS, PRIORITY_WEIGHTS } from './constants';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ProjectBanner } from './components/layout/ProjectBanner';
import { ViewTabs } from './components/layout/ViewTabs';
import { FilterBar } from './components/layout/FilterBar';

import { BoardView } from './components/board/BoardView';
import { ListView } from './components/views/ListView';
import { OverviewView, CalendarView, DocumentsView, MessagesView } from './components/views/OverviewView';
import { UserControlPage } from './components/views/UserControlPage';

import { TaskEditModal } from './components/modals/TaskEditModal';
import { TaskCreateModal } from './components/modals/TaskCreateModal';
import { LoginPage } from './components/auth/LoginPage';

function TaskManagerApp() {
  const { showToast } = useToast();
  const {
    sprintId,
    setSprintId,
    tasks,
    moveTaskStage,
    updateTask,
    createTask,
    removeTask
  } = useTasks('sprint-10');

  // UI State
  const [currentView, setCurrentView] = useState(VIEWS.BOARD);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('stage');

  // Modal State
  const [editingTask, setEditingTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const query = search.toLowerCase().trim();

    if (query) {
      result = result.filter(t => (
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.platform && t.platform.toLowerCase().includes(query)) ||
        (t.assignee && t.assignee.toLowerCase().includes(query))
      ));
    }

    if (sortBy === 'priority') {
      result.sort((a, b) => (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0));
    } else if (sortBy === 'mandays') {
      result.sort((a, b) => (parseFloat(b.mandays) || 0) - (parseFloat(a.mandays) || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [tasks, search, sortBy]);

  // Handlers
  const handleSaveEdit = async (updatedTask) => {
    await updateTask(updatedTask);
    setEditingTask(null);
    showToast('Task updated successfully');
  };

  const handleDeleteTask = async (taskId) => {
    await removeTask(taskId);
    setEditingTask(null);
    showToast('Task deleted');
  };

  const handleCreateTask = async (taskInput) => {
    await createTask(taskInput);
    setIsCreateOpen(false);
    showToast('Task created successfully');
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenUserControl={() => setCurrentView(VIEWS.USERS)}
      />

      <main className="workspace">
        <Header
          search={search}
          onSearchChange={setSearch}
          onOpenUserControl={() => setCurrentView(VIEWS.USERS)}
        />
        {/* Top menu (Project Banner, View Tabs, & Filter Bar) only on related task pages (Board & List) */}
        {(currentView === VIEWS.BOARD || currentView === VIEWS.LIST) && (
          <>
            <ProjectBanner />
            <ViewTabs currentView={currentView} onViewChange={setCurrentView} />
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenCreate={() => setIsCreateOpen(true)}
            />
          </>
        )}

        {currentView === VIEWS.BOARD && (
          <BoardView
            tasks={filteredTasks}
            onMoveStage={async (id, stage) => {
              await moveTaskStage(id, stage);
              showToast(`Moved to ${stage.replace('-', ' ')}`);
            }}
            onTaskClick={setEditingTask}
          />
        )}

        {currentView === VIEWS.LIST && (
          <ListView tasks={filteredTasks} onTaskClick={setEditingTask} />
        )}

        {currentView === VIEWS.OVERVIEW && (
          <OverviewView tasks={filteredTasks} onTaskClick={setEditingTask} />
        )}

        {currentView === VIEWS.CALENDAR && (
          <CalendarView />
        )}

        {currentView === VIEWS.DOCUMENTS && (
          <DocumentsView />
        )}

        {currentView === VIEWS.MESSAGES && (
          <MessagesView />
        )}

        {currentView === VIEWS.USERS && (
          <UserControlPage />
        )}
      </main>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteTask}
        />
      )}

      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <TaskManagerApp />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
