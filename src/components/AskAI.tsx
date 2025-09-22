'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Loader, MessageSquare, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Message } from '@/types';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import toast from 'react-hot-toast';
import useCodeEditorStore from '@/store/useCodeEditorStore';
import MessageSkeleton from './MessageSkeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function AskAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const { user } = useUser();
  const {
    askAI,
    isAskingAI: isSubmitting,
    setIsAskingAI: setIsSubmitting,
  } = useCodeEditorStore();
  const messageBottomRef = useRef<HTMLDivElement>(null);

  const {
    isLoading,
    loadMore,
    status,
    results: messages,
  } = usePaginatedQuery(
    api.public.messages.getMessages,
    user ? { userId: user?.id } : 'skip',
    { initialNumItems: 10 }
  );
  const createMessage = useMutation(api.public.messages.createMessage);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const userMessageAdded = await createMessage({
        userId: user?.id as string,
        content: input,
        role: 'user',
      });
      if (!userMessageAdded) {
        throw new Error('Error in user message adding into DB');
      }
      const reply = await askAI(input.trim());
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
      setInput('');
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (status === 'CanLoadMore') {
      loadMore(10);
    }
  };

  useEffect(() => {
    if (!messageBottomRef.current) return;
    if (messages.length === 0) return;

    messageBottomRef.current?.scrollIntoView({
      behavior: messages.length === 1 ? 'auto' : 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }, [messages, open]);

  useEffect(() => {
    setOpen(true);
  }, [messages]);

  return user ? (
    <>
      {' '}
      <div className='absolute bottom-0 right-0 lg:bottom-16 lg:right-4 m-4 transition-all duration-200' style={{zIndex: 999}}>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className='bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex justify-center items-center gap-3'
          >
            <MessageSquare />
            Ask AI
          </button>
        )}

        {open && (
          <div className='h-[500px] w-[350px] sm:w-[500px] lg:w-[900px] z-999 flex flex-col shadow-lg rounded-md bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] '>
            <div className='inset-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-t-md flex justify-between items-center'>
              <div>
                Welcome,{' '}
                <span className='font-semibold'>
                  {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                </span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto p-3 space-y-2'>
              {isLoading ? (
                <MessageSkeleton count={8} />
              ) : messages.length === 0 ? (
                <div className='text-gray-500 text-sm flex flex-col justify-center items-center gap-2 w-full h-full'>
                  <MessageSquare className='size-12' />
                  Start a Conversation
                </div>
              ) : (
                messages.map((msg: Message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-4 mt-4`}
                  >
                    <div className='bg-[#0a0a0f]/80 p-3 rounded-md w-fit flex justify-start items-start gap-2 max-w-full overflow-x-auto'>
                      <div className='prose prose-invert max-w-none text-sm'>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messageBottomRef}></div>
            </div>

            <form
              onSubmit={handleSubmit}
              className='p-3 border-t border-t-gray-800 flex items-center gap-2'
            >
              <input
                type='text'
                value={input}
                disabled={isSubmitting}
                onChange={(e) => setInput(e.target.value)}
                className='flex-1 border-none outline-none rounded-md px-2 py-2 text-sm bg-transparent'
                placeholder='Write your doubt here.'
              />
              <button
                type='submit'
                className='inset-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md min-w-[4rem] w-[4rem] min-h-[2.5rem] h-[2.5em] text-sm flex justify-center items-center transition-all duration-200'
              >
                {isSubmitting ? (
                  <Loader className='animate-spin transition-all' />
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  ) : (
    <></>
  );
}
