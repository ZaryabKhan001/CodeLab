import { create } from 'zustand';
import { CodeEditorState } from '../types/index';
import * as monaco from 'monaco-editor';

const getInitialState = () => {
  if (typeof window === undefined) {
    return {
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: 16,
    };
  }
  const savedLanguage = localStorage.getItem('editor-language') || 'javascript';
  const savedTheme = localStorage.getItem('editor-theme') || 'vs-dark';
  const savedFontSize = localStorage.getItem('editor-fontSize') || 16;
  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();
  return {
    ...initialState,
    output: '',
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => {
      const savedCode =
        localStorage.getItem(`editor-code-${get().language}`) || '';

      if (savedCode) {
        get().editor?.setValue(savedCode);
      }
      set({ editor });
    },
    getCode: (): string => get().editor?.getValue() || '',
    setLanguage: (language) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(
          `editor-code-${get().language}`,
          JSON.stringify(currentCode)
        );
      }
      localStorage.setItem('editor-language', language);
      set({ language, output: '', error: null });
    },
    setTheme: (theme: string) => {
        localStorage.setItem('editor-theme', theme);
        set({ theme });
    },
    setFontSize: (fontSize) => {
        localStorage.setItem('editor-fontSize', fontSize.toString());
        set({ fontSize });
    },
    runCode: async () => {},
  };
});

export default useCodeEditorStore;
