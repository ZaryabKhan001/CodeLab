'use client';
import React, { useState } from 'react';
import { Id } from '../../../../../convex/_generated/dataModel';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import Comment from './Comment';
import CommentForm from './CommentForm';

const Comments = ({ snippetId }: { snippetId: Id<'snippet'> }) => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  const comments = useQuery(api.public.snippet.getSnippetComments, { snippetId });
  const addComment = useMutation(api.public.snippet.addComment);
  const deleteComment = useMutation(api.public.snippet.deleteComment);

  const handleSubmitComment = async (content: string) => {
    try {
      setIsSubmitting(true);
      await addComment({
        snippetId: snippetId,
        content: content,
      });
    } catch (error) {
      console.log('Unable to add comment', error);
      toast.error('Unable to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<'snippetComment'>) => {
    try {
      setDeletingCommentId(commentId);
      await deleteComment({
        commentId: commentId,
      });
    } catch (error) {
      console.log('Unable to delete comment', error);
      toast.error('Unable to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className='bg-[#121218] border border-[#ffffff0a] rounded-2xl overflow-hidden'>
      <div className='px-6 sm:px-8 py-6 border-b border-[#ffffff0a]'>
        <h2 className='text-lg font-semibold text-white flex items-center gap-2'>
          <MessageSquare className='w-5 h-5' />
          Discussion ({comments?.length})
        </h2>
      </div>

      <div className='p-6 sm:p-8'>
        {user ? (
          <CommentForm
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className='bg-[#0a0a0f] rounded-xl p-6 text-center mb-8 border border-[#ffffff0a]'>
            <p className='text-[#808086] mb-4'>
              Sign in to join the discussion
            </p>
            <SignInButton mode='modal'>
              <button className='px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors'>
                Sign In
              </button>
            </SignInButton>
          </div>
        )}

        <div className='space-y-6'>
          {comments?.length === 0 ? (
            <h2 className='pt-5 font-bold text-lg'>No Comments Yet</h2>
          ) : (
            comments?.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                onDelete={handleDeleteComment}
                isDeleting={deletingCommentId === comment._id}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
