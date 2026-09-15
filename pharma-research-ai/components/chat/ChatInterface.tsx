'use client';

import { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Message } from './MessageBubble';
import { Microscope, Activity } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'AI',
      content: 'Hello! I am PharmaResearch AI. How can I help you explore your pharmaceutical documents today?',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content,
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'AI',
        content: 'Based on the clinical trial reports, the primary endpoint was progression-free survival (PFS). The study demonstrated a statistically significant improvement compared to the control group.\n\nThe safety profile was consistent with previous observations, with the most common adverse events being mild to moderate fatigue and nausea.',
        sources: [
          { documentName: 'Clinical-Trial-A-Phase3.pdf', pageNumber: 18 },
          { documentName: 'Safety-Bulletin-2023.pdf', pageNumber: 4 }
        ]
      };
      setMessages((prev) => [...prev, newAIMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen flex-col bg-white overflow-hidden font-sans">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-200">
            <Microscope className="h-6 w-6" />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <Activity className="h-3 w-3 text-indigo-600" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              PharmaResearch AI
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">Beta</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Document-Grounded Research Assistant</p>
          </div>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col overflow-hidden relative bg-slate-50/30">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 z-0"></div>
        <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
           <MessageList messages={messages} />
           <div className="relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
             <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
           </div>
        </div>
      </main>
    </div>
  );
}
