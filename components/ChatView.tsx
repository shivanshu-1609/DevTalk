import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Message } from './Message';
import { streamChatResponse } from '../services/geminiService';
import { uuid } from '../constants';
import { SendIcon, MenuIcon, PaperclipIcon, XCircleIcon, FileIcon } from './Icons';
import { Message as MessageType, FilePreview } from '../types';
import { processImage } from '../utils/fileProcessor';

const FilePreviewer: React.FC<{ file: File; onRemove: () => void, theme: any }> = ({ file, onRemove, theme }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    }, [file]);

    return (
        <div className={`relative p-2 border ${theme.classes.border} rounded-lg flex items-center gap-3`}>
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-md object-cover"/>
            ) : (
                <FileIcon className={`w-12 h-12 ${theme.classes.secondaryText}`}/>
            )}
            <div className="truncate">
                <p className={`${theme.classes.text} text-sm font-medium truncate`}>{file.name}</p>
                <p className={`${theme.classes.secondaryText} text-xs`}>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button onClick={onRemove} className={`absolute -top-2 -right-2 ${theme.classes.secondaryText} hover:${theme.classes.text}`}>
                <XCircleIcon className="w-6 h-6"/>
            </button>
        </div>
    )
}

export const ChatView: React.FC = () => {
  const { state, dispatch, getTheme } = useAppContext();
  const theme = getTheme();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeChat = state.activeChatId ? state.chats[state.activeChatId] : null;

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [activeChat?.messages, isLoading]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !file) || isLoading || !state.activeChatId) return;

    let filePreview: FilePreview | undefined = undefined;
    if (file) {
        const dataUrl = file.type.startsWith('image/') ? await processImage(file) : '';
        filePreview = { name: file.name, type: file.type, dataUrl };
    }

    const userMessage: MessageType = { id: uuid(), role: 'user', text: input, timestamp: Date.now(), filePreview };
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.activeChatId, message: userMessage } });
    
    const sentFile = file;
    setInput('');
    setFile(null);
    setIsLoading(true);

    const modelMessage: MessageType = { id: uuid(), role: 'model', text: '', timestamp: Date.now() };
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.activeChatId, message: modelMessage } });
    
    const fullHistory = [...(activeChat?.messages || []), userMessage];

    await streamChatResponse(
      fullHistory,
      state.knowledgeBase,
      sentFile,
      (chunk) => {
        dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: { chatId: state.activeChatId!, text: chunk } });
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, file, isLoading, state.activeChatId, state.knowledgeBase, dispatch, activeChat?.messages]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
    }
  }

  const handleDragEvents = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if(e.type === 'dragenter' || e.type === 'dragover') {
          setIsDragging(true);
      } else if (e.type === 'dragleave' || e.type === 'drop') {
          setIsDragging(false);
      }
  }

  const handleDrop = (e: React.DragEvent) => {
      handleDragEvents(e);
      if(e.dataTransfer.files?.[0]) {
          setFile(e.dataTransfer.files[0]);
      }
  }
  
  const WelcomeScreen = () => (
    <div className={`flex flex-col items-center justify-center h-full text-center ${theme.classes.text}`}>
        <h1 className={`text-5xl font-bold ${theme.classes.accentText}`}>DevTalk</h1>
        <p className="mt-4 text-lg">Your Developer-Focused AI Assistant</p>
        <p className="mt-2 text-sm max-w-md text-gray-400">Powered by Gemini, crafted by Shivanshu. Use the sidebar to manage chats, themes, and your knowledge base.</p>
    </div>
  );
  
  return (
    <div className={`flex-1 flex flex-col h-full ${theme.classes.bg}`} onDragEnter={handleDragEvents} onDragLeave={handleDragEvents} onDragOver={handleDragEvents} onDrop={handleDrop}>
       <header className={`flex-shrink-0 flex items-center justify-between p-4 border-b ${theme.classes.border} md:hidden`}>
           <button onClick={() => dispatch({type: 'TOGGLE_SIDEBAR'})} className={`${theme.classes.accentText}`}>
               <MenuIcon className="w-6 h-6"/>
           </button>
           <h2 className={`${theme.classes.accentText} font-bold`}>{activeChat?.title || 'DevTalk'}</h2>
           <div className="w-6"></div>
       </header>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 w-full">
            {activeChat ? activeChat.messages.map((msg) => <Message key={msg.id} message={msg} />) : <WelcomeScreen/>}
        </div>
      </div>
      <div className={`flex-shrink-0 p-4 border-t ${theme.classes.border}`}>
        <div className={`max-w-4xl mx-auto space-y-2`}>
            {file && <FilePreviewer file={file} onRemove={() => setFile(null)} theme={theme} />}
            <div className={`flex items-end gap-2 p-1 rounded-xl ${theme.classes.secondaryBg} border ${isDragging ? `ring-2 ${theme.classes.primary.replace('bg-','ring-')}` : theme.classes.border}`}>
            <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-lg transition-colors ${theme.classes.accentText} hover:${theme.classes.text}`}>
                <PaperclipIcon className="w-6 h-6"/>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, application/pdf"/>
            </button>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeChat ? "Message DevTalk..." : "Create a new chat to start"}
                rows={1}
                className={`w-full p-2 bg-transparent resize-none focus:outline-none ${theme.classes.text} disabled:opacity-50`}
                style={{maxHeight: '200px'}}
                disabled={!activeChat || isLoading}
            />
            <button
                onClick={handleSend}
                disabled={(!input.trim() && !file) || isLoading || !activeChat}
                className={`p-2 rounded-lg transition-colors ${(!input.trim() && !file) || isLoading || !activeChat ? `${theme.classes.secondaryText} opacity-50` : `${theme.classes.primary} ${theme.classes.primaryText}`}`}
            >
                <SendIcon className="w-6 h-6" />
            </button>
            </div>
        </div>
        {!process.env.API_KEY && (
            <p className="text-center text-xs text-red-400 mt-2">
                Warning: API_KEY is not set. The application will not function correctly.
            </p>
        )}
      </div>
    </div>
  );
};