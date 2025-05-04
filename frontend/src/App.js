import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [comment, setComment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completedTodos, setCompletedTodos] = useState([]);
  const [theme, setTheme] = useState('light');
  const [editMode, setEditMode] = useState({});
  const [editData, setEditData] = useState({});

  const BASE_URL = 'https://tobedone-be-ekd5hbf5f0dbb4ge.polandcentral-01.azurewebsites.net/todos';

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newTheme);
  };

  const fetchTodos = async () => {
    const res = await axios.get(BASE_URL);
    const allTodos = res.data;
    setTodos(allTodos.filter(todo => !todo.completedAt));
    setCompletedTodos(allTodos.filter(todo => todo.completedAt));
  };

  const addTodo = async () => {
    if (!newTodo) return;
    await axios.post(BASE_URL, {
      text: newTodo,
      comment,
      dueDate
    });
    setNewTodo('');
    setComment('');
    setDueDate('');
    fetchTodos();
  };

  const markAsCompleted = async (todo) => {
    await axios.put(`${BASE_URL}/${todo.id}`, {
      ...todo,
      completedAt: new Date().toISOString()
    });
    fetchTodos();
  };

  const recoverTodo = async (todo) => {
    await axios.put(`${BASE_URL}/${todo.id}`, {
      ...todo,
      completedAt: null
    });
    fetchTodos();
  };

  const deleteCompletedTodo = async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
    fetchTodos();
  };

  const toggleEditMode = (todo) => {
    const isEntering = !editMode[todo.id];
    setEditMode(prev => ({ ...prev, [todo.id]: isEntering }));

    if (isEntering) {
      setEditData(prev => ({
        ...prev,
        [todo.id]: {
          text: todo.text || '',
          comment: todo.comment || '',
          dueDate: todo.dueDate || '',
        }
      }));
    }
  };

  const handleEditChange = (id, field, value) => {
    setEditData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const saveEdit = async (todo) => {
    console.log('Saving:', todo.id, editData[todo.id]);
    const updated = {
      ...todo,
      ...editData[todo.id],
    };

    await axios.put(`${BASE_URL}/${todo.id}`, updated);
    setEditMode(prev => ({ ...prev, [todo.id]: false }));
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[todo.id];
      return newData;
    });
    fetchTodos();
  };

  const cancelEdit = (id) => {
    setEditMode(prev => ({ ...prev, [id]: false }));
    setEditData(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  useEffect(() => {
    fetchTodos();
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
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <div className="todo-text">
              {editMode[todo.id] && editData[todo.id] ? (
                <>
                  <input
                    value={editData[todo.id].text}
                    onChange={(e) => handleEditChange(todo.id, 'text', e.target.value)}
                  />
                  <input
                    value={editData[todo.id].comment}
                    onChange={(e) => handleEditChange(todo.id, 'comment', e.target.value)}
                    placeholder="Comment"
                  />
                  <input
                    type="datetime-local"
                    value={editData[todo.id].dueDate}
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
              <button onClick={() => toggleEditMode(todo)}>✏️</button>
              <button onClick={() => markAsCompleted(todo)}>✅</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="completed-todos">
        <h2>Stuff that's done</h2>
        <ul>
          {completedTodos.map(todo => (
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
              <button onClick={() => deleteCompletedTodo(todo.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
