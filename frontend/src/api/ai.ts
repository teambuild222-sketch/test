const API_BASE = 'http://localhost:5000/api';

export interface AIConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  created_at: string;
}

// Fetch headers helper incorporating active username
const getHeaders = (username: string) => {
  return {
    'Content-Type': 'application/json',
    'X-User-Username': username || 'admin',
  };
};

export const aiApi = {
  // Get all conversation threads for active user
  async listConversations(username: string): Promise<AIConversation[]> {
    const response = await fetch(`${API_BASE}/ai/conversations`, {
      method: 'GET',
      headers: getHeaders(username),
    });
    if (!response.ok) {
      throw new Error('Failed to load conversations.');
    }
    return response.json();
  },

  // Start a new conversation thread
  async createConversation(username: string, title?: string): Promise<AIConversation> {
    const response = await fetch(`${API_BASE}/ai/conversations`, {
      method: 'POST',
      headers: getHeaders(username),
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation.');
    }
    return response.json();
  },

  // Delete a conversation thread
  async deleteConversation(username: string, convId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/ai/conversations/${convId}`, {
      method: 'DELETE',
      headers: getHeaders(username),
    });
    if (!response.ok) {
      throw new Error('Failed to delete conversation.');
    }
    const data = await response.json();
    return data.success;
  },

  // Get message history for a conversation
  async getMessages(username: string, convId: number): Promise<AIMessage[]> {
    const response = await fetch(`${API_BASE}/ai/conversations/${convId}/messages`, {
      method: 'GET',
      headers: getHeaders(username),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages.');
    }
    return response.json();
  },

  // Request stream cancellation on backend
  async cancelStream(convId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/ai/conversations/${convId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.success;
  },

  // Send message to normal chat endpoint
  async sendChatMessage(username: string, convId: number, text: string): Promise<AIMessage> {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(username),
      body: JSON.stringify({ conversation_id: convId, text }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send message. Status: ${response.status}`);
    }
    return response.json();
  },

  // Join/RSVP to an event
  async rsvpEvent(username: string, eventId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/event/rsvp`, {
      method: 'POST',
      headers: getHeaders(username),
      body: JSON.stringify({ event_id: eventId }),
    });
    if (!response.ok) {
      throw new Error('Failed to RSVP.');
    }
    return response.json();
  },

  // Connect with a user
  async connectUser(username: string, connectionId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/user/connect`, {
      method: 'POST',
      headers: getHeaders(username),
      body: JSON.stringify({ connection_id: connectionId }),
    });
    if (!response.ok) {
      throw new Error('Failed to connect.');
    }
    return response.json();
  },

  // Stream AI completion response chunk-by-chunk
  async streamResponse(
    username: string,
    convId: number,
    text: string,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (err: any) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/ai/conversations/${convId}/stream`, {
        method: 'POST',
        headers: getHeaders(username),
        body: JSON.stringify({ text }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize stream. Status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream body returned from server.');
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          onChunk(chunkStr);
        }
      }
      onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.info('Fetch stream aborted by client.');
        onDone();
      } else {
        onError(err);
      }
    }
  },
};

const logger = {
  info: (msg: string) => console.log(`[API Client] ${msg}`),
};
