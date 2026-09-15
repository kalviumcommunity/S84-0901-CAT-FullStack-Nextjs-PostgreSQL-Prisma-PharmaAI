import { FileText, ChevronRight } from 'lucide-react';

interface CitationBlockProps {
  documentName: string;
  pageNumber: number;
}

export function CitationBlock({ documentName, pageNumber }: CitationBlockProps) {
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm text-indigo-900 shadow-sm transition-all hover:bg-indigo-100 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
      <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-indigo-600">
        <FileText className="h-4 w-4" />
      </div>
      <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{documentName}</span>
      <span className="text-indigo-300">•</span>
      <span className="font-medium text-indigo-600">Page {pageNumber}</span>
      <ChevronRight className="ml-1 h-4 w-4 opacity-50 text-indigo-600" />
    </div>
  );
}
