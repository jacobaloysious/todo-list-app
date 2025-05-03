const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const Project = require('../models/Project');

// Get all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().populate('project');
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new todo
router.post('/', async (req, res) => {
  console.log('Received todo creation request:', req.body);
  
  const { text, projectId, date } = req.body;
  
  // Validate required fields
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: 'Todo text is required' });
  }

  try {
    // Create todo object
    const todo = new Todo({
      text: text.trim(),
      project: projectId || null,
      date: date || null
    });

    console.log('Attempting to save todo:', todo);
    const newTodo = await todo.save();
    console.log('Todo saved successfully:', newTodo);
    
    // If project is specified, add todo to project
    if (projectId) {
      console.log('Updating project with new todo:', projectId);
      await Project.findByIdAndUpdate(
        projectId,
        { $push: { todos: newTodo._id } }
      );
    }

    // Return the populated todo
    const populatedTodo = await Todo.findById(newTodo._id).populate('project');
    res.status(201).json(populatedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a todo
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (req.body.text !== undefined) todo.text = req.body.text;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;
    
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todo.project) {
      await Project.findByIdAndUpdate(
        todo.project,
        { $pull: { todos: todo._id } }
      );
    }

    await Todo.deleteOne({ _id: todo._id });
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
