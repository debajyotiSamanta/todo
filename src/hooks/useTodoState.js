import { useState, useEffect, useRef } from "react";

export const useTodoState = () => {
  const [userInput, setUserInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [list, setList] = useState(() => {
    const stored = localStorage.getItem("todos");
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState("all"); 
  const [mode, setMode] = useState("list"); 
  const [dashboardPeriod, setDashboardPeriod] = useState("weekly"); 
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored || "light";
  });
  const [timer, setTimer] = useState({ taskId: null, remaining: 0, running: false });
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("history");
    return stored ? JSON.parse(stored) : {};
  });

  const dragItem = useRef();
  const dragOverItem = useRef();

  // Persistence
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(list));
  }, [list]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer.running) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev.remaining <= 1) {
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

  // Handlers
  const addItem = (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
      setTimer({ taskId: null, remaining: 0, running: false });
    }
    const task = list.find((t) => t.id === id);
    let initial = 1500; 
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
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleDragStart = (e, position) => {
    if (mode === "list") {
      dragItem.current = position;
    } else if (mode === "calendar") {
      dragItem.current = position;
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

  // Derived data
  const filteredList = list.filter((todo) => {
    if (mode === "myday") return todo.myDay;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    if (tagFilter && !(todo.tags || []).includes(tagFilter)) return false;
    return true;
  });

  const totalTasks = list.length;
  const completedTasks = list.filter((t) => t.completed).length;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const karma = completedTasks;

  const yesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

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
    const result = [];
    const now = new Date();
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

  const remainingCount = filteredList.filter((t) => !t.completed).length;

  return {
    userInput, setUserInput,
    tagInput, setTagInput,
    tagFilter, setTagFilter,
    list, setList,
    filter, setFilter,
    mode, setMode,
    dashboardPeriod, setDashboardPeriod,
    theme, setTheme,
    timer, setTimer,
    history,
    addItem, deleteItem, toggleComplete, editItem, editTags, toggleMyDay,
    startPomodoro, stopPomodoro, handleDropHour, promptHour, clearCompleted,
    toggleTheme, handleDragStart, handleDragEnter, handleDragEnd,
    filteredList, totalTasks, completedTasks, completionPercent, karma, periodData, remainingCount
  };
};
