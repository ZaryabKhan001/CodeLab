import { create } from 'zustand';
import { CodeEditorState } from '../types/index';
import * as monaco from 'monaco-editor';
import { LANGUAGE_CONFIG } from '@/app/(root)/_constants';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();
  return {
    ...initialState,
    output: '',
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    isAskingAI: false,
    isChatOpen: false,
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

    askAI: async (input: string): Promise<string> => {
      const { error, output, language, getCode } = get();
      const code = getCode();

      const systemPrompt: ChatCompletionMessageParam = {
        role: 'system',
        content: `You are a professional coding assistant integrated into a code editor. 
Your job is to:
1. When given {code}, {language}, and {error} → analyze the code, explain the error in simple terms, and suggest possible fixes or improvements with clear reasoning and examples.
2. When given {code}, {language}, and {output} → explain what the code is doing, how it works, and why it produced that output. Provide insights into best practices or optimizations if relevant.
3. When given a general user question (without code) → answer it as a helpful and knowledgeable software engineering assistant. Keep answers concise, accurate, and beginner-friendly, but include advanced insights when useful.
Always:
- Be professional and clear.
- Avoid unnecessary jargon.
- Provide step-by-step reasoning when explaining errors or outputs.
- Use examples where possible.
- Keep explanations adaptable for both beginners and intermediate developers.`,
      };

      const userInput: ChatCompletionMessageParam =
        input !== 'explain'
          ? {
              role: 'user',
              content: input,
            }
          : {
              role: 'user',
              content: JSON.stringify({
                type: error ? 'error_analysis' : 'output_explanation',
                language,
                code,
                error,
                output,
              }),
            };

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [systemPrompt, userInput],
      });

      const reply = completion.choices[0]?.message?.content ?? '';
      console.log(reply);
      return reply;
    },

    setIsAskingAI: (value: boolean) => set({isAskingAI: value}),

    setIsChatOpen: (value: boolean) => set({isChatOpen: value})
  };
});

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;

export default useCodeEditorStore;
