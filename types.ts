export interface FilePreview {
  name: string;
  type: string; // e.g., 'image/png', 'application/pdf'
  dataUrl: string; // a data URL for rendering the preview
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  filePreview?: FilePreview;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  chatIds: string[];
}

export interface Theme {
  name: string;
  classes: {
    bg: string;
    text: string;
    primary: string;
    primaryText: string;
    secondaryBg: string;
    secondaryText: string;
    accent: string;
    accentText: string;
    border: string;
    font: string;
  };
}

export type KnowledgeItem = string;

export interface AppState {
  themeName: string;
  folders: Folder[];
  chats: Record<string, Chat>;
  knowledgeBase: KnowledgeItem[];
  activeChatId: string | null;
  sidebarOpen: boolean;
}

export type AppAction =
  | { type: 'SET_THEME'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CREATE_FOLDER'; payload: { name: string } }
  | { type: 'RENAME_FOLDER'; payload: { folderId: string; newName: string } }
  | { type: 'DELETE_FOLDER'; payload: { folderId: string } }
  | { type: 'CREATE_CHAT'; payload: { folderId: string | null } }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'DELETE_CHAT'; payload: { chatId: string } }
  | { type: 'RENAME_CHAT'; payload: { chatId: string; newTitle: string } }
  | { type: 'MOVE_CHAT_TO_FOLDER'; payload: { chatId: string; newFolderId: string | null } }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: { chatId:string; text: string } }
  | { type: 'SET_CHAT_TITLE'; payload: { chatId: string; title: string } }
  | { type: 'UPDATE_KNOWLEDGE_BASE'; payload: KnowledgeItem[] }
  | { type: 'INITIALIZE_STATE'; payload: Partial<AppState> };