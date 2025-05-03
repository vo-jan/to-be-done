const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(cors());
app.use(express.json());

let todos = [];
let id = 1;

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { text, comment, dueDate } = req.body;
  const todo = {
    id: id++,
    text,
    comment,
    dueDate,
  };
  console.log('New todo received:', todo); // ✅ Log it to confirm
  todos.push(todo);
  res.status(201).send();
});

app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const { completedAt } = req.body;

  const index = todos.findIndex(todo => todo.id == id);

  if (index === -1) {
    console.log('Todo not found with ID:', id);
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos[index].completedAt = completedAt;

  console.log('Todo marked as completed:', todos[index]);
  res.status(200).json(todos[index]);
});

app.delete('/todos/:id', (req, res) => {
  todos = todos.filter(todo => todo.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
