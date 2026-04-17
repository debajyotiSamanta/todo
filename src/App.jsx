import React from "react";
import "./App.css";
import { useTodoState } from "./hooks/useTodoState";
import Header from "./components/Header";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import CalendarView from "./components/CalendarView";
import DashboardView from "./components/DashboardView";

function App() {
  const {
    userInput, setUserInput,
    tagInput, setTagInput,
    tagFilter, setTagFilter,
    list,
    filter, setFilter,
    mode, setMode,
    dashboardPeriod, setDashboardPeriod,
    theme,
    timer,
    addItem, deleteItem, toggleComplete, editItem, editTags, toggleMyDay,
    startPomodoro, stopPomodoro, handleDropHour, promptHour, clearCompleted,
    toggleTheme, handleDragStart, handleDragEnter, handleDragEnd,
    filteredList, totalTasks, completedTasks, completionPercent, karma, periodData, remainingCount
  } = useTodoState();

  return (
    <div className="app-container">
      <Header 
        mode={mode} 
        setMode={setMode} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="app-content">
        {mode !== "calendar" && mode !== "dashboard" && (
          <TodoForm 
            userInput={userInput}
            setUserInput={setUserInput}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addItem={addItem}
          />
        )}

        {timer.running && (
          <div className="timer-notification-bar">
            <div className="timer-info">
              <span className="timer-pulse"></span>
              <span>Focusing: {Math.floor(timer.remaining / 60)}m {timer.remaining % 60}s</span>
            </div>
            <button onClick={stopPomodoro} className="stop-btn">Stop</button>
          </div>
        )}

        {(mode === "list" || mode === "myday") && (
          <TodoList 
            filteredList={filteredList}
            mode={mode}
            toggleComplete={toggleComplete}
            deleteItem={deleteItem}
            editItem={editItem}
            editTags={editTags}
            toggleMyDay={toggleMyDay}
            startPomodoro={startPomodoro}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            remainingCount={remainingCount}
            filter={filter}
            setFilter={setFilter}
            clearCompleted={clearCompleted}
          />
        )}

        {mode === "calendar" && (
          <CalendarView 
            list={list}
            handleDragStart={handleDragStart}
            handleDropHour={handleDropHour}
            promptHour={promptHour}
          />
        )}

        {mode === "dashboard" && (
          <DashboardView 
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            completionPercent={completionPercent}
            karma={karma}
            dashboardPeriod={dashboardPeriod}
            setDashboardPeriod={setDashboardPeriod}
            periodData={periodData}
          />
        )}
      </main>
    </div>
  );
}

export default App;