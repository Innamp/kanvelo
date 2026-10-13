import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_SPRINT_MASTERS } from '../data/sprintMasterData';
import { SPRINT_STATUSES, SPRINT_HEALTH } from '../constants/sprintConstants';
import { getSprintTasks, saveSprintTasks } from '../services/sprintTaskAdapter';

const SPRINT_STORAGE_KEY = 'kanvelo_sprints_master_v1';
const SprintContext = createContext(null);

export function SprintProvider({ children }) {
  // Sprints state (Master Data for Sprint 1 to 10)
  const [sprints, setSprints] = useState(() => {
    const cached = localStorage.getItem(SPRINT_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached sprints', e);
      }
    }
    return INITIAL_SPRINT_MASTERS;
  });

  // Selected Sprint Filter for global app ('all' or 'sprint-1'..'sprint-10')
  const [selectedSprintId, setSelectedSprintId] = useState('sprint-10');

  // Currently opened Sprint Detail page (null or 'sprint-10')
  const [activeDetailSprintId, setActiveDetailSprintId] = useState(null);

  // Sync sprints to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(sprints));
    } catch (e) {
      console.error('Failed to save sprints to localStorage', e);
    }
  }, [sprints]);

  // Tasks cache map: sprintId -> tasks array
  const [tasksVersion, setTasksVersion] = useState(0);

  const getTasksForSprint = useCallback((sprintId) => {
    if (!sprintId || sprintId === 'all') {
      // Aggregate all sprint tasks
      const all = [];
      sprints.forEach(s => {
        const list = getSprintTasks(s.id);
        all.push(...list);
      });
      return all;
    }
    return getSprintTasks(sprintId);
  }, [sprints, tasksVersion]);

  // Active sprint object
  const activeSprint = useMemo(() => {
    if (selectedSprintId === 'all') {
      return sprints.find(s => s.status === SPRINT_STATUSES.ACTIVE) || sprints[sprints.length - 1];
    }
    return sprints.find(s => s.id === selectedSprintId) || sprints[sprints.length - 1];
  }, [sprints, selectedSprintId]);

  // Detail sprint object
  const detailSprint = useMemo(() => {
    if (!activeDetailSprintId) return null;
    return sprints.find(s => s.id === activeDetailSprintId) || null;
  }, [sprints, activeDetailSprintId]);

  // Comprehensive Metrics Calculator for a specific sprint or all
  const getSprintMetrics = useCallback((sprintId) => {
    const targetSprint = sprints.find(s => s.id === sprintId);
    const capacity = targetSprint ? targetSprint.capacity : 200;
    const taskList = getTasksForSprint(sprintId);

    const totalTickets = taskList.length;
    let totalPlannedMandays = 0;
    let totalConsumedMandays = 0;
    let deployedCount = 0;
    let inDevCount = 0;
    let inUatCount = 0;
    let carryOverCount = 0;
    let deprioritizedCount = 0;
    let cancelledCount = 0;
    let readyToDeployCount = 0;
    let overdueCount = 0;

    const platformMap = {};
    const pmMap = {};
    const statusMap = {};
    const teamMap = {};
    const exceedingTickets = [];

    const now = new Date();

    taskList.forEach(t => {
      const pMd = parseFloat(t.planned_mandays || t.mandays) || 0;
      const cMd = parseFloat(t.consumed_mandays) || 0;
      totalPlannedMandays += pMd;
      totalConsumedMandays += cMd;

      if (cMd > pMd && pMd > 0) {
        exceedingTickets.push(t);
      }

      // Status counters
      const st = (t.stage || '').toLowerCase();
      const lc = (t.lifecycle_stage || '').toLowerCase();

      if (st === 'completed' || lc === 'deployed') deployedCount++;
      else if (st === 'review' || lc === 'uat') inUatCount++;
      else if (st === 'in-progress' || lc === 'development' || lc === 'code-review') inDevCount++;

      if (lc === 'ready-deploy') readyToDeployCount++;
      if (lc === 'deprioritized') deprioritizedCount++;
      if (lc === 'cancelled') cancelledCount++;

      if (t.carry_over === 'Yes' || t.cross_sprint === 'Yes' || lc === 'carry-over') {
        carryOverCount++;
      }

      // Check overdue: target date is in the past and not completed
      if (t.expected_deployment_date && st !== 'completed' && lc !== 'deployed') {
        const expDate = new Date(t.expected_deployment_date);
        if (expDate < now) overdueCount++;
      }

      // Platform breakdown
      const p = t.platform || 'General';
      platformMap[p] = (platformMap[p] || 0) + pMd;

      // PM breakdown
      const pm = t.pm || t.business_owner_pic || 'Unassigned';
      pmMap[pm] = (pmMap[pm] || 0) + pMd;

      // Status breakdown
      const statusLabel = t.stage ? t.stage.replace('-', ' ').toUpperCase() : 'TODO';
      statusMap[statusLabel] = (statusMap[statusLabel] || 0) + 1;

      // Dev Team breakdown
      const team = t.sub_platform || 'Core Dev';
      teamMap[team] = (teamMap[team] || 0) + pMd;
    });

    totalPlannedMandays = Math.round(totalPlannedMandays * 10) / 10;
    totalConsumedMandays = Math.round(totalConsumedMandays * 10) / 10;
    const capacityRemaining = Math.max(0, Math.round((capacity - totalPlannedMandays) * 10) / 10);
    const utilizationPct = capacity > 0 ? Math.round((totalPlannedMandays / capacity) * 100) : 0;
    const completionPct = totalTickets > 0 ? Math.round((deployedCount / totalTickets) * 100) : 0;

    return {
      sprintId,
      totalTickets,
      totalPlannedMandays,
      plannedMandays: totalPlannedMandays,
      totalConsumedMandays,
      consumedMandays: totalConsumedMandays,
      capacity,
      capacityRemaining,
      remainingCapacity: capacityRemaining,
      utilizationPct,
      utilizationRate: utilizationPct,
      completionPct,
      completionRate: completionPct,
      deployedCount,
      deployedTickets: deployedCount,
      inDevCount,
      devTickets: inDevCount,
      inUatCount,
      uatTickets: inUatCount,
      carryOverCount,
      carryOverTickets: carryOverCount,
      deprioritizedCount,
      deprioritizedTickets: deprioritizedCount,
      cancelledCount,
      readyToDeployCount,
      readyToDeployTickets: readyToDeployCount,
      overdueCount,
      overdueTickets: overdueCount,
      isOverCapacity: totalPlannedMandays > capacity,
      capacityOverage: Math.max(0, Math.round((totalPlannedMandays - capacity) * 10) / 10),
      platformMap,
      byPlatform: platformMap,
      pmMap,
      byPM: pmMap,
      statusMap,
      byStatus: statusMap,
      teamMap,
      byTeam: teamMap,
      exceedingTickets
    };
  }, [sprints, getTasksForSprint]);

  // Update Sprint Master Fields
  const updateSprint = useCallback((sprintId, fields) => {
    setSprints(prev => prev.map(s => (s.id === sprintId ? { ...s, ...fields } : s)));
  }, []);

  // Update Phase inside Sprint
  const updatePhase = useCallback((sprintId, phaseId, fields) => {
    setSprints(prev => prev.map(s => {
      if (s.id !== sprintId) return s;
      const updatedPhases = s.phases.map(p => (p.id === phaseId ? { ...p, ...fields } : p));
      return { ...s, phases: updatedPhases };
    }));
  }, []);

  // Lock Sprint
  const lockSprint = useCallback((sprintId) => {
    updateSprint(sprintId, { status: SPRINT_STATUSES.LOCKED });
  }, [updateSprint]);

  // Complete Sprint
  const completeSprint = useCallback((sprintId) => {
    updateSprint(sprintId, {
      status: SPRINT_STATUSES.COMPLETED,
      currentPhase: 'Release Note',
      health: SPRINT_HEALTH.ON_TRACK
    });
  }, [updateSprint]);

  // Create new Sprint
  const createSprint = useCallback((newSprintData) => {
    const nextNum = sprints.length + 1;
    const newSprint = {
      id: `sprint-${nextNum}`,
      number: nextNum,
      name: newSprintData.name || `Sprint ${nextNum}`,
      year: newSprintData.year || new Date().getFullYear(),
      startDate: newSprintData.startDate || new Date().toISOString().split('T')[0],
      endDate: newSprintData.endDate || new Date().toISOString().split('T')[0],
      status: SPRINT_STATUSES.PLANNED,
      currentPhase: 'BRD Submission',
      capacity: parseInt(newSprintData.capacity, 10) || 180,
      objective: newSprintData.objective || 'Sprint objective pending finalization',
      owner: newSprintData.owner || 'Inna MP',
      health: SPRINT_HEALTH.ON_TRACK,
      keyRisks: '',
      dependencies: '',
      remarks: '',
      phases: []
    };
    setSprints(prev => [...prev, newSprint]);
    return newSprint;
  }, [sprints]);

  // Move Ticket Across Sprints
  const moveTicketSprint = useCallback((ticketId, sourceSprintId, targetSprintId, reason = '') => {
    const sourceTasks = getSprintTasks(sourceSprintId);
    const targetTasks = getSprintTasks(targetSprintId);
    const ticket = sourceTasks.find(t => t.id === ticketId);
    if (!ticket) return;

    // Remove from source
    const updatedSource = sourceTasks.filter(t => t.id !== ticketId);
    saveSprintTasks(sourceSprintId, updatedSource);

    // Update ticket metadata
    const historyEntry = {
      sprint: targetSprintId,
      date: new Date().toISOString().split('T')[0],
      action: 'Moved to Sprint',
      reason: reason || 'Planned cross-sprint realignment',
      user: 'Inna MP'
    };

    const updatedTicket = {
      ...ticket,
      current_sprint: targetSprintId,
      previous_sprint: sourceSprintId,
      cross_sprint: 'Yes',
      carry_over: 'Yes',
      carry_over_reason: reason || ticket.carry_over_reason || 'Moved to next sprint',
      sprint_history: [...(ticket.sprint_history || []), historyEntry]
    };

    // Add to target
    saveSprintTasks(targetSprintId, [updatedTicket, ...targetTasks]);
    setTasksVersion(v => v + 1);
  }, []);

  const openSprintDetail = useCallback((sprintId) => {
    setActiveDetailSprintId(sprintId);
  }, []);

  const closeSprintDetail = useCallback(() => {
    setActiveDetailSprintId(null);
  }, []);

  const value = {
    sprints,
    selectedSprintId,
    setSelectedSprintId,
    activeDetailSprintId,
    setActiveDetailSprintId,
    activeSprint,
    detailSprint,
    getTasksForSprint,
    getSprintMetrics,
    updateSprint,
    updatePhase,
    lockSprint,
    completeSprint,
    createSprint,
    moveTicketSprint,
    openSprintDetail,
    closeSprintDetail,
    refreshTasks: () => setTasksVersion(v => v + 1)
  };

  return (
    <SprintContext.Provider value={value}>
      {children}
    </SprintContext.Provider>
  );
}

export function useSprint() {
  const context = useContext(SprintContext);
  if (!context) {
    throw new Error('useSprint must be used within a SprintProvider');
  }
  return context;
}
