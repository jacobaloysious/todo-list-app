// Get projects from localStorage
export function getInitialProjects() {
  const saved = localStorage.getItem('projects');
  return saved ? JSON.parse(saved) : [];
}

// Save projects to localStorage
export function saveProjects(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// Get todos from localStorage with project support
export function getInitialTodos() {
  const saved = localStorage.getItem('todos');
  const todos = saved ? JSON.parse(saved) : [];
  // Ensure all todos have a projectId field (null means no project)
  return todos.map(todo => ({
    ...todo,
    projectId: todo.projectId ?? null
  }));
}

// Save todos to localStorage
export function saveTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}
