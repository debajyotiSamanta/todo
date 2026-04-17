import React from "react";

const TodoForm = ({ userInput, setUserInput, tagInput, setTagInput, addItem }) => {
  return (
    <form onSubmit={addItem} className="todo-form">
      <div className="input-group">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="main-input"
        />
        <input
          type="text"
          placeholder="Tags (tag1, tag2...)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="tag-input"
        />
        <button type="submit" className="add-btn">Add Task</button>
      </div>
    </form>
  );
};

export default TodoForm;
