// Grok AI API integration using xAI
// Get your free API key at: https://console.x.ai/
// Note: Also supports Groq API (https://console.groq.com) which has better browser CORS support

// Detect which API to use based on key prefix
const getApiConfig = (apiKey: string) => {
  if (apiKey.startsWith('gsk_')) {
    // Groq API key
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
    };
  }
  // Default to xAI/Grok
  return {
    url: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-beta',
  };
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeckContext {
  commanderName?: string;
  format: string;
  cardCount: number;
  cards: { name: string; quantity: number; type?: string }[];
  colorIdentity?: string[];
}

// System prompt for MTG deck building assistance
const getSystemPrompt = (deckContext?: DeckContext): string => {
  let prompt = `You are an expert Magic: The Gathering deck building assistant. You have deep knowledge of:
- Card synergies and combos
- Mana curves and deck construction theory
- Format-specific strategies (Commander/EDH, Standard, Modern, Pioneer, etc.)
- Budget alternatives for expensive cards
- Current meta and popular strategies

Be concise but helpful. When suggesting cards, mention why they synergize with the deck.
Use card names exactly as they appear in MTG (proper capitalization).
When listing multiple cards, format them clearly.`;

  if (deckContext) {
    prompt += `\n\nCurrent deck context:
- Format: ${deckContext.format}
- Card count: ${deckContext.cardCount}/100
${deckContext.commanderName ? `- Commander: ${deckContext.commanderName}` : ''}
${deckContext.colorIdentity?.length ? `- Color identity: ${deckContext.colorIdentity.join(', ')}` : ''}

Current cards in deck:
${deckContext.cards.slice(0, 30).map(c => `- ${c.quantity}x ${c.name}`).join('\n')}
${deckContext.cards.length > 30 ? `\n...and ${deckContext.cards.length - 30} more cards` : ''}`;
  }

  return prompt;
};

// Store API key in localStorage
export const getGrokApiKey = (): string | null => {
  return localStorage.getItem('grok_api_key');
};

export const setGrokApiKey = (key: string): void => {
  localStorage.setItem('grok_api_key', key);
};

export const removeGrokApiKey = (): void => {
  localStorage.removeItem('grok_api_key');
};

// Main chat function
export async function chatWithGrok(
  messages: ChatMessage[],
  deckContext?: DeckContext,
  onStream?: (chunk: string) => void
): Promise<string> {
  const apiKey = getGrokApiKey();
  
  if (!apiKey) {
    throw new Error('API key not configured. Please add your API key in settings.');
  }

  const apiConfig = getApiConfig(apiKey);

  const systemMessage: ChatMessage = {
    role: 'system',
    content: getSystemPrompt(deckContext),
  };

  const allMessages = [systemMessage, ...messages];

  try {
    if (onStream) {
      // Streaming response
      const response = await fetch(apiConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: allMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error('API access denied. If using xAI/Grok, try Groq instead (free at console.groq.com) - it has better browser support.');
        }
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onStream(content);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      return fullContent;
    } else {
      // Non-streaming response
      const response = await fetch(apiConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error('API access denied. If using xAI/Grok, try Groq instead (free at console.groq.com) - it has better browser support.');
        }
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const data: GrokResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with Grok API');
  }
}

// Quick suggestion prompts
export const suggestionPrompts = [
  "What cards would synergize well with my commander?",
  "How can I improve my mana curve?",
  "Suggest some budget alternatives for expensive cards",
  "What removal spells should I consider?",
  "How can I make this deck more competitive?",
  "What are good card draw options for my colors?",
];
