'use client';
import React, { useState } from 'react';
import useCodeEditorStore from '@/store/useCodeEditorStore';
import RunningCodeSkeleton from './RunningCodeSkeleton';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Star,
  Terminal,
} from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

const OutputPanel = () => {
  const [isCopied, setIsCopied] = useState(false);
  const { error, isRunning, output, askAI, isAskingAI, setIsAskingAI } =
    useCodeEditorStore();
  const hasContent = error || output;
  const mounted = useMounted();
  const { user } = useUser();

  const createMessage = useMutation(api.public.messages.createMessage);

  if (!mounted) return null;

  const handleCopy = async () => {
    if (!hasContent) return;
    await navigator.clipboard.writeText(error || output);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleExplain = async () => {
    try {
      setIsAskingAI(true);
      const userMessageAdded = await createMessage({
        userId: user?.id as string,
        content: 'Explain',
        role: 'user',
      });
      if (!userMessageAdded) {
        throw new Error('Error in user message adding into DB');
      }
      const reply = await askAI('explain');
      if (!reply) {
        throw new Error('Error in getting reply from AI');
      }

      const AIReplyAdded = await createMessage({
        userId: user?.id as string,
        content: reply,
        role: 'assistant',
      });

      if (!AIReplyAdded) {
        throw new Error('Error in AI reply message adding into DB');
      }
    } catch (error) {
      console.log('Error in asking AI', error);
      toast.error('Error in asking AI');
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className='relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50'>
            <Terminal className='w-4 h-4 text-blue-400' />
          </div>
          <span className='text-sm font-medium text-gray-300'>Output</span>
        </div>
        {hasContent && (
          <div className='flex justify-center items-center gap-4'>
            {user && (
              <button
                className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1e1e2e] 
            rounded-lg ring-1 ring-gray-800/50 hover:ring-gray-700/50 transition-all'
                onClick={handleExplain}
                disabled={isAskingAI}
              >
                <Star className='w-3.5 h-3.5' /> Explain
              </button>
            )}
            <button
              className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1e1e2e] 
            rounded-lg ring-1 ring-gray-800/50 hover:ring-gray-700/50 transition-all'
              onClick={handleCopy}
            >
              {isCopied ? (
                <>
                  <CheckCircle className='w-3.5 h-3.5' />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className='w-3.5 h-3.5' />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className='relative'>
        <div
          className='relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm'
        >
          {isRunning ? (
            <RunningCodeSkeleton />
          ) : error ? (
            <div className='flex items-start gap-3 text-red-400'>
              <AlertTriangle className='w-5 h-5 flex-shrink-0 mt-1' />
              <div className='space-y-1'>
                <div className='font-medium'>Execution Error</div>
                <pre className='whitespace-pre-wrap text-red-400/80'>
                  {error}
                </pre>
              </div>
            </div>
          ) : output ? (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-emerald-400 mb-3'>
                <CheckCircle className='w-5 h-5' />
                <span className='font-medium'>Execution Successful</span>
              </div>
              <pre className='whitespace-pre-wrap text-gray-300'>{output}</pre>
            </div>
          ) : (
            <div className='h-full flex flex-col items-center justify-center text-gray-500'>
              <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4'>
                <Clock className='w-6 h-6' />
              </div>
              <p className='text-center'>
                Run your code to see the output here...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
