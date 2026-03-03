export enum SourceType {
  PDF = 'PDF',
  DOC = 'DOC',
  LINK = 'LINK',
  YOUTUBE = 'YOUTUBE',
  TEXT = 'TEXT'
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  content: string; // Base64 for files, URL for links, or raw text
  mimeType?: string;
  summary?: string;
  keywords?: string[];
  addedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  citations?: Citation[];
}

export interface Citation {
  sourceId: string;
  sourceName: string;
  snippet: string;
}

export interface NotebookGuide {
  tableOfContents: string[];
  faq: { question: string; answer: string }[];
  timeline?: { date: string; event: string }[];
}

export interface Theme {
  id: string;
  name: string;
  bg: string;
  sidebar: string;
  card: string;
  accent: string;
  text: string;
  textMuted: string;
  banner?: string;
}

export const THEMES: Theme[] = [
  {
    id: 'spotify-dark',
    name: 'Spotify Dark',
    bg: '#121212',
    sidebar: '#000000',
    card: '#181818',
    accent: '#1DB954',
    text: '#FFFFFF',
    textMuted: '#B3B3B3',
    banner: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    bg: '#2E3440',
    sidebar: '#242933',
    card: '#3B4252',
    accent: '#88C0D0',
    text: '#ECEFF4',
    textMuted: '#D8DEE9',
    banner: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=2088&auto=format&fit=crop'
  },
  {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    sidebar: '#191a21',
    card: '#44475a',
    accent: '#bd93f9',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    banner: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'bloom',
    name: 'Spring Bloom',
    bg: '#FFF5F5',
    sidebar: '#FFE3E3',
    card: '#FFFFFF',
    accent: '#FF8787',
    text: '#2D3436',
    textMuted: '#636E72',
    banner: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2070&auto=format&fit=crop'
  }
];
