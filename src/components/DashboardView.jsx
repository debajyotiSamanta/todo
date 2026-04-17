import React from "react";

const DashboardView = ({ 
  completedTasks, 
  totalTasks, 
  completionPercent, 
  karma, 
  dashboardPeriod, 
  setDashboardPeriod, 
  periodData 
}) => {
  const data = periodData();
  const max = Math.max(0, ...data.map((d) => d.count));

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Completion</span>
          <span className="stat-value">{completionPercent}%</span>
          <div className="stat-progress-bg">
            <div className="stat-progress-fill" style={{ width: `${completionPercent}%` }}></div>
          </div>
          <span className="stat-subtext">{completedTasks} / {totalTasks} finished</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Karma</span>
          <span className="stat-value">{karma}</span>
          <span className="stat-subtext">Lifetime tasks completed</span>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>Activity Trend</h3>
          <div className="period-tabs">
            {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
              <button 
                key={p} 
                onClick={() => setDashboardPeriod(p)} 
                className={dashboardPeriod === p ? 'active' : ''}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="trend-viz">
          {data.map((d, i) => (
            <div key={i} className="bar-wrapper">
              <div 
                className="bar-column"
                style={{ height: `${max ? (d.count / max) * 100 : 0}%` }}
                title={`${d.label}: ${d.count}`}
              >
                <span className="bar-count-tooltip">{d.count}</span>
              </div>
              <span className="bar-label">{d.label}</span>
            </div>
          ))}
          {data.length === 0 && <p className="no-data">No data for this period.</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
