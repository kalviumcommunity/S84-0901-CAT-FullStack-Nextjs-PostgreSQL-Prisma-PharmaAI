import { MessageBubble, Message } from './MessageBubble';
import { useEffect, useRef } from 'react';
import { Database } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl h-full flex flex-col">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 my-auto pb-20 animate-in fade-in zoom-in duration-500">
            <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="rounded-2xl bg-indigo-50 p-4 mb-4 inline-flex">
                <Database className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Welcome to PharmaResearch AI</h3>
              <p className="mt-1 max-w-md text-slate-500 leading-relaxed">
                Upload pharmaceutical documents and ask questions. I&apos;ll analyze the content and provide detailed answers with exact citations to the source material.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col pt-4">
            {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
          </div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>
    </div>
  );
}
