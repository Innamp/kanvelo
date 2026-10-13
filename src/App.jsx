import React, { useState, useMemo } from 'react';
import { VIEWS, PRIORITY_WEIGHTS, DEFAULT_PLATFORMS } from './constants';
import { extractUniquePlatforms, extractUniqueAssignees, splitMultiValue } from './utils/taskHelpers';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SprintProvider, useSprint } from './context/SprintContext';
import { useTasks } from './hooks/useTasks';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ProjectBanner } from './components/layout/ProjectBanner';
import { ViewTabs } from './components/layout/ViewTabs';
import { FilterBar } from './components/layout/FilterBar';

import { BoardView } from './components/board/BoardView';
import { ListView } from './components/views/ListView';
import { OverviewView, DocumentsView, MessagesView } from './components/views/OverviewView';
import { UserControlView } from './components/views/UserControlView';
import { SprintListView } from './components/sprints/SprintListView';
import { SprintDetailView } from './components/sprints/SprintDetailView';
import { BacklogView } from './components/views/BacklogView';
import { TimelineView } from './components/views/TimelineView';
import { SprintCalendarView } from './components/views/SprintCalendarView';
import { SprintComparisonReport } from './components/views/SprintComparisonReport';
import { SprintConfigView } from './components/views/SprintConfigView';

import { TaskEditModal } from './components/modals/TaskEditModal';
import { TaskCreateModal } from './components/modals/TaskCreateModal';
import { LoginPage } from './components/auth/LoginPage';

function TaskManagerApp() {
  const { showToast } = useToast();
  const { users } = useAuth();
  const {
    activeDetailSprintId,
    openSprintDetail,
    closeSprintDetail,
    selectedSprintId,
    getTasksForSprint
  } = useSprint();

  const {
    sprintId,
    setSprintId,
    tasks,
    moveTaskStage,
    updateTask,
    createTask,
    removeTask
  } = useTasks(selectedSprintId === 'all' ? 'sprint-10' : selectedSprintId);

  // Suggestions for platform and assignee
  const platformSuggestions = useMemo(() => {
    return extractUniquePlatforms(tasks, DEFAULT_PLATFORMS);
  }, [tasks]);

  const assigneeSuggestions = useMemo(() => {
    return extractUniqueAssignees(tasks, users);
  }, [users, tasks]);

  // UI State: default to Sprints or Board
  const [currentView, setCurrentView] = useState(VIEWS.SPRINTS);
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
      result = result.filter(t => {
        const pList = splitMultiValue(t.platforms || t.platform);
        const aList = splitMultiValue(t.assignees || t.assignee);
        return (
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.ticket_code && t.ticket_code.toLowerCase().includes(query)) ||
          pList.some(p => p.toLowerCase().includes(query)) ||
          aList.some(a => a.toLowerCase().includes(query))
        );
      });
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

  const handleViewChange = (newView) => {
    if (newView === VIEWS.SPRINTS) {
      closeSprintDetail();
    }
    setCurrentView(newView);
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenUserControl={() => setCurrentView(VIEWS.USERS)}
      />

      <main className="workspace">
        <Header
          search={search}
          onSearchChange={setSearch}
          onOpenUserControl={() => setCurrentView(VIEWS.USERS)}
        />

        {/* Top menu (Project Banner, View Tabs, & Filter Bar) on standard task views */}
        {(currentView === VIEWS.KANBAN || currentView === VIEWS.TICKET_LIST) && (
          <>
            <ProjectBanner />
            <ViewTabs currentView={currentView} onViewChange={handleViewChange} />
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenCreate={() => setIsCreateOpen(true)}
            />
          </>
        )}

        {/* 1. SPRINT LIST & SPRINT DETAIL VIEWS */}
        {currentView === VIEWS.SPRINTS && (
          activeDetailSprintId ? (
            <SprintDetailView
              sprintId={activeDetailSprintId}
              onBack={() => closeSprintDetail()}
              onTaskClick={setEditingTask}
            />
          ) : (
            <SprintListView
              onSelectSprint={(sId) => openSprintDetail(sId)}
            />
          )
        )}

        {currentView === VIEWS.SPRINT_DETAIL && (
          <SprintDetailView
            sprintId={activeDetailSprintId || 'sprint-10'}
            onBack={() => {
              closeSprintDetail();
              setCurrentView(VIEWS.SPRINTS);
            }}
            onTaskClick={setEditingTask}
          />
        )}

        {/* 2. DASHBOARD VIEW */}
        {currentView === VIEWS.DASHBOARD && (
          <OverviewView tasks={filteredTasks} onTaskClick={setEditingTask} />
        )}

        {/* 3. BACKLOG VIEW */}
        {currentView === VIEWS.BACKLOG && (
          <BacklogView onTaskClick={setEditingTask} />
        )}

        {/* 4. TICKET LIST VIEW */}
        {currentView === VIEWS.TICKET_LIST && (
          <ListView tasks={filteredTasks} onTaskClick={setEditingTask} />
        )}

        {/* 5. KANBAN VIEW */}
        {currentView === VIEWS.KANBAN && (
          <BoardView
            tasks={filteredTasks}
            onMoveStage={async (id, stage) => {
              await moveTaskStage(id, stage);
              showToast(`Moved to ${stage.replace('-', ' ')}`);
            }}
            onTaskClick={setEditingTask}
          />
        )}

        {/* 6. TIMELINE VIEW */}
        {currentView === VIEWS.TIMELINE && (
          <TimelineView
            onSelectSprint={(sId) => {
              openSprintDetail(sId);
              setCurrentView(VIEWS.SPRINT_DETAIL);
            }}
          />
        )}

        {/* 7. CALENDAR VIEW */}
        {currentView === VIEWS.CALENDAR && (
          <SprintCalendarView />
        )}

        {/* 8. REPORTS VIEW */}
        {currentView === VIEWS.REPORTS && (
          <SprintComparisonReport />
        )}

        {/* 9. CONFIGURATION VIEW */}
        {currentView === VIEWS.CONFIGURATION && (
          <SprintConfigView />
        )}

        {/* 10. USER CONTROL & SYSTEM VIEWS */}
        {currentView === VIEWS.USERS && (
          <UserControlView />
        )}

        {currentView === VIEWS.DOCUMENTS && (
          <DocumentsView />
        )}

        {currentView === VIEWS.MESSAGES && (
          <MessagesView />
        )}
      </main>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteTask}
          platformSuggestions={platformSuggestions}
          assigneeSuggestions={assigneeSuggestions}
        />
      )}

      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTask}
        platformSuggestions={platformSuggestions}
        assigneeSuggestions={assigneeSuggestions}
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
        <SprintProvider>
          <AppContent />
        </SprintProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
