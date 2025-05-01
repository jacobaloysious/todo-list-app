import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagicWandSparkles, 
  faFolderPlus, 
  faCalendarAlt,
  faPencilAlt,
  faTrash,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { generateTasks } from './services/taskGenerator';
import { getInitialProjects, saveProjects, getInitialTodos, saveTodos } from './services/projectService';
import './themes.css';
import Banner from './components/Banner';

export default function App() {
  const [todos, setTodos] = useState(getInitialTodos);
  const [projects, setProjects] = useState(getInitialProjects);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
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

  const themes = {
    light: ['spring-breeze', 'sunset-gold', 'lavender-mist'],
    dark: ['midnight-ocean', 'dark-forest', 'dark-amethyst']
  };

  const themeDisplayNames = {
    'spring-breeze': 'Spring Breeze',
    'sunset-gold': 'Sunset Gold',
    'lavender-mist': 'Lavender Mist',
    'midnight-ocean': 'Midnight Ocean',
    'dark-forest': 'Dark Forest',
    'dark-amethyst': 'Dark Amethyst'
  };

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
  };

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'spring-breeze';
    document.documentElement.className = `theme-${savedTheme}`;
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { 
      id: Date.now(), 
      text: input, 
      completed: false,
      projectId: selectedProject,
      date: selectedDate || null
    }]);
    setInput('');
    setSelectedDate('');
    showBanner('Todo added successfully!', 'success');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    showBanner('Todo deleted', 'warning');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const startEdit = (id, text, date) => {
    setEditId(id);
    setEditText(text);
    setSelectedDate(date || '');
  };

  const saveEdit = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, text: editText, date: selectedDate || null }
        : todo
    ));
    setEditId(null);
    setEditText('');
    setSelectedDate('');
  };

  const handleGenerateTasks = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const generatedTasks = await generateTasks(goal);
      const newTodos = generatedTasks.map(task => ({
        id: Date.now() + Math.random(),
        text: task.text,
        completed: false,
        projectId: selectedProject,
        date: selectedDate || null
      }));
      
      setTodos([...todos, ...newTodos]);
      setGoal('');
      setSelectedDate('');
      showBanner('Tasks generated successfully!', 'success');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate tasks. Please try again.');
      showBanner('Failed to generate tasks', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const addProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const newProject = {
      id: Date.now(),
      name: newProjectName
    };
    
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setShowProjectForm(false);
  };

  const deleteProject = (projectId) => {
    // Remove project
    setProjects(projects.filter(p => p.id !== projectId));
    // Remove project association from todos
    setTodos(todos.map(todo => 
      todo.projectId === projectId 
        ? { ...todo, projectId: null }
        : todo
    ));
    if (selectedProject === projectId) {
      setSelectedProject(null);
    }
  };

  const moveTodoToProject = (todoId, projectId) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, projectId: projectId }
        : todo
    ));
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date === 'someday') return 'Someday';
    if (date === 'today') {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    return date;
  };

  const getDisplayDate = (date) => {
    if (!date) return '';
    if (date === 'someday') return 'Someday';
    if (date === formatDate('today')) return 'Today';
    return date;
  };

  // Filter todos based on selected project and date
  const filteredTodos = todos
    .filter(todo => {
      // Filter by project
      if (selectedProject && todo.projectId !== selectedProject) return false;
      
      // Filter by date
      if (dateFilter) {
        if (dateFilter === 'today' && todo.date !== formatDate('today')) return false;
        if (dateFilter === 'someday' && todo.date !== 'someday') return false;
        if (dateFilter !== 'today' && dateFilter !== 'someday' && todo.date !== dateFilter) return false;
      }
      
      return true;
    });

  // Get unique dates from todos for the filter dropdown
  const uniqueDates = [...new Set(todos.filter(todo => todo.date).map(todo => todo.date))].sort();

  // Add this function to show banners
  const showBanner = (message, type = 'info') => {
    setBanner({
      show: true,
      message,
      type
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setBanner(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  return (
    <>
      <div className="app-header">
        <h1>ToDo'la</h1>
        <select 
          className="theme-select"
          onChange={handleThemeChange}
          value={theme}
        >
          <optgroup label="Light Themes">
            {themes.light.map(themeKey => (
              <option key={themeKey} value={themeKey}>
                {themeDisplayNames[themeKey]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Dark Themes">
            {themes.dark.map(themeKey => (
              <option key={themeKey} value={themeKey}>
                {themeDisplayNames[themeKey]}
              </option>
            ))}
          </optgroup>
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
          <form onSubmit={handleGenerateTasks} className="generate-form">
            <div className="input-group">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter a goal (e.g., Plan a birthday party)"
                className="goal-input"
              />
              <button type="submit" className="generate-btn" disabled={isGenerating}>
                <FontAwesomeIcon icon={faMagicWandSparkles} />
                {isGenerating ? 'Generating...' : 'Generate Tasks'}
              </button>
            </div>
            {isGenerating && <p className="loading-text">Generating tasks...</p>}
            {error && <p className="error-text">{error}</p>}
          </form>
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
            <form onSubmit={addProject} className="project-form">
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
              className={`project-item ${selectedProject === null ? 'selected' : ''}`}
              onClick={() => setSelectedProject(null)}
            >
              All Todos
            </button>
            {projects.map(project => (
              <div key={project.id} className="project-item-container">
                <button
                  className={`project-item ${selectedProject === project.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  {project.name}
                </button>
                <button 
                  className="delete-project-btn"
                  onClick={() => deleteProject(project.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="filters-section">
          <div className="date-filter">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <select 
              value={dateFilter}
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

        <div className="todo-summary">
          <p>Total Todos: {filteredTodos.length}</p>
          <p>Completed: {filteredTodos.filter(todo => todo.completed).length}</p>
          <p>Pending: {filteredTodos.filter(todo => !todo.completed).length}</p>
        </div>
        
        <form onSubmit={addTodo} className="todo-form">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="date-input"
          >
            <option value="">No Date</option>
            <option value="today">Today</option>
            <option value="someday">Someday</option>
            <option value={customDate || ''}>Custom Date</option>
          </select>
          {selectedDate === customDate && (
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="date-input"
            />
          )}
          <button type="submit">Add Todo</button>
        </form>

        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              {editId === todo.id ? (
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
                    onClick={() => saveEdit(todo.id)} 
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
                    onChange={() => toggleTodo(todo.id)}
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
                    value={todo.projectId || ''}
                    onChange={(e) => moveTodoToProject(todo.id, e.target.value ? Number(e.target.value) : null)}
                    className="project-select"
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => startEdit(todo.id, todo.text, todo.date)} 
                    className="icon-btn edit-btn"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)} 
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
    </>
  );
}
