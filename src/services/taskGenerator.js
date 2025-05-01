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
          content: "You are a task breakdown assistant. Generate 3-5 practical, actionable subtasks for the given goal. Format your response as a JSON array of objects, each with a 'text' property. Example: [{\"text\": \"Task 1\"}, {\"text\": \"Task 2\"}]"
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

    console.log('OpenAI Response:', completion.choices[0].message.content);
    
    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    if (!Array.isArray(parsedResponse.tasks)) {
      throw new Error('Invalid response format from OpenAI');
    }
    
    return parsedResponse.tasks;
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
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
