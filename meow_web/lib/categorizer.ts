export type Category = 'Productive' | 'Distracting' | 'Neutral';

const PRODUCTIVE_KEYWORDS = [
  'vscode', 'code', 'github', 'stackoverflow', 'figma', 'notion', 'jira', 'trello', 
  'slack', 'teams', 'zoom', 'docs', 'aws', 'azure', 'google cloud', 'localhost',
  'cursor', 'terminal', 'git', 'postman', 'lucidchart', 'antigravity' 
];

const DISTRACTING_KEYWORDS = [
  'youtube', 'twitter', 'x.com', 'facebook', 'instagram', 'reddit', 'tiktok', 
  'netflix', 'twitch', 'hulu', 'whatsapp', 'discord', 'steam', 'game', 'epic'
];

export function categorizeActivity(name: string | undefined): Category {
  if (!name) return 'Neutral';
  
  const lowerName = name.toLowerCase();

  for (const keyword of DISTRACTING_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'Distracting';
    }
  }

  for (const keyword of PRODUCTIVE_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'Productive';
    }
  }

  return 'Neutral';
}

export function calculateFocusScore(productiveTime: number, distractingTime: number): number {
  const total = productiveTime + distractingTime;
  if (total === 0) return 0; // Default if no data
  
  const score = (productiveTime / total) * 100;
  return Math.round(score);
}
