import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Mock responses for different types of goals
const mockResponses = {
  default: [
    { text: "Research and gather necessary information" },
    { text: "Create a detailed timeline" },
    { text: "Assign responsibilities and tasks" },
    { text: "Set up progress tracking" }
  ],
  "camping trip": [
    { text: "Research camping locations and make reservations" },
    { text: "Create camping gear checklist" },
    { text: "Plan meals and create shopping list" },
    { text: "Check weather and pack appropriate clothing" }
  ],
  "birthday party": [
    { text: "Create guest list and send invitations" },
    { text: "Plan party menu and order cake" },
    { text: "Arrange decorations and party supplies" },
    { text: "Plan activities and music playlist" }
  ]
};

export async function generateTasks(goal) {
  try {
    // Try using OpenAI API first
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a task breakdown assistant. Generate 3-5 practical, actionable subtasks for the given goal. Return ONLY a JSON object with a 'tasks' array containing objects with 'text' properties. Example: {\"tasks\": [{\"text\": \"Task 1\"}, {\"text\": \"Task 2\"}]}"
        },
        {
          role: "user",
          content: `Break down this goal into subtasks: ${goal}`
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    console.log('Raw OpenAI Response:', completion.choices[0].message.content);
    
    try {
      const parsedResponse = JSON.parse(completion.choices[0].message.content);
      console.log('Parsed Response:', parsedResponse);
      
      if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('Invalid response format: missing tasks array');
      }
      
      // Validate each task has a text property
      const validTasks = parsedResponse.tasks.every(task => 
        task && typeof task === 'object' && typeof task.text === 'string'
      );
      
      if (!validTasks) {
        console.error('Invalid task format in response:', parsedResponse.tasks);
        throw new Error('Invalid task format: missing text property');
      }
      
      return parsedResponse.tasks;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error) {
    console.error('Error generating tasks:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });

    // If API fails, use mock response
    console.log('Falling back to mock response');
    const goalLower = goal.toLowerCase();
    let mockTasks;
    
    if (goalLower.includes('camping')) {
      mockTasks = mockResponses['camping trip'];
    } else if (goalLower.includes('birthday')) {
      mockTasks = mockResponses['birthday party'];
    } else {
      mockTasks = mockResponses.default;
    }

    return mockTasks;
  }
}
