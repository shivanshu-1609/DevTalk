import React from 'react';
import { Message as MessageType, FilePreview } from '../types';
import { useAppContext } from '../context/AppContext';
import { UserIcon, BotIcon, FileIcon } from './Icons';

const FilePreviewDisplay: React.FC<{ file: FilePreview }> = ({ file }) => {
    const { getTheme } = useAppContext();
    const theme = getTheme();
    
    return (
        <div className={`mt-2 p-2 rounded-lg border ${theme.classes.border} ${theme.classes.secondaryBg} flex items-center gap-3 max-w-xs`}>
            {file.type.startsWith('image/') ? (
                <img src={file.dataUrl} alt={file.name} className="w-12 h-12 object-cover rounded-md"/>
            ) : (
                <div className="w-12 h-12 flex items-center justify-center">
                    <FileIcon className={`w-8 h-8 ${theme.classes.secondaryText}`} />
                </div>
            )}
            <div className="truncate">
                <p className={`text-sm font-medium ${theme.classes.text} truncate`}>{file.name}</p>
                <p className={`text-xs ${theme.classes.secondaryText}`}>{file.type}</p>
            </div>
        </div>
    )
}

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const { getTheme } = useAppContext();
  const theme = getTheme();
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  const parts = text.split(codeBlockRegex);

  return (
    <div className={`prose prose-sm max-w-none ${theme.classes.text}`}>
      {parts.map((part, index) => {
        if (index % 3 === 2) { // This is the code content
          const lang = parts[index - 1] || 'code';
          return (
            <div key={index} className={`my-4 rounded-md ${theme.classes.bg}`}>
              <div className={`flex justify-between items-center px-4 py-1.5 rounded-t-md ${theme.classes.secondaryBg} ${theme.classes.secondaryText} text-xs`}>
                <span>{lang}</span>
                <button onClick={() => navigator.clipboard.writeText(part)} className="hover:text-white">Copy</button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className={theme.classes.text}>{part}</code>
              </pre>
            </div>
          );
        } else if (index % 3 === 0) { // This is regular text
          return <div key={index} className="whitespace-pre-wrap">{part.split('**').map((subPart, i) => i % 2 === 1 ? <strong key={i}>{subPart}</strong> : subPart)}</div>;
        }
        return null; // This is the language part, already used
      })}
    </div>
  );
};

interface MessageProps {
    message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const { getTheme } = useAppContext();
  const theme = getTheme();
  const isModel = message.role === 'model';

  return (
    <div className={`py-6 flex gap-4 ${isModel ? theme.classes.secondaryBg : ''}`}>
      <div className="w-8 h-8 flex-shrink-0">
        {isModel ? <BotIcon className={`w-8 h-8 ${theme.classes.accentText}`} /> : <UserIcon className={`w-8 h-8 ${theme.classes.secondaryText}`} />}
      </div>
      <div className={`w-full ${theme.classes.text} min-w-0`}>
        {message.filePreview && <FilePreviewDisplay file={message.filePreview} />}
        {message.text && <SimpleMarkdown text={message.text} />}
        {isModel && message.text.endsWith('...') && <span className="animate-pulse">|</span>}
      </div>
    </div>
  );
};