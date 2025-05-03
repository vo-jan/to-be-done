import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]); // Active todos
  const [newTodo, setNewTodo] = useState('');
  const [comment, setComment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completedTodos, setCompletedTodos] = useState([]); // Completed todos
  const [theme, setTheme] = useState('light'); // Default is light theme
  const [editedTodos, setEditedTodos] = useState({});
  const [editMode, setEditMode] = useState({});
  const [editData, setEditData] = useState({});

  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  
    // Update the body's theme class
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newTheme);
  };

  const fetchTodos = async () => {
    const res = await axios.get('https://tobedone-be-ekd5hbf5f0dbb4ge.polandcentral-01.azurewebsites.net/todos');
    const allTodos = res.data;
  
    const activeTodos = allTodos.filter(todo => !todo.completedAt);
    const doneTodos = allTodos.filter(todo => todo.completedAt);
  
    setTodos(activeTodos);
    setCompletedTodos(doneTodos);
  };

  const addTodo = async () => {
    if (!newTodo) return;
    const newTodoObj = {
      text: newTodo,
      comment,
      dueDate,
    };
    
    // Send the new todo to the backend
    await axios.post('https://tobedone-be-ekd5hbf5f0dbb4ge.polandcentral-01.azurewebsites.net/todos', newTodoObj);
    
    // Clear input fields
    setNewTodo('');
    setComment('');
    setDueDate('');
    
    // Fetch the updated list of active todos
    fetchTodos();
  };

  const markAsCompleted = async (todo) => {
    const completedTodo = {
      ...todo,
      completedAt: new Date().toISOString(), // Track completion time
    };

    // Update the backend with the completed status
    await axios.put(`https://tobedone-be-ekd5hbf5f0dbb4ge.polandcentral-01.azurewebsites.net/todos/${todo.id}`, completedTodo);
  
    // Add the completed todo to the completedTodos list (in frontend state)
    setCompletedTodos((prevCompletedTodos) => [...prevCompletedTodos, completedTodo]);

    // Remove the completed todo from the active todos list
    setTodos((prevTodos) => prevTodos.filter((item) => item.id !== todo.id));
  };
  
  const recoverTodo = async (todo) => {
    const updatedTodo = {
      ...todo,
      completedAt: null
    };
  
    // Send update to backend
    await axios.put(`https://tobedone-be-ekd5hbf5f0dbb4ge.polandcentral-01.azurewebsites.net/todos/${todo.id}`, updatedTodo);
  
    // Move it back to active
    setCompletedTodos(prev => prev.filter(t => t.id !== todo.id));
    setTodos(prev => [...prev, updatedTodo]);
  };

  const toggleEditMode = (todo) => {
    setEditMode((prev) => ({
      ...prev,
      [todo.id]: !prev[todo.id],
    }));
  
    // When entering edit mode, copy data to local editData
    if (!editMode[todo.id]) {
      setEditData((prev) => ({
        ...prev,
        [todo.id]: {
          text: todo.text,
          comment: todo.comment || '',
          dueDate: todo.dueDate || '',
        },
      }));
    }
  };
  
  const handleEdit = (id, field, value) => {
    setEditedTodos((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  
    // Update the local display too
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, [field]: value } : todo
      )
    );
  };

  const handleEditChange = (id, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };
  
  const saveEdit = async (todo) => {
    const updated = {
      ...todo,
      ...editData[todo.id],
    };
  
    await axios.put(`https://tobedone-be-ekd5hbf5f0dbb4ge.polandcentral-01.azurewebsites.net/todos/${todo.id}`, updated);
    setEditMode((prev) => ({ ...prev, [todo.id]: false }));
    setEditData((prev) => {
      const newData = { ...prev };
      delete newData[todo.id];
      return newData;
    });
    fetchTodos();
  };

  const cancelEdit = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: false }));
    setEditData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  const deleteCompletedTodo = (id) => {
    setCompletedTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  useEffect(() => {
    fetchTodos(); // Fetch active todos initially
  }, []);

  return (
    <div className={`app ${theme}`}>
      <h1>📝 To-Be-Done Tracker</h1>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
      <div className="form">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Task"
        />
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comment"
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
          <div className="todo-text">
            {editMode[todo.id] ? (
              <>
                <input
                  value={editData[todo.id]?.text || ''}
                  onChange={(e) => handleEditChange(todo.id, 'text', e.target.value)}
                />
                <input
                  value={editData[todo.id]?.comment || ''}
                  onChange={(e) => handleEditChange(todo.id, 'comment', e.target.value)}
                  placeholder="Comment"
                />
                <input
                  type="datetime-local"
                  value={editData[todo.id]?.dueDate || ''}
                  onChange={(e) => handleEditChange(todo.id, 'dueDate', e.target.value)}
                />
                <button onClick={() => saveEdit(todo)}>💾</button>
                <button onClick={() => cancelEdit(todo.id)}>❌</button>
              </>
            ) : (
              <>
                <strong>{todo.text}</strong>
                {todo.comment && <div>💬 {todo.comment}</div>}
                {todo.dueDate && !isNaN(Date.parse(todo.dueDate)) && (
                  <div>📅 {new Date(todo.dueDate).toLocaleString()}</div>
                )}
              </>
            )}
          </div>
          <div className="todo-actions">
            <button className="edit-btn" onClick={() => toggleEditMode(todo)}>✏️</button>
            <button className="complete-btn" onClick={() => markAsCompleted(todo)}>✅</button>
          </div>
        </li>        
        ))}
      </ul>
      <div className="completed-todos">
        <h2>Stuff that's done</h2>
        <ul>
        {completedTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <div className="todo-text">
                <strong>{todo.text}</strong>
                {todo.comment && <div>💬 {todo.comment}</div>}
                {todo.dueDate && !isNaN(Date.parse(todo.dueDate)) && (
                  <div>📅 Due: {new Date(todo.dueDate).toLocaleString()}</div>
                )}
                <div>✅ Completed: {new Date(todo.completedAt).toLocaleString()}</div>
              </div>
              <button onClick={() => recoverTodo(todo)}>♻️</button>
              <button className="delete-completed-btn" onClick={() => deleteCompletedTodo(todo.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
