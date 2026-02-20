// App.js File
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  // state hooks
  const [userInput, setUserInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [list, setList] = useState(() => {
    // initialize from localStorage if available
    const stored = localStorage.getItem("todos");
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [mode, setMode] = useState("list"); // list | calendar | myday | dashboard
  const [dashboardPeriod, setDashboardPeriod] = useState("weekly"); // daily, weekly, monthly, yearly
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored || "light";
  });
  const dragItem = React.useRef();
  const dragOverItem = React.useRef();
  const [timer, setTimer] = useState({ taskId: null, remaining: 0, running: false });
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("history");
    return stored ? JSON.parse(stored) : {};
  });

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


  // persist to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(list));
  }, [list]);

  // persist history too
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  // timer effect
  useEffect(() => {
    let interval;
    if (timer.running) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev.remaining <= 1) {
            // increment actualTime on task
            setList((l) =>
              l.map((it) =>
                it.id === prev.taskId
                  ? { ...it, actualTime: (it.actualTime || 0) + 1500 }
                  : it
              )
            );
            return { taskId: null, remaining: 0, running: false };
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.running]);

  const updateInput = (value) => {
    setUserInput(value);
  };


  const addItem = (e) => {
    e.preventDefault();
    if (userInput.trim() === "") return;
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const newItem = {
      id: Date.now(),
      value: userInput.trim(),
      completed: false,
      actualTime: 0,
      myDay: mode === "myday",
      scheduledHour: null,
      tags,
    };
    setList([...list, newItem]);
    setUserInput("");
    setTagInput("");
  };

  const deleteItem = (id) => {
    setList(list.filter((item) => item.id !== id));
  };

  const toggleComplete = (id) => {
    setList(
      list.map((item) => {
        if (item.id === id) {
          const newState = { ...item, completed: !item.completed };
          if (!item.completed && newState.completed) {
            // just completed
            const today = new Date().toISOString().split("T")[0];
            setHistory((h) => {
              const copy = { ...h };
              copy[today] = (copy[today] || 0) + 1;
              return copy;
            });
          }
          return newState;
        }
        return item;
      })
    );
  };

  const editItem = (id) => {
    const item = list.find((item) => item.id === id);
    if (!item) return;
    const edited = prompt("Edit the todo:", item.value);
    if (edited !== null && edited.trim() !== "") {
      setList(
        list.map((item) =>
          item.id === id ? { ...item, value: edited.trim() } : item
        )
      );
    }
  };

  const editTags = (id) => {
    const item = list.find((item) => item.id === id);
    if (!item) return;
    const current = item.tags ? item.tags.join(", ") : "";
    const edited = prompt("Tags (comma separated):", current);
    if (edited !== null) {
      const tags = edited
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      setList(
        list.map((item) =>
          item.id === id ? { ...item, tags } : item
        )
      );
    }
  };

  const toggleMyDay = (id) => {
    setList(
      list.map((item) =>
        item.id === id ? { ...item, myDay: !item.myDay } : item
      )
    );
  };

  const startPomodoro = (id) => {
    if (timer.running && timer.taskId !== id) {
      // stop current
      setTimer({ taskId: null, remaining: 0, running: false });
    }
    const task = list.find((t) => t.id === id);
    let initial = 1500; // default 25 minutes
    if (task && task.scheduledHour != null) {
      const now = new Date();
      const target = new Date(now);
      target.setHours(task.scheduledHour, 0, 0, 0);
      if (target > now) {
        initial = Math.round((target - now) / 1000);
      }
    }
    setTimer({ taskId: id, remaining: initial, running: true });
  };

  const stopPomodoro = () => {
    setTimer({ taskId: null, remaining: 0, running: false });
  };

  const handleDropHour = (hour) => {
    if (dragItem.current) {
      setList(
        list.map((it) =>
          it.id === dragItem.current ? { ...it, scheduledHour: hour } : it
        )
      );
      dragItem.current = null;
    }
  };

  const promptHour = (id) => {
    const item = list.find((it) => it.id === id);
    if (!item) return;
    const hour = prompt("Enter hour (0-23, blank to unschedule):", item.scheduledHour ?? "");
    if (hour === null) return;
    if (hour.trim() === "") {
      setList(list.map((it) => (it.id === id ? { ...it, scheduledHour: null } : it)));
      return;
    }
    const h = parseInt(hour, 10);
    if (!isNaN(h) && h >= 0 && h < 24) {
      setList(list.map((it) => (it.id === id ? { ...it, scheduledHour: h } : it)));
    }
  };

  const clearCompleted = () => {
    setList(list.filter((item) => !item.completed));
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  // drag and drop handlers (list reordering)
  const handleDragStart = (e, position) => {
    if (mode === "list") {
      dragItem.current = position; // index
    } else if (mode === "calendar") {
      dragItem.current = position; // id
    }
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    const listCopy = [...list];
    const draggedItemContent = listCopy.splice(dragItem.current, 1)[0];
    listCopy.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setList(listCopy);
  };

  const filteredList = list.filter((todo) => {
    if (mode === "myday") return todo.myDay;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    if (tagFilter && !(todo.tags || []).includes(tagFilter)) return false;
    return true;
  });

  // dashboard metrics
  const totalTasks = list.length;
  const completedTasks = list.filter((t) => t.completed).length;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const karma = completedTasks; // simple karma
  const last7days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString(undefined, { weekday: 'short', month: '2-digit', day: '2-digit' });
      result.push({ key, count: history[key] || 0, label });
    }
    return result;
  };
  
  const weeklyData = () => {
    // last 4 weeks total per week starting Monday
    const result = [];
    const now = new Date();
    // find Monday of current week
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    for (let w = 3; w >= 0; w--) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - w * 7);
      let total = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().split("T")[0];
        total += history[key] || 0;
      }
      const label = `Wk ${start.getMonth()+1}/${start.getDate()}`;
      result.push({ label, count: total });
    }
    return result;
  };
  
  const monthlyData = () => {
    const result = [];
    const now = new Date();
    for (let m = 11; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const daysInMonth = new Date(year, month+1, 0).getDate();
      let total = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dd = new Date(year, month, day);
        const key = dd.toISOString().split("T")[0];
        total += history[key] || 0;
      }
      const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      result.push({ label, count: total });
    }
    return result;
  };
  
  const yearlyData = () => {
    const counts = {};
    Object.keys(history).forEach((k) => {
      const y = k.slice(0,4);
      counts[y] = (counts[y] || 0) + history[k];
    });
    return Object.entries(counts).map(([yr,c])=>({ label: yr, count: c }));
  };
  
  const periodData = () => {
    if (dashboardPeriod === 'daily') return last7days();
    if (dashboardPeriod === 'weekly') return weeklyData();
    if (dashboardPeriod === 'monthly') return monthlyData();
    if (dashboardPeriod === 'yearly') return yearlyData();
    return [];
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const remainingCount = filteredList.filter((t) => !t.completed).length;

  return (
    <div className="app-container">
      <header className="header-bar">
        <h1>Todo List</h1>
        <div className="mode-select">
          <button onClick={() => setMode("list")} className={mode === "list" ? "active" : ""}>List</button>
          <button onClick={() => setMode("calendar")} className={mode === "calendar" ? "active" : ""}>Calendar</button>
          <button onClick={() => setMode("myday")} className={mode === "myday" ? "active" : ""}>My Day</button>
          <button onClick={() => setMode("dashboard")} className={mode === "dashboard" ? "active" : ""}>Dashboard</button>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? "🌞" : "🌙"}
        </button>
      </header>
      {mode !== "calendar" && (
        <form onSubmit={addItem} className="todo-form">
          <input
            type="text"
            placeholder="Add a new todo"
            value={userInput}
            onChange={(e) => updateInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="tag-input"
          />
          <button type="submit">Add</button>
        </form>
      )}
      {timer.running && (
        <div className="timer-bar">
          {(() => {
            const task = list.find((t) => t.id === timer.taskId);
            if (task && task.scheduledHour != null) {
              return <span>Until scheduled: {formatSecs(timer.remaining)}</span>;
            }
            return <span>Time left: {formatSecs(timer.remaining)}</span>;
          })()}
          <button onClick={stopPomodoro}>Stop</button>
        </div>
      )}

      {(mode === "list" || mode === "myday") && (
        <>
          {tagFilter && (
            <div className="tag-filter-info">
              Filtering by tag: <strong>{tagFilter}</strong>
              <button onClick={() => setTagFilter("")}>clear</button>
            </div>
          )}
          <ul className="todo-list">
            {filteredList.map((item, idx) => (
          <li
            key={item.id}
            className={item.completed ? "completed" : ""}
            draggable={mode === "list" || mode === "calendar"}
            onDragStart={(e) => handleDragStart(e, mode === "list" ? idx : item.id)}
            onDragEnter={(e) => mode === "list" && handleDragEnter(e, idx)}
            onDragEnd={mode === "list" ? handleDragEnd : undefined}
          >
            <label>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleComplete(item.id)}
              />
              <span
                onDoubleClick={() => editItem(item.id)}
                className="todo-text"
              >
                {item.value}
              </span>
            </label>
            <div className="item-meta">
              {(item.tags || []).map((t) => (
                <span
                  key={t}
                  className="tag-badge"
                  onClick={() => setTagFilter(t)}
                  title="Click to filter by tag"
                >
                  #{t}
                </span>
              ))}
              {item.scheduledHour !== null && (
                <span className="scheduled">Scheduled {formatHour(item.scheduledHour)}</span>
              )}
              <span className="actual">{formatSecs(item.actualTime || 0)}</span>
            </div>
            <div className="item-controls">
              <button onClick={() => toggleMyDay(item.id)} title="Toggle My Day">
                {item.myDay ? "★" : "☆"}
              </button>
              <button onClick={() => startPomodoro(item.id)} title="Start 25m timer">
                ⏱
              </button>
              <button onClick={() => editTags(item.id)} title="Edit tags">
                🏷
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteItem(item.id)}
                title="Delete"
              >
                ×
              </button>
            </div>
          </li>
        ))}
          </ul>
        </>
        )}

      {mode === "list" && list.length > 0 && (
        <footer className="todo-footer">
          <span>{remainingCount} item{remainingCount !== 1 ? "s" : ""} left</span>
          <div className="filters">
            <button
              onClick={() => setFilter("all")}
              className={filter === "all" ? "active" : ""}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={filter === "active" ? "active" : ""}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={filter === "completed" ? "active" : ""}
            >
              Completed
            </button>
          </div>
          <button onClick={clearCompleted} className="clear-btn">
            Clear Completed
          </button>
        </footer>
      )}
      {mode === "calendar" && (
        <>
          <p className="calendar-info">
            Drag tasks from the unscheduled section into the hours below to
            schedule them, or click a scheduled task to change its hour/unschedule.
          </p>
          <div className="unscheduled-list">
            <h3>Unscheduled</h3>
            {list
              .filter((it) => !it.scheduledHour)
              .map((it) => (
                <div
                  key={it.id}
                  className="scheduled-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, it.id)}
                >
                  {it.value}
                </div>
              ))}
          </div>
          <div className="calendar-view">
            {[...Array(24)].map((_, h) => (
            <div
              key={h}
              className="hour-slot"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropHour(h)}
            >
              <span className="hour-label">{h}:00</span>
              {list
                .filter((it) => it.scheduledHour === h)
                .map((it) => (
                  <div
                    key={it.id}
                    className="scheduled-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, it.id)}
                    onClick={() => promptHour(it.id)}
                    title="Click to edit hour"
                  >
                    {it.value}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </>
      )}
      {mode === "dashboard" && (
        <div className="dashboard">
          <h2>Progress</h2>
          <p>{completedTasks} / {totalTasks} tasks completed ({completionPercent}%)</p>
          <p>Karma: {karma}</p>
          <div className="period-select">
            {['daily','weekly','monthly','yearly'].map(p => (
              <button key={p} onClick={()=>setDashboardPeriod(p)} className={dashboardPeriod===p?'active':''}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
          <div className="trend">
            {(() => {
              const data = periodData();
              const max = Math.max(0, ...data.map((d) => d.count));
              return data.map((d,i) => (
                <div
                  key={i}
                  className="trend-bar"
                  style={{ height: `${max ? (d.count / max) * 100 : 0}%` }}
                  title={`${d.label}: ${d.count}`}
                >
                  <span className="day-label">{d.label}</span>
                  <span className="day-count">{d.count}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;