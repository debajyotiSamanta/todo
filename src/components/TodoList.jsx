import React from "react";
import TodoItem from "./TodoItem";

const TodoList = ({ 
  filteredList, 
  mode, 
  toggleComplete, 
  deleteItem, 
  editItem, 
  editTags, 
  toggleMyDay, 
  startPomodoro, 
  handleDragStart, 
  handleDragEnter, 
  handleDragEnd,
  tagFilter,
  setTagFilter,
  remainingCount,
  filter,
  setFilter,
  clearCompleted
}) => {
  return (
    <div className="todo-list-container">
      {tagFilter && (
        <div className="tag-filter-display">
          <span>Filtering: <strong>#{tagFilter}</strong></span>
          <button onClick={() => setTagFilter("")}>Clear Filter</button>
        </div>
      )}
      <ul className="todo-list" onDragEnd={handleDragEnd}>
        {filteredList.map((item, idx) => (
          <TodoItem
            key={item.id}
            item={item}
            idx={idx}
            mode={mode}
            toggleComplete={toggleComplete}
            deleteItem={deleteItem}
            editItem={editItem}
            editTags={editTags}
            toggleMyDay={toggleMyDay}
            startPomodoro={startPomodoro}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            setTagFilter={setTagFilter}
          />
        ))}
      </ul>
      {filteredList.length > 0 && mode === "list" && (
        <footer className="list-footer">
          <span className="items-left">{remainingCount} left</span>
          <div className="filter-pill-group">
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
          <button onClick={clearCompleted} className="clear-completed-btn">
            Clear Completed
          </button>
        </footer>
      )}
    </div>
  );
};

export default TodoList;
