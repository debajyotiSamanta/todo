import React from "react";

const formatSecs = (secs) => {
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  let parts = [];
  if (hrs) parts.push(`${hrs}h`);
  if (mins || !hrs) parts.push(`${mins}m`);
  return parts.join(" ");
};

const formatHour = (h) => {
  if (h === null || h === undefined) return "";
  const ampm = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${ampm}`;
};

const TodoItem = ({ 
  item, 
  idx, 
  mode, 
  toggleComplete, 
  deleteItem, 
  editItem, 
  editTags, 
  toggleMyDay, 
  startPomodoro, 
  handleDragStart, 
  handleDragEnter, 
  setTagFilter 
}) => {
  return (
    <li
      className={`todo-item ${item.completed ? "completed" : ""}`}
      draggable={mode === "list" || mode === "calendar"}
      onDragStart={(e) => handleDragStart(e, mode === "list" ? idx : item.id)}
      onDragEnter={(e) => mode === "list" && handleDragEnter(e, idx)}
    >
      <div className="item-main">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => toggleComplete(item.id)}
          />
          <span className="checkmark"></span>
        </label>
        <span
          onDoubleClick={() => editItem(item.id)}
          className="todo-text"
        >
          {item.value}
        </span>
      </div>
      
      <div className="item-details">
        <div className="item-meta">
          {(item.tags || []).map((t) => (
            <span
              key={t}
              className="tag-badge"
              onClick={() => setTagFilter(t)}
              title="Filter by tag"
            >
              #{t}
            </span>
          ))}
          {item.scheduledHour !== null && (
            <span className="scheduled-badge">
              <i className="icon-clock"></i> {formatHour(item.scheduledHour)}
            </span>
          )}
          {item.actualTime > 0 && (
            <span className="actual-time">
              {formatSecs(item.actualTime)}
            </span>
          )}
        </div>
        
        <div className="item-controls">
          <button 
            className={`control-btn ${item.myDay ? "starred" : ""}`} 
            onClick={() => toggleMyDay(item.id)} 
            title="My Day"
          >
            {item.myDay ? "★" : "☆"}
          </button>
          <button className="control-btn" onClick={() => startPomodoro(item.id)} title="Focus Timer">
            ⏱
          </button>
          <button className="control-btn" onClick={() => editTags(item.id)} title="Tags">
            🏷
          </button>
          <button
            className="control-btn delete-btn"
            onClick={() => deleteItem(item.id)}
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    </li>
  );
};

export default TodoItem;
