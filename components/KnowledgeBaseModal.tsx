
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch, getTheme } = useAppContext();
  const theme = getTheme();
  const [text, setText] = useState(state.knowledgeBase.join('\n'));

  const handleSave = () => {
    const items = text.split('\n').map(item => item.trim()).filter(Boolean);
    dispatch({ type: 'UPDATE_KNOWLEDGE_BASE', payload: items });
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className={`${theme.classes.secondaryBg} ${theme.classes.font} w-full max-w-2xl rounded-lg shadow-2xl p-6 border ${theme.classes.border}`}>
        <h2 className={`text-2xl font-bold ${theme.classes.accentText} mb-4`}>Knowledge Base</h2>
        <p className={`${theme.classes.secondaryText} mb-4`}>
          Add facts for DevTalk to remember across all conversations (one per line).
          The AI will use this context to personalize its responses.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className={`${theme.classes.bg} ${theme.classes.text} w-full p-3 rounded-md border ${theme.classes.border} focus:outline-none focus:ring-2 ${theme.classes.primary.replace('bg-', 'ring-')}`}
          placeholder="e.g., I prefer using TypeScript for my projects."
        />
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${theme.classes.secondaryText} ${theme.classes.accent} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-md ${theme.classes.primary} ${theme.classes.primaryText} font-bold transition-colors`}
          >
            Save Knowledge
          </button>
        </div>
      </div>
    </div>
  );
};
