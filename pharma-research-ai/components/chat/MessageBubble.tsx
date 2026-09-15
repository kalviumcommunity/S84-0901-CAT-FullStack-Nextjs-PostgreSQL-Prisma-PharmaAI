import { User, Sparkles } from 'lucide-react';
import { CitationBlock } from './CitationBlock';

export interface Source {
  documentName: string;
  pageNumber: number;
  content?: string;
}

export interface Message {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  sources?: Source[];
}

export function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === 'AI';

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-6 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${
            isAI ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-gradient-to-br from-slate-800 to-slate-700 text-white'
          }`}
        >
          {isAI ? <Sparkles className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>
        <div
          className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
        >
          <div
            className={`px-6 py-4 text-[15px] leading-relaxed shadow-sm transition-all duration-200 ${
              isAI
                ? 'rounded-2xl rounded-tl-sm border border-slate-200/60 bg-white text-slate-800 hover:shadow-md'
                : 'rounded-2xl rounded-tr-sm bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {isAI && message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <CitationBlock
                  key={idx}
                  documentName={source.documentName}
                  pageNumber={source.pageNumber}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
