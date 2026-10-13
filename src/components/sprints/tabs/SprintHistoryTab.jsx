import React, { useMemo } from 'react';
import { ArrowRightIcon } from '../../common/Icons';

export function SprintHistoryTab({ sprint, tasks }) {
  // Extract all cross-sprint and carry-over tickets in this sprint
  const crossSprintTickets = useMemo(() => {
    return tasks.filter(t => t.cross_sprint === 'Yes' || t.carry_over === 'Yes' || t.is_carry_over);
  }, [tasks]);

  // Aggregate all sprint history events across tickets
  const historyEvents = useMemo(() => {
    const list = [];

    // Add phase gate log events from the sprint
    (sprint.phases || []).forEach(phase => {
      if (phase.actualStartDate) {
        list.push({
          id: `phase-${phase.id}-start`,
          date: phase.actualStartDate,
          type: 'Phase Gate',
          title: `Phase Started: ${phase.name}`,
          actor: phase.owner || 'PMO Lead',
          detail: `Phase marked ${phase.status} (${phase.progress}% progress)`,
          badgeClass: 'badge-phase'
        });
      }
      if (phase.actualEndDate) {
        list.push({
          id: `phase-${phase.id}-end`,
          date: phase.actualEndDate,
          type: 'Phase Completion',
          title: `Phase Gate Passed: ${phase.name}`,
          actor: phase.owner || 'PMO Lead',
          detail: 'Phase sign-off completed and gate successfully passed.',
          badgeClass: 'badge-completed'
        });
      }
    });

    // Add ticket movements
    tasks.forEach(t => {
      if (t.sprint_history && Array.isArray(t.sprint_history)) {
        t.sprint_history.forEach((h, hIdx) => {
          list.push({
            id: `ticket-${t.id}-${hIdx}`,
            date: h.date || sprint.startDate,
            type: 'Ticket Movement',
            title: `Ticket ${t.ticket_code || t.code || 'S-TKT'} Moved`,
            actor: h.user || 'Inna MP',
            detail: `${h.action || 'Moved to ' + sprint.name}. Reason: ${h.reason || t.carry_over_reason || 'Cross-sprint progression'}`,
            badgeClass: 'badge-ticket'
          });
        });
      } else if (t.carry_over === 'Yes' || t.is_carry_over) {
        list.push({
          id: `ticket-${t.id}-carry`,
          date: sprint.startDate,
          type: 'Carry-Over',
          title: `Ticket ${t.ticket_code || t.code || 'S-TKT'} Carried Over`,
          actor: 'PMO / Commercial Team',
          detail: `Carried over from ${t.previous_sprint || 'previous sprint'}. Reason: ${t.carry_over_reason || 'Dependencies pending verification'}`,
          badgeClass: 'badge-ticket'
        });
      }
    });

    // Sort newest date first
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sprint, tasks]);

  return (
    <div className="sprint-history-tab animate-fade-in">
      {/* Cross-Sprint Progression Chains */}
      <div className="cross-sprint-chains-card card-styled">
        <div className="chains-head-row">
          <div>
            <h4>Cross-Sprint & Carry-Over Trails</h4>
            <p className="text-muted">
              Non-duplicating tickets active across multiple sprint iterations
            </p>
          </div>
          <span className="badge-trail-count">
            {crossSprintTickets.length} Multi-Sprint Tickets
          </span>
        </div>

        {crossSprintTickets.length === 0 ? (
          <p className="no-tickets-text">No cross-sprint or carry-over tickets in this sprint.</p>
        ) : (
          <div className="chains-list-grid">
            {crossSprintTickets.map(t => {
              const startSprint = t.ticket_1st_shown || t.first_shown_sprint || `Sprint ${Math.max(1, sprint.number - 1)}`;
              const currentSprint = sprint.name;
              const targetSprint = t.target_deployment_sprint || t.cross_sprint_to || currentSprint;

              return (
                <div key={t.id} className="chain-card-item card-styled">
                  <div className="chain-top-row">
                    <span className="code-chip">{t.ticket_code || t.code || 'S-TKT'}</span>
                    <span className="chain-status-tag">{t.ticket_status || t.stage || 'In Progress'}</span>
                  </div>

                  <strong className="chain-ticket-title">{t.title}</strong>

                  {/* Visual Sprint Progression Ribbon */}
                  <div className="sprint-chain-ribbon">
                    <span className="chain-step-node">{startSprint}</span>
                    <ArrowRightIcon size={14} className="chain-arrow" />
                    <span className="chain-step-node active-node">{currentSprint}</span>
                    {targetSprint !== currentSprint && (
                      <>
                        <ArrowRightIcon size={14} className="chain-arrow" />
                        <span className="chain-step-node target-node">{targetSprint}</span>
                      </>
                    )}
                  </div>

                  <div className="chain-reason-block">
                    <span className="reason-label">Carry-over / Movement Reason:</span>
                    <p className="reason-text">{t.carry_over_reason || t.reason_cancel_deprio || 'Scope prioritized for multi-sprint delivery.'}</p>
                  </div>

                  <div className="chain-meta-row">
                    <span>Platform: <strong>{t.platforms || t.platform || 'General'}</strong></span>
                    <span>Assignee: <strong>{t.assignees || t.assignee || 'Unassigned'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log Timeline */}
      <div className="audit-timeline-card card-styled">
        <div className="audit-head-row">
          <h4>Sprint Audit Log & Execution History</h4>
          <span className="text-muted">Chronological record of phase transitions and ticket movements</span>
        </div>

        <div className="timeline-events-feed">
          {historyEvents.slice(0, 30).map((evt) => (
            <div key={evt.id} className="timeline-event-row">
              <div className="event-date-col">
                <span className="event-date-badge">{evt.date}</span>
                <span className={`event-type-badge ${evt.badgeClass}`}>{evt.type}</span>
              </div>

              <div className="event-content-col">
                <div className="event-title-line">
                  <strong className="event-title-text">{evt.title}</strong>
                  <span className="event-actor-text">by {evt.actor}</span>
                </div>
                <p className="event-detail-text">{evt.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
