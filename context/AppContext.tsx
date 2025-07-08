
import React, { createContext, useReducer, useContext, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppAction, Folder, Chat, Message } from '../types';
import { uuid } from '../constants';
import { getChatTitle } from '../services/geminiService';
import { THEMES } from '../constants';

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getTheme: () => import('../types').Theme;
} | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INITIALIZE_STATE':
        return { ...state, ...action.payload };
    case 'SET_THEME':
      return { ...state, themeName: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'CREATE_FOLDER': {
      const newFolder: Folder = { id: uuid(), name: action.payload.name, chatIds: [] };
      return { ...state, folders: [...state.folders, newFolder] };
    }
    case 'RENAME_FOLDER': {
      return {
        ...state,
        folders: state.folders.map(f => f.id === action.payload.folderId ? { ...f, name: action.payload.newName } : f),
      };
    }
    case 'DELETE_FOLDER': {
        const folderToDelete = state.folders.find(f => f.id === action.payload.folderId);
        if (!folderToDelete) return state;
        const chatIdsToDelete = folderToDelete.chatIds;
        const newChats = { ...state.chats };
        chatIdsToDelete.forEach(id => delete newChats[id]);
        
        const newActiveChatId = chatIdsToDelete.includes(state.activeChatId || '') ? null : state.activeChatId;

        return {
            ...state,
            folders: state.folders.filter(f => f.id !== action.payload.folderId),
            chats: newChats,
            activeChatId: newActiveChatId,
        };
    }
    case 'CREATE_CHAT': {
      const newChat: Chat = { id: uuid(), title: 'New Chat', messages: [], createdAt: Date.now() };
      let newFolders = [...state.folders];
      if (action.payload.folderId) {
        newFolders = state.folders.map(f => {
          if (f.id === action.payload.folderId) {
            return { ...f, chatIds: [newChat.id, ...f.chatIds] };
          }
          return f;
        });
      }
      return {
        ...state,
        chats: { ...state.chats, [newChat.id]: newChat },
        folders: newFolders,
        activeChatId: newChat.id,
      };
    }
    case 'SET_ACTIVE_CHAT':
        return { ...state, activeChatId: action.payload };
    case 'RENAME_CHAT': {
        const { chatId, newTitle } = action.payload;
        const chat = state.chats[chatId];
        if (!chat || !newTitle) return state;
        return {
            ...state,
            chats: { ...state.chats, [chatId]: { ...chat, title: newTitle }},
        };
    }
    case 'DELETE_CHAT': {
        const { chatId } = action.payload;
        const newChats = { ...state.chats };
        delete newChats[chatId];

        const newFolders = state.folders.map(f => ({
            ...f,
            chatIds: f.chatIds.filter(id => id !== chatId),
        }));
        
        return {
            ...state,
            chats: newChats,
            folders: newFolders,
            activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
        };
    }
    case 'MOVE_CHAT_TO_FOLDER': {
        const { chatId, newFolderId } = action.payload;
        // Remove from all folders first
        let foldersWithoutChat = state.folders.map(f => ({
            ...f,
            chatIds: f.chatIds.filter(id => id !== chatId)
        }));
        
        // Add to new folder if a folderId is provided
        if (newFolderId) {
            foldersWithoutChat = foldersWithoutChat.map(f => {
                if (f.id === newFolderId) {
                    return { ...f, chatIds: [chatId, ...f.chatIds] };
                }
                return f;
            });
        }
        return { ...state, folders: foldersWithoutChat };
    }
    case 'ADD_MESSAGE': {
      const { chatId, message } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return state;
      const newMessages = [...chat.messages, message];
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: { ...chat, messages: newMessages },
        },
      };
    }
    case 'UPDATE_LAST_MESSAGE': {
        const { chatId, text } = action.payload;
        const chat = state.chats[chatId];
        if (!chat || chat.messages.length === 0) return state;
        const lastMessage = chat.messages[chat.messages.length - 1];
        if (lastMessage.role !== 'model') return state;

        const updatedMessage = { ...lastMessage, text: lastMessage.text + text };
        const newMessages = [...chat.messages.slice(0, -1), updatedMessage];

        return {
            ...state,
            chats: {
                ...state.chats,
                [chatId]: { ...chat, messages: newMessages },
            },
        };
    }
    case 'SET_CHAT_TITLE': {
        const { chatId, title } = action.payload;
        const chat = state.chats[chatId];
        if (!chat) return state;
        return {
            ...state,
            chats: {
                ...state.chats,
                [chatId]: { ...chat, title },
            },
        };
    }
    case 'UPDATE_KNOWLEDGE_BASE':
        return { ...state, knowledgeBase: action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
  themeName: 'Hacker Mode',
  folders: [],
  chats: {},
  knowledgeBase: [],
  activeChatId: null,
  sidebarOpen: true
};


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isInitialized = useRef(false);

  // Effect to hydrate state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedStateRaw = localStorage.getItem('devtalk-state');
      if (storedStateRaw) {
        const persistedState = JSON.parse(storedStateRaw);
        dispatch({ type: 'INITIALIZE_STATE', payload: persistedState });
      }
    } catch (error) {
        console.error("Failed to parse state from localStorage", error);
    }
  }, []);

  // Effect to persist state to localStorage whenever it changes, after initial hydration
  useEffect(() => {
    if (!isInitialized.current) {
        // If state is not initial state, it means we've hydrated or performed the first action.
        // We can now start persisting.
        if (state !== initialState) {
            isInitialized.current = true;
        } else {
            // Still on initial state (e.g., first load with empty storage), so don't save yet.
            return;
        }
    }
    
    // From here on, we are initialized and should persist any changes.
    const { sidebarOpen, ...stateToPersist } = state;
    try {
        localStorage.setItem('devtalk-state', JSON.stringify(stateToPersist));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  // Auto title generation
  useEffect(() => {
    if (state.activeChatId && state.chats[state.activeChatId]) {
      const activeChat = state.chats[state.activeChatId];
      if (activeChat.messages.length === 2 && activeChat.title === 'New Chat') {
        getChatTitle(activeChat.messages).then(title => {
          dispatch({ type: 'SET_CHAT_TITLE', payload: { chatId: activeChat.id, title } });
        });
      }
    }
  }, [state.activeChatId, state.chats]);


  const getTheme = () => {
    return THEMES.find(t => t.name === state.themeName) || THEMES[0];
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
