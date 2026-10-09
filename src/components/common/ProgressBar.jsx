import React from 'react';

export function ProgressBar({ progress = 0 }) {
  const clamped = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <div className="card-progress-section" aria-label={`Task progress: ${clamped}%`}>
      <div className="card-progress-labels">
        <span>Progress</span>
        <span>{clamped}%</span>
      </div>
      <div className="card-progress-track">
        <div className="card-progress-bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
