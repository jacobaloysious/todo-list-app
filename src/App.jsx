import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagicWandSparkles, 
  faFolderPlus, 
  faCalendarAlt,
  faPencilAlt,
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faListCheck,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import { generateTasks } from './services/taskGenerator';
import { todoApi, projectApi } from './services/api';
import './themes.css';
import Banner from './components/Banner';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'spring-breeze';
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [banner, setBanner] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const themes = {
    light: ['spring-breeze', 'sunset-gold', 'lavender-mist']
  };

  const themeDisplayNames = {
    'spring-breeze': 'Spring Breeze',
    'sunset-gold': 'Sunset Gold',
    'lavender-mist': 'Lavender Mist'
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (date === 'today') {
      return new Date().toISOString().split('T')[0];
    }
    return date;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosData, projectsData] = await Promise.all([
          todoApi.getAllTodos(),
          projectApi.getAllProjects()
        ]);
        setTodos(todosData);
        setProjects(projectsData);
      } catch (err) {
        showBanner('Failed to load data', 'error');
      }
    };
    fetchData();
  }, []);

  const showBanner = (message, type = 'info') => {
    setBanner({ show: true, message, type });
    setTimeout(() => setBanner({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const date = selectedDate === 'custom' ? customDate : selectedDate;
      console.log('Adding todo:', { 
        text: input.trim(), 
        projectId: selectedProject, 
        date: formatDate(date) 
      });
      
      const newTodo = await todoApi.createTodo(
        input.trim(),
        selectedProject,
        formatDate(date)
      );
      
      console.log('Todo added successfully:', newTodo);
      setTodos(prev => [...prev, newTodo]);
      setInput('');
      setSelectedDate('');
      setCustomDate('');
      showBanner('Todo added successfully', 'success');
    } catch (err) {
      console.error('Error in handleAddTodo:', err);
      showBanner('Failed to add todo', 'error');
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t._id === id);
      const updatedTodo = await todoApi.updateTodo(id, { completed: !todo.completed });
      setTodos(prev => prev.map(t => t._id === id ? updatedTodo : t));
    } catch (err) {
      showBanner('Failed to update todo', 'error');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo._id !== id));
      showBanner('Todo deleted successfully', 'success');
    } catch (err) {
      showBanner('Failed to delete todo', 'error');
    }
  };

  const handleEditTodo = async (id) => {
    if (editId === id) {
      try {
        const updatedTodo = await todoApi.updateTodo(id, { text: editText });
        setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo));
        setEditId(null);
        setEditText('');
        showBanner('Todo updated successfully', 'success');
      } catch (err) {
        showBanner('Failed to update todo', 'error');
      }
    } else {
      const todo = todos.find(t => t._id === id);
      setEditId(id);
      setEditText(todo.text);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const newProject = await projectApi.createProject(newProjectName.trim());
      setProjects(prev => [...prev, newProject]);
      setNewProjectName('');
      setShowProjectForm(false);
      showBanner('Project created successfully', 'success');
    } catch (err) {
      showBanner('Failed to create project', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectApi.deleteProject(id);
      setProjects(prev => prev.filter(project => project._id !== id));
      if (selectedProject === id) {
        setSelectedProject('');
      }
      showBanner('Project deleted successfully', 'success');
    } catch (err) {
      showBanner('Failed to delete project', 'error');
    }
  };

  const handleGenerateTasks = async (goal) => {
    try {
      setIsGenerating(true);
      const generatedTasks = await generateTasks(goal);
      console.log('Generated tasks:', generatedTasks);

      // Create all tasks in sequence
      const createdTasks = await Promise.all(
        generatedTasks.map(async (task) => {
          try {
            const newTodo = await todoApi.createTodo(task.text);
            console.log('Created todo:', newTodo);
            return newTodo;
          } catch (error) {
            console.error('Error creating todo:', error);
            return null;
          }
        })
      );

      // Filter out any failed creations and update state
      const successfulTasks = createdTasks.filter(task => task !== null);
      setTodos(prevTodos => [...prevTodos, ...successfulTasks]);
      
      setIsGenerating(false);
      setGoal('');
      showBanner('Tasks generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating tasks:', error);
      setIsGenerating(false);
      showBanner('Failed to generate tasks', 'error');
    }
  };

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
  };

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleAddTodo(e);
  };

  const deleteTodo = (id) => {
    handleDeleteTodo(id);
  };

  const toggleTodo = (id) => {
    handleToggleTodo(id);
  };

  const startEdit = (id, text, date) => {
    setEditId(id);
    setEditText(text);
    setSelectedDate(date || '');
  };

  const saveEdit = (id) => {
    handleEditTodo(id);
  };

  const moveTodoToProject = (todoId, projectId) => {
    setTodos(todos.map(todo =>
      todo._id === todoId
        ? { ...todo, projectId: projectId }
        : todo
    ));
  };

  const getDisplayDate = (date) => {
    if (!date) return '';
    if (date === 'someday') return 'Someday';
    if (date === formatDate('today')) return 'Today';
    return date;
  };

  // Filter todos based on selected project and date
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => 
      todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.project && todo.project.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [todos, searchQuery]);

  // Get unique dates from todos for the filter dropdown
  const uniqueDates = [...new Set(todos.map(todo => todo.date))].sort();

  return (
    <>
      <div className="app-header">
        <h1>ToDo'la</h1>
        <select 
          className="theme-select"
          onChange={handleThemeChange}
          value={theme}
        >
          {themes.light.map(themeKey => (
            <option key={themeKey} value={themeKey}>
              {themeDisplayNames[themeKey]}
            </option>
          ))}
        </select>
      </div>
      <div className="container">
        {banner.show && (
          <Banner
            message={banner.message}
            type={banner.type}
            onDismiss={() => setBanner(prev => ({ ...prev, show: false }))}
          />
        )}
        <div className="ai-task-generator">
          <div className="ai-task-generator-header">
            <h2>
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              AI Task Generator
            </h2>
          </div>
          <div className="generate-form">
            <div className="generate-form-content">
              <div className="goal-input-group">
                <label htmlFor="goal">What would you like to achieve?</label>
                <textarea
                  id="goal"
                  className="goal-input"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Enter your goal or task description..."
                  disabled={isGenerating}
                />
              </div>
              <div className="generate-button-container">
                <button
                  className="generate-button"
                  onClick={handleGenerateTasks}
                  disabled={!goal.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faMagicWandSparkles} />
                      Generate Tasks
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <select
            value={selectedProject || ''}
            onChange={e => setSelectedProject(e.target.value)}
            className="project-select"
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id.toString()}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={selectedDate || ''}
            onChange={e => {
              setSelectedDate(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomDate('');
              }
            }}
            className="date-select"
          >
            <option value="">No Date</option>
            <option value="today">Today</option>
            <option value="someday">Someday</option>
            <option value="custom">Custom Date</option>
          </select>
          {selectedDate === 'custom' && (
            <input
              type="date"
              value={customDate || ''}
              onChange={e => setCustomDate(e.target.value)}
              className="date-input"
            />
          )}
          <button type="submit" className="add-button">Add Todo</button>
        </form>

        <div className="filters-section">
          <div className="date-filter">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <select 
              value={dateFilter || ''}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-select"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="someday">Someday</option>
              {Array.from(new Set(todos.map(todo => todo.date)))
                .filter(date => date && date !== 'someday' && date !== formatDate('today'))
                .sort()
                .map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="todo-section">
          <div className="todo-section-header">
            <h2>
              <FontAwesomeIcon icon={faListCheck} />
              Todo List
            </h2>
          </div>
          <div className="todo-search">
            <input
              type="text"
              className="search-input"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="todo-list-container">
            <ul className="todo-list">
              {filteredTodos.map(todo => (
                <li key={todo._id} className={todo.completed ? 'completed' : ''}>
                  {editId === todo._id ? (
                    <>
                      <input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="edit-input"
                      />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="date-input"
                      />
                      <button 
                        onClick={() => saveEdit(todo._id)} 
                        className="icon-btn save-btn"
                        title="Save"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button 
                        onClick={() => setEditId(null)} 
                        className="icon-btn cancel-btn"
                        title="Cancel"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo._id)}
                        className="todo-checkbox"
                      />
                      <span className="todo-text">
                        {todo.text}
                      </span>
                      {todo.date && (
                        <span className="todo-date">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {getDisplayDate(todo.date)}
                        </span>
                      )}
                      <select
                        value={todo.projectId?.toString() || ''}
                        onChange={(e) => moveTodoToProject(todo._id, e.target.value ? e.target.value : null)}
                        className="project-select"
                      >
                        <option value="">No Project</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id.toString()}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => startEdit(todo._id, todo.text, todo.date)} 
                        className="icon-btn edit-btn"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                      <button 
                        onClick={() => deleteTodo(todo._id)} 
                        className="icon-btn delete-btn"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="projects-section">
          <div className="projects-header">
            <h2>Projects</h2>
            <button 
              className="add-project-btn"
              onClick={() => setShowProjectForm(true)}
            >
              <FontAwesomeIcon icon={faFolderPlus} />
              Add Project
            </button>
          </div>

          {showProjectForm && (
            <form onSubmit={handleAddProject} className="project-form">
              <input
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className="project-input"
              />
              <button type="submit" className="save-btn">Save</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowProjectForm(false)}
              >
                Cancel
              </button>
            </form>
          )}

          <div className="project-list">
            <button 
              className={`project-item ${selectedProject === '' ? 'selected' : ''}`}
              onClick={() => setSelectedProject('')}
            >
              All Todos
            </button>
            {projects.map(project => (
              <div key={project._id} className="project-item-container">
                <button
                  className={`project-item ${selectedProject === project._id ? 'selected' : ''}`}
                  onClick={() => setSelectedProject(project._id)}
                >
                  {project.name}
                </button>
                <button 
                  className="delete-project-btn"
                  onClick={() => handleDeleteProject(project._id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
