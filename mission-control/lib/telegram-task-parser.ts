/**
 * Parse natural language task creation from Telegram messages
 * 
 * Examples:
 * "create task: research competitor pricing"
 * "new task: build landing page copy"
 * "task: analyze user feedback from surveys"
 */

export interface ParsedTask {
  title: string;
  description: string;
  isTask: boolean;
}

export function parseTaskFromMessage(message: string): ParsedTask {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for task creation keywords
  const taskPatterns = [
    /^create task:?\s+(.+)/i,
    /^new task:?\s+(.+)/i,
    /^add task:?\s+(.+)/i,
    /^task:?\s+(.+)/i,
  ];

  for (const pattern of taskPatterns) {
    const match = message.match(pattern);
    if (match) {
      const content = match[1].trim();
      
      // Split into title and description if there's a newline or " - "
      let title = content;
      let description = content;
      
      if (content.includes('\n')) {
        const lines = content.split('\n');
        title = lines[0].trim();
        description = lines.slice(1).join('\n').trim() || title;
      } else if (content.includes(' - ')) {
        const parts = content.split(' - ');
        title = parts[0].trim();
        description = parts.slice(1).join(' - ').trim();
      }

      return {
        title,
        description,
        isTask: true,
      };
    }
  }

  return {
    title: '',
    description: '',
    isTask: false,
  };
}
