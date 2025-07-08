import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Chat, Folder } from '../types';
import { DotsVerticalIcon, PencilIcon, TrashIcon, FolderIcon } from './Icons';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (chatId: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onSelect }) => {
  const { state, dispatch, getTheme } = useAppContext();
  const theme = getTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleRename = () => {
    const newTitle = prompt('Enter new chat title:', chat.title);
    if (newTitle && newTitle !== chat.title) {
      dispatch({ type: 'RENAME_CHAT', payload: { chatId: chat.id, newTitle } });
    }
    setMenuOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${chat.title}"?`)) {
      dispatch({ type: 'DELETE_CHAT', payload: { chatId: chat.id } });
    }
    setMenuOpen(false);
  };

  const handleMoveToFolder = (folderId: string | null) => {
    dispatch({ type: 'MOVE_CHAT_TO_FOLDER', payload: { chatId: chat.id, newFolderId: folderId } });
    setMoveMenuOpen(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setMoveMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      onClick={() => onSelect(chat.id)}
      className={`group flex items-center justify-between text-sm py-1.5 px-2 rounded-md cursor-pointer relative ${
        isActive
          ? `${theme.classes.primary.replace('bg-', 'bg-opacity-30 ')} ${theme.classes.accentText}`
          : `${theme.classes.secondaryText} ${theme.classes.accent}`
      }`}
    >
      <span className="truncate flex-1 pr-2">{chat.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <DotsVerticalIcon className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div ref={menuRef} className={`absolute right-0 top-6 w-40 ${theme.classes.bg} border ${theme.classes.border} rounded-md shadow-lg z-30`}>
          <button onClick={handleRename} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} ${theme.classes.secondaryText} flex items-center gap-2`}>
            <PencilIcon className="w-4 h-4" /> Rename
          </button>
          <div className="relative">
            <button onMouseEnter={() => setMoveMenuOpen(true)} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} ${theme.classes.secondaryText} flex items-center gap-2`}>
              <FolderIcon className="w-4 h-4" /> Move to
            </button>
            {moveMenuOpen && (
                 <div onMouseLeave={() => setMoveMenuOpen(false)} className={`absolute -left-full top-0 w-40 ${theme.classes.bg} border ${theme.classes.border} rounded-md shadow-lg`}>
                    <button onClick={() => handleMoveToFolder(null)} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} ${theme.classes.secondaryText}`}>Unfiled</button>
                    {state.folders.map(folder => (
                        <button key={folder.id} onClick={() => handleMoveToFolder(folder.id)} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} ${theme.classes.secondaryText}`}>{folder.name}</button>
                    ))}
                </div>
            )}
          </div>
          <button onClick={handleDelete} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} text-red-400 flex items-center gap-2`}>
            <TrashIcon className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
