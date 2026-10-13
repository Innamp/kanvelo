import React, { useMemo } from 'react';
import { useSprint } from '../../context/SprintContext';
import { useToast } from '../../context/ToastContext';
import { BarChartIcon } from '../common/Icons';

export function SprintComparisonReport() {
  const { sprints, getSprintMetrics } = useSprint();
  const { showToast } = useToast();

  // Compute metrics for all 10 sprints
  const sprintComparisonData = useMemo(() => {
    return sprints.map(sprint => {
      const metrics = getSprintMetrics(sprint.id);
      return {
        id: sprint.id,
        number: sprint.number,
        name: sprint.name,
        year: sprint.year,
        status: sprint.status,
        capacity: sprint.capacity,
        totalTickets: metrics.totalTickets,
        plannedMandays: metrics.plannedMandays,
        consumedMandays: metrics.consumedMandays,
        utilizationRate: metrics.utilizationRate,
        completionRate: metrics.completionRate,
        deployedTickets: metrics.deployedTickets,
        carryOverTickets: metrics.carryOverTickets,
        deprioritizedTickets: metrics.deprioritizedTickets,
        overdueTickets: metrics.overdueTickets
      };
    });
  }, [sprints, getSprintMetrics]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Sprint Number',
      'Sprint Name',
      'Year',
      'Status',
      'Capacity (MD)',
      'Total Tickets',
      'Planned Mandays (MD)',
      'Consumed Mandays (MD)',
      'Utilization (%)',
      'Completion (%)',
      'Deployed Tickets',
      'Carry-Over Tickets',
      'Deprioritized Tickets',
      'Overdue Tickets'
    ];

    const rows = sprintComparisonData.map(d => [
      d.number,
      `"${d.name}"`,
      d.year,
      `"${d.status}"`,
      d.capacity,
      d.totalTickets,
      d.plannedMandays,
      d.consumedMandays,
      d.utilizationRate,
      d.completionRate,
      d.deployedTickets,
      d.carryOverTickets,
      d.deprioritizedTickets,
      d.overdueTickets
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kanvelo_sprint_comparison_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Sprint comparison report exported to CSV successfully');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="sprint-comparison-page animate-fade-in">
      {/* Header & Export Actions */}
      <div className="report-header-card card-styled">
        <div className="report-title-wrap">
          <div className="report-icon-box">
            <BarChartIcon size={24} />
          </div>
          <div>
            <h2>Sprint Comparison Report</h2>
            <p className="text-muted">
              Cross-sprint benchmark analyzing capacity, velocity, completion, and carry-over from Sprint 1 to Sprint 10
            </p>
          </div>
        </div>

        <div className="report-actions-wrap">
          <button className="btn-secondary btn-sm" onClick={handleExportCSV}>
            📥 Export to CSV
          </button>
          <button className="btn-primary btn-sm" onClick={handlePrintPDF}>
            📄 Print / PDF
          </button>
        </div>
      </div>

      {/* Visual Velocity & Comparison Charts */}
      <div className="report-charts-grid">
        {/* Mandays vs Capacity Comparison */}
        <div className="report-chart-card card-styled">
          <h4>Planned Mandays vs Sprint Capacity</h4>
          <span className="text-muted text-xs">Comparison of estimated workload vs team capacity</span>

          <div className="chart-bars-wrap">
            {sprintComparisonData.map(d => {
              const maxVal = 250;
              const capPct = Math.min(100, (d.capacity / maxVal) * 100);
              const planPct = Math.min(100, (d.plannedMandays / maxVal) * 100);

              return (
                <div key={d.id} className="chart-bar-group">
                  <div className="bar-towers">
                    <div
                      className="bar-tower tower-capacity"
                      style={{ height: `${capPct}%` }}
                      title={`${d.name} Capacity: ${d.capacity} MD`}
                    />
                    <div
                      className={`bar-tower tower-planned ${d.plannedMandays > d.capacity ? 'tower-over' : ''}`}
                      style={{ height: `${planPct}%` }}
                      title={`${d.name} Planned: ${d.plannedMandays} MD`}
                    />
                  </div>
                  <span className="tower-label">S{d.number}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-legend-row">
            <span className="legend-item"><span className="legend-box cap-box"></span> Capacity</span>
            <span className="legend-item"><span className="legend-box plan-box"></span> Planned MD</span>
            <span className="legend-item"><span className="legend-box over-box"></span> Over Capacity</span>
          </div>
        </div>

        {/* Completion & Deployed Tickets Comparison */}
        <div className="report-chart-card card-styled">
          <h4>Ticket Completion Rate (%) Across Sprints</h4>
          <span className="text-muted text-xs">Delivery rate percentage per sprint cycle</span>

          <div className="chart-bars-wrap">
            {sprintComparisonData.map(d => {
              return (
                <div key={d.id} className="chart-bar-group">
                  <div className="bar-towers">
                    <div
                      className="bar-tower tower-completion"
                      style={{ height: `${d.completionRate}%` }}
                      title={`${d.name} Completion: ${d.completionRate}%`}
                    />
                  </div>
                  <span className="tower-label">S{d.number}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-legend-row">
            <span className="legend-item"><span className="legend-box comp-box"></span> Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Sprints Comparison Table */}
      <div className="report-table-card card-styled">
        <div className="table-head-row">
          <h4>Sprint 1 to Sprint 10 Metric Benchmark Ledger</h4>
          <span className="text-muted">Detailed comparative metrics per sprint</span>
        </div>

        <div className="table-responsive">
          <table className="comparison-ledger-table">
            <thead>
              <tr>
                <th>Sprint</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Planned MD</th>
                <th>Consumed MD</th>
                <th>Utilization</th>
                <th>Total Tickets</th>
                <th>Deployed</th>
                <th>Carry Over</th>
                <th>Deprioritized</th>
                <th>Overdue</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {sprintComparisonData.map(d => {
                const isOver = d.plannedMandays > d.capacity;

                return (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.name}</strong>
                      <span className="text-muted text-xs block">{d.year}</span>
                    </td>
                    <td>
                      <span className={`sprint-status-pill status-${d.status.toLowerCase()}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>{d.capacity} MD</td>
                    <td><strong>{d.plannedMandays} MD</strong></td>
                    <td>{d.consumedMandays} MD</td>
                    <td>
                      <span className={`cell-utilization-badge ${isOver ? 'badge-danger' : 'badge-ok'}`}>
                        {d.utilizationRate}%
                      </span>
                    </td>
                    <td>{d.totalTickets}</td>
                    <td><span className="text-success font-semibold">{d.deployedTickets}</span></td>
                    <td>
                      {d.carryOverTickets > 0 ? (
                        <span className="chip-carryover">{d.carryOverTickets}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td>{d.deprioritizedTickets}</td>
                    <td>
                      {d.overdueTickets > 0 ? (
                        <span className="text-danger font-semibold">{d.overdueTickets}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td>
                      <div className="cell-progress-mini">
                        <div className="progress-bar-track mini">
                          <div
                            className="progress-bar-fill fill-primary"
                            style={{ width: `${d.completionRate}%` }}
                          />
                        </div>
                        <span>{d.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
