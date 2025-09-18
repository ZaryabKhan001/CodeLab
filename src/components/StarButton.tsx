import { useMutation, useQuery } from 'convex/react';
import { Star } from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import toast from 'react-hot-toast';

const StarButton = ({ snippetId }: { snippetId: Id<'snippet'> }) => {
  const starCount = useQuery(api.snippet.getSnippetStarCount, { snippetId });
  const isStarred = useQuery(api.snippet.isSnippetStarred, { snippetId });
  const starSnippet = useMutation(api.snippet.starSnippet);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleStar = async () => {
    setIsExecuting(true);
    try {
      const result = await starSnippet({ snippetId: snippetId });
      if (!result) {
        toast.error('Unable to React');
        return;
      }
      toast.success('reacted Successfully');
    } catch (error) {
      console.log('Unable to React', error);
      toast.error('Unable to React');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <button
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
    transition-all duration-200 ${
      isStarred
        ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
        : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
    }`}
      onClick={handleStar}
      disabled={isExecuting}
    >
      <Star
        className={`w-4 h-4 ${isStarred ? 'fill-yellow-500' : 'fill-none group-hover:fill-gray-400'}`}
      />
      <span
        className={`text-xs font-medium ${isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        {starCount}
      </span>
    </button>
  );
};

export default StarButton;
