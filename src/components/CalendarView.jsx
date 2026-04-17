import React from "react";

const formatHour = (h) => {
  if (h === null || h === undefined) return "";
  const ampm = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${ampm}`;
};

const CalendarView = ({ list, handleDragStart, handleDropHour, promptHour }) => {
  return (
    <div className="calendar-container">
      <div className="calendar-info-card">
        <p>Drag tasks into the timeline to schedule them.</p>
      </div>
      
      <div className="calendar-view-split">
        <div className="unscheduled-pane">
          <h3>Unscheduled</h3>
          <div className="unscheduled-grid">
            {list
              .filter((it) => it.scheduledHour == null)
              .map((it) => (
                <div
                  key={it.id}
                  className="draggable-task-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, it.id)}
                >
                  {it.value}
                </div>
              ))}
          </div>
        </div>

        <div className="timeline-pane">
          {[...Array(24)].map((_, h) => (
            <div
              key={h}
              className="hour-slot"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropHour(h)}
            >
              <div className="hour-sidebar">
                <span className="hour-text">{formatHour(h)}</span>
              </div>
              <div className="hour-content">
                {list
                  .filter((it) => it.scheduledHour === h)
                  .map((it) => (
                    <div
                      key={it.id}
                      className="scheduled-task-strip"
                      draggable
                      onDragStart={(e) => handleDragStart(e, it.id)}
                      onClick={() => promptHour(it.id)}
                      title="Click to reschedule"
                    >
                      {it.value}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
