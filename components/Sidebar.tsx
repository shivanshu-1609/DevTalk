import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FolderIcon, PlusIcon, PencilIcon, TrashIcon, BrainIcon, DotsVerticalIcon } from './Icons';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ChatItem } from './ChatItem';

export const Sidebar: React.FC = () => {
  const { state, dispatch, getTheme } = useAppContext();
  const theme = getTheme();

  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [showKbModal, setShowKbModal] = useState(false);
  const [openFolderMenu, setOpenFolderMenu] = useState<string | null>(null);


  const handleCreateFolder = () => {
    const name = prompt("Enter new folder name:");
    if (name) {
      dispatch({ type: 'CREATE_FOLDER', payload: { name } });
    }
  };

  const startRenameFolder = (folder: {id: string, name: string}) => {
      setRenamingFolderId(folder.id);
      setFolderNameInput(folder.name);
      setOpenFolderMenu(null);
  }

  const handleRenameFolder = (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    if(folderNameInput.trim()){
        dispatch({ type: 'RENAME_FOLDER', payload: { folderId, newName: folderNameInput.trim() } });
    }
    setRenamingFolderId(null);
    setFolderNameInput('');
  }
  
  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm("Are you sure you want to delete this folder and all its chats?")) {
        dispatch({ type: 'DELETE_FOLDER', payload: { folderId } });
    }
    setOpenFolderMenu(null);
  }

  const handleNewChat = () => {
    dispatch({ type: 'CREATE_CHAT', payload: { folderId: null } });
    if(window.innerWidth < 768) {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }
  };
  
  const handleSelectChat = (chatId: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
    if(window.innerWidth < 768) {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }
  }

  const chatsInFolders = new Set(state.folders.flatMap(f => f.chatIds));
  const unfiledChats = Object.values(state.chats)
    .filter(c => c && !chatsInFolders.has(c.id))
    .sort((a,b) => b.createdAt - a.createdAt);

  return (
    <>
      <aside className={`absolute md:relative transform ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-64 ${theme.classes.secondaryBg} h-full flex flex-col p-3 border-r ${theme.classes.border} z-20`}>
        <div className="flex-shrink-0">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 rounded-md ${theme.classes.primary} ${theme.classes.primaryText} font-bold transition-colors`}
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-grow overflow-y-auto -mr-2 pr-2">
          {/* Folders */}
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-xs font-bold uppercase ${theme.classes.secondaryText}`}>Folders</h3>
            <button onClick={handleCreateFolder} className={`${theme.classes.accentText} ${theme.classes.accent} rounded p-1`}><PlusIcon className="w-4 h-4" /></button>
          </div>
          {state.folders.map(folder => (
            <div key={folder.id} className="mb-2">
              <div className={`group flex items-center justify-between p-2 rounded-md hover:${theme.classes.secondaryBg.replace('bg-','bg-opacity-50')}`}>
                <div className="flex items-center gap-2 flex-grow min-w-0">
                  <FolderIcon className={`w-5 h-5 ${theme.classes.accentText}`} />
                   {renamingFolderId === folder.id ? (
                        <form onSubmit={(e) => handleRenameFolder(e, folder.id)} className="flex-grow">
                            <input
                                type="text"
                                value={folderNameInput}
                                onChange={(e) => setFolderNameInput(e.target.value)}
                                onBlur={(e) => handleRenameFolder(e, folder.id)}
                                autoFocus
                                className={`w-full bg-transparent text-sm ${theme.classes.text} outline-none`}
                            />
                        </form>
                   ) : (
                    <span className={`text-sm ${theme.classes.secondaryText} truncate`}>{folder.name}</span>
                   )}
                </div>
                <div className="relative">
                    <button onClick={() => setOpenFolderMenu(openFolderMenu === folder.id ? null : folder.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DotsVerticalIcon className={`w-5 h-5 ${theme.classes.secondaryText}`} />
                    </button>
                    {openFolderMenu === folder.id && (
                    <div className={`absolute right-0 mt-2 w-36 ${theme.classes.bg} border ${theme.classes.border} rounded-md shadow-lg z-30`}>
                        <button onClick={() => startRenameFolder(folder)} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} ${theme.classes.secondaryText}`}>Rename</button>
                        <button onClick={() => handleDeleteFolder(folder.id)} className={`w-full text-left px-3 py-2 text-sm ${theme.classes.accent} text-red-400`}>Delete</button>
                    </div>
                    )}
                </div>
              </div>
              <div className="pl-4 border-l ml-4 ${theme.classes.border}">
                {folder.chatIds
                    .map(chatId => state.chats[chatId])
                    .filter(Boolean) // Filter out undefined chats
                    .sort((a,b) => b.createdAt - a.createdAt)
                    .map(chat => (
                        <ChatItem key={chat.id} chat={chat} isActive={state.activeChatId === chat.id} onSelect={handleSelectChat} />
                ))}
              </div>
            </div>
          ))}

          {/* Unfiled Chats */}
          {unfiledChats.length > 0 && (
            <>
              <h3 className={`text-xs font-bold uppercase ${theme.classes.secondaryText} mt-4 mb-2`}>Chats</h3>
              {unfiledChats.map(chat => (
                   <ChatItem key={chat.id} chat={chat} isActive={state.activeChatId === chat.id} onSelect={handleSelectChat} />
              ))}
            </>
          )}

        </div>

        <div className="flex-shrink-0 border-t pt-3 space-y-2 ${theme.classes.border}">
          <button
            onClick={() => setShowKbModal(true)}
            className={`w-full flex items-center gap-3 p-2 rounded-md ${theme.classes.accent} ${theme.classes.secondaryText} transition-colors`}
          >
            <BrainIcon className="w-5 h-5" />
            Knowledge Base
          </button>
          <ThemeSwitcher />
        </div>
      </aside>
      <KnowledgeBaseModal isOpen={showKbModal} onClose={() => setShowKbModal(false)} />
    </>
  );
};