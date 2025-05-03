import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('Making request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    console.log('Received response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data,
        headers: error.config?.headers
      }
    });
    return Promise.reject(error);
  }
);

export const todoApi = {
  getAllTodos: async () => {
    try {
      const response = await api.get('/todos');
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error.response?.data || error.message);
      throw error;
    }
  },

  createTodo: async (text, projectId = null, date = null) => {
    try {
      console.log('Creating todo with:', { text, projectId, date });
      const response = await api.post('/todos', { text, projectId, date });
      console.log('Todo created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error.response?.data || error.message);
      throw error;
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const response = await api.patch(`/todos/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating todo:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      await api.delete(`/todos/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error.response?.data || error.message);
      throw error;
    }
  }
};

export const projectApi = {
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error.response?.data || error.message);
      throw error;
    }
  },

  createProject: async (name) => {
    try {
      console.log('Creating project with:', { name });
      const response = await api.post('/projects', { name });
      console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProject: async (id, name) => {
    try {
      const response = await api.patch(`/projects/${id}`, { name });
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error('Error deleting project:', error.response?.data || error.message);
      throw error;
    }
  }
};
