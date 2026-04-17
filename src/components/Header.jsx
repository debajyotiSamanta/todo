import React from "react";

const Header = ({ mode, setMode, theme, toggleTheme }) => {
  return (
    <header className="header-bar">
      <div className="header-left">
        <h1>Todo</h1>
      </div>
      <nav className="mode-select">
        <button onClick={() => setMode("list")} className={mode === "list" ? "active" : ""}>List</button>
        <button onClick={() => setMode("calendar")} className={mode === "calendar" ? "active" : ""}>Calendar</button>
        <button onClick={() => setMode("myday")} className={mode === "myday" ? "active" : ""}>My Day</button>
        <button onClick={() => setMode("dashboard")} className={mode === "dashboard" ? "active" : ""}>Dashboard</button>
      </nav>
      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? "🌞" : "🌙"}
        </button>
      </div>
    </header>
  );
};

export default Header;
