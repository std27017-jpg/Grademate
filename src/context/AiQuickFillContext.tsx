import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AiQuickFillScope } from '../types/aiQuickFill';

interface OpenAiQuickFillOptions {
  scope?: AiQuickFillScope;
  initialText?: string;
  subjectId?: string;
  initialFile?: File;
}

interface AiQuickFillContextType {
  isOpen: boolean;
  scope: AiQuickFillScope;
  initialText: string;
  subjectId?: string;
  initialFile?: File;
  openAiQuickFill: (options?: OpenAiQuickFillOptions) => void;
  closeAiQuickFill: () => void;
}

const AiQuickFillContext = createContext<AiQuickFillContextType | undefined>(undefined);

export const AiQuickFillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<AiQuickFillScope>('all');
  const [initialText, setInitialText] = useState('');
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [initialFile, setInitialFile] = useState<File | undefined>(undefined);

  const openAiQuickFill = (options?: OpenAiQuickFillOptions) => {
    setScope(options?.scope || 'all');
    setInitialText(options?.initialText || '');
    setSubjectId(options?.subjectId);
    setInitialFile(options?.initialFile);
    setIsOpen(true);
  };

  const closeAiQuickFill = () => {
    setIsOpen(false);
    setInitialText('');
    setSubjectId(undefined);
    setInitialFile(undefined);
  };

  return (
    <AiQuickFillContext.Provider
      value={{
        isOpen,
        scope,
        initialText,
        subjectId,
        initialFile,
        openAiQuickFill,
        closeAiQuickFill,
      }}
    >
      {children}
    </AiQuickFillContext.Provider>
  );
};

export function useAiQuickFill(): AiQuickFillContextType {
  const context = useContext(AiQuickFillContext);
  if (!context) {
    throw new Error('useAiQuickFill must be used within an AiQuickFillProvider');
  }
  return context;
}
