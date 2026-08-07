export function cleanTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\[\d{4}$/g, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  food: ['food', 'cook', 'recipe', 'meal', 'chef', 'dish', 'cuisine', 'restaurant', 'culinary', 'eat', 'bake', 'kitchen', 'sushi', 'steak'],
  football: ['football', 'nfl', 'soccer', 'quarterback', 'touchdown', 'super bowl', 'ball', 'pitch', 'fifa', 'premier league', 'packers', 'cowboys', 'texans', 'vikings', 'steelers', 'training camp', 'stadium'],
  movies: ['movie', 'film', 'cinema', 'hollywood', 'actor', 'actress', 'director', 'oscar', 'biography', 'theatre', 'box office', 'trailer', 'dune', 'chalamet'],
  fitness: ['workout', 'fitness', 'exercise', 'gym', 'training', 'muscle', 'abs', 'health', 'cardio', 'strength', 'runner', 'athlete'],
  career: ['job', 'career', 'hiring', 'interview', 'salary', 'resume', 'promotion', 'workplace', 'employment'],
  programming: ['code', 'coding', 'developer', 'software', 'programming', 'python', 'javascript', 'typescript', 'api', 'github', 'web_dev'],
  ai: ['ai', 'llm', 'gpt', 'machine learning', 'artificial intelligence', 'model', 'neural', 'deep learning'],
  books: ['book', 'author', 'read', 'novel', 'literature', 'bestseller', 'fiction', 'non-fiction'],
  stock_market: ['stock', 'market', 's&p', 'dow', 'nasdaq', 'investing', 'shares', 'trading', 'wall street', 'earnings'],
  finance: ['finance', 'budget', 'saving', 'money', 'investment', 'bank', 'wealth', 'financial'],
  travel: ['travel', 'trip', 'flight', 'hotel', 'destination', 'vacation', 'tourism', 'resort', 'journey'],
  shopping: ['deal', 'discount', 'sale', 'review', 'gear', 'buy', 'buyer', 'best', 'wirecutter', 'product', 'shopping'],
};

export function isTagRelevantToArticle(title: string, tag: string): boolean {
  if (!title || !tag) return false;
  const lower = title.toLowerCase();
  const t = tag.toLowerCase();
  
  if (lower.includes(t)) return true;
  
  const keywords = DOMAIN_KEYWORDS[t] || [t];
  return keywords.some((k) => lower.includes(k));
}
