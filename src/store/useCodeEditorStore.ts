import { create } from 'zustand';
import { CodeEditorState } from '../types/index';
import * as monaco from 'monaco-editor';
import { LANGUAGE_CONFIG } from '@/app/(root)/_constants';

const getInitialState = () => {
  if (typeof window === 'undefined') {
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
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }
      localStorage.setItem('editor-language', language);
      set({ language, output: '', error: null });
    },
    setTheme: (theme: string) => {
      localStorage.setItem('editor-theme', theme);
      set({ theme });
    },
    setFontSize: (fontSize) => {
      localStorage.setItem('editor-font-size', fontSize.toString());
      set({ fontSize });
    },
    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: 'Enter some Code' });
        return;
      }
      set({ isRunning: true, error: null, output: '' });
      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [
              {
                content: code,
              },
            ],
          }),
        });
        const data = await response.json();

        // Api Level Error
        if (data.message) {
          set({
            error: data.message,
            executionResult: { code: code, output: '', error: data.message },
          });
          return;
        }

        // Runtime Error of Interpreter Languages
        if (data.run && data.run.code !== 0) {
          const error = data.run.stdout || data.run.output;
          set({
            error: error,
            executionResult: { code: code, output: '', error: error },
          });
          return;
        }

        // Runtime Error of Compilation Languages
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stdout || data.compile.output;
          set({
            error: error,
            executionResult: { code: code, output: '', error: error },
          });
          return;
        }

        // Successfull Code Execution
        const output = data.run.output;
        set({
          output: output.trim(),
          error: null,
          executionResult: { code: code, output: output.trim(), error: null },
        });
        return;
      } catch (error) {
        console.log('Error in code execution');
        const errorMessage =
          error instanceof Error ? error.message : 'Error in Code Execution';
        set({
          error: errorMessage,
          output: '',
          executionResult: { code: code, output: '', error: errorMessage },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export default useCodeEditorStore;
