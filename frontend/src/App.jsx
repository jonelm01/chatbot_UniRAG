import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [threads, setThreads] = useState(() => {
      const saved = localStorage.getItem('chat_threads');
      const parsed = saved ? JSON.parse(saved) : [];
      // Normalize to ensure thread_id exists for old and new threads
      return parsed.map(t => ({
          ...t,
          thread_id: t.thread_id || t.id
      }));
  });
  // Initialize with a fresh ID so every reload is a new conversation/landing page
  const [currentThreadId, setCurrentThreadId] = useState(() => Math.random().toString(36).substring(7));
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      localStorage.setItem('chat_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
      const fetchHistory = async () => {
          if (currentThreadId === 'default' && messages.length === 0) return;
          
          setIsLoading(true);
          try {
              const res = await fetch(`http://localhost:8001/api/history/${currentThreadId}`);
              if (res.ok) {
                  const history = await res.json();
                  const mappedHistory = history.map(msg => ({
                      ...msg,
                      role: msg.role === 'ai' ? 'assistant' : msg.role
                  }));
                  setMessages(mappedHistory);
              } else {
                   setMessages([]);
              }
          } catch (e) {
              console.error("Failed to fetch history:", e);
          } finally {
              setIsLoading(false);
          }
      };

      if (process.env.NODE_ENV !== 'test') { 
        fetchHistory();
      }
  }, [currentThreadId]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const isNewThread = messages.length === 0;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          thread_id: currentThreadId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, botMsg]);

        // If this is a new thread, add to threads list
        if (isNewThread) {
            const newThread = {
                thread_id: currentThreadId,
                title: text.substring(0, 30) + '...',
                timestamp: new Date().toISOString()
            };
            setThreads(prev => [newThread, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectThread = (threadId) => {
    setCurrentThreadId(threadId);
    setMessages([]);
  };

  const handleNewThread = () => {
    const newThreadId = Math.random().toString(36).substring(7);
    setCurrentThreadId(newThreadId);
    setMessages([]);
  };

  const handleDeleteThread = (threadId) => {
    setThreads(prev => prev.filter(t => t.thread_id !== threadId));
    if (currentThreadId === threadId) {
        handleNewThread();
    }
    // Also call API to delete history
    fetch(`http://localhost:8001/api/history/${threadId}`, {
        method: 'DELETE'
    }).catch(console.error);
  };

  // Determine if should show welcome screen
  // Only show it no messages AND aren't currently loading history
  const isWelcomeVisible = messages.length === 0 && !isLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        threads={threads} 
        currentThreadId={currentThreadId} 
        onSelectThread={handleSelectThread} 
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread} 
      />
      <div className="flex-1 relative flex flex-col h-full bg-background">
        {/* Title Bar */}
        <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-center border-b border-border bg-background/80 backdrop-blur-sm z-10">
            <span className="font-semibold text-sm text-foreground/80">UniRAG</span>
        </div>
        
        {/* Main Content Area */}
        {isWelcomeVisible ? (
            <div className="flex-1 flex flex-col items-center justify-center relative">
                 <WelcomeScreen />
                 <ChatInput onSend={handleSendMessage} disabled={isLoading} isCentered={true} />
            </div>
        ) : (
            <>
                 <div className="flex-1 overflow-auto pb-40 pt-14 scroll-smooth">
                    <div className="py-2">
                        {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                        ))}
                    </div>
                    {isLoading && (
                        <div className="w-full h-24 flex items-center justify-center">
                        <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                        </div>
                    )}
                    <div className="h-12 w-full"></div> 
                 </div>
                 <ChatInput onSend={handleSendMessage} disabled={isLoading} isCentered={false} />
            </>
        )}
      </div>
    </div>
  );
}

export default App;
