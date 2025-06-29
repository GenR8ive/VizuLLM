import { useEffect } from 'react';

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

// Custom hook to manage document title
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    // Restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

// Function to format visual name for title
export const formatVisualTitle = (visualName: string) => {
  return `${visualName} - VizuLLM`;
};
