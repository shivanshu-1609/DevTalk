
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';

const ThemedApp: React.FC = () => {
  const { getTheme } = useAppContext();
  const theme = getTheme();

  return (
    <div className={`w-screen h-screen flex overflow-hidden ${theme.classes.bg} ${theme.classes.font}`}>
      <Sidebar />
      <ChatView />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
};

export default App;
