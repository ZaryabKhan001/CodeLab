'use client';
import useCodeEditorStore from '@/store/useCodeEditorStore';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RotateCcwIcon, ShareIcon, TypeIcon } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { LANGUAGE_CONFIG, defineMonacoThemes } from '../_constants/index';
import { useClerk } from '@clerk/nextjs';
import { EditorPanelSkeleton } from './EditorPanelSkeleton';
import { useMounted } from '@/hooks/useMounted';
import ShareSnippetDialog from './ShareSnippetDialog';

const EditorPanel = () => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { editor, language, fontSize, setFontSize, theme, setEditor } =
    useCodeEditorStore();
  const clerk = useClerk();
  const mounted = useMounted();

  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
  };

  const handleEditorChange = () => {};

  const handleRefresh = () => {
    editor?.setValue('');
  };

  if (!mounted) return null;

  return (
    <div className='relative'>
      <div className='relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6'>
        <div className='flex items-center justify-between mb-4 flex-wrap gap-5'>
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5'>
              <Image
                src={'/' + language + '.png'}
                alt='Logo'
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className='text-sm font-medium text-white'>Code Editor</h2>
              <p className='text-xs text-gray-500'>
                Write and execute your code
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5'>
              <TypeIcon className='size-4 text-gray-400' />
              <div className='flex items-center gap-3'>
                <input
                  type='range'
                  min='12'
                  max='24'
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className='w-20 h-1 bg-gray-600 rounded-lg cursor-pointer'
                />
                <span className='text-sm font-medium text-gray-400 min-w-[2rem] text-center'>
                  {fontSize}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className='p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors'
              aria-label='Reset to default code'
            >
              <RotateCcwIcon className='size-4 text-gray-400' />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity'
            >
              <ShareIcon className='size-4 text-white' />
              <span className='text-sm font-medium text-white '>Share</span>
            </motion.button>
          </div>
        </div>
        <div className='relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]'>
          {clerk.loaded && (
            <Editor
              height='600px'
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              defaultLanguage={LANGUAGE_CONFIG['javascript'].monacoLanguage}
              defaultValue={LANGUAGE_CONFIG['javascript'].defaultCode}
              theme={theme}
              onChange={handleEditorChange}
              options={{
                tabSize: 4,
                lineHeight: 1.6,
                contextmenu: true,
                fontSize: fontSize,
                letterSpacing: 0.5,
                formatOnPaste: true,
                fontLigatures: true,
                smoothScrolling: true,
                automaticLayout: true,
                roundedSelection: true,
                cursorBlinking: 'smooth',
                trimAutoWhitespace: true,
                selectionHighlight: true,
                selectionClipboard: true,
                renderLineHighlight: 'all',
                minimap: { enabled: false },
                padding: { top: 16, bottom: 16 },
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          )}
          {!clerk.loaded && <EditorPanelSkeleton />}
        </div>
      </div>
      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
    </div>
  );
};

export default EditorPanel;
