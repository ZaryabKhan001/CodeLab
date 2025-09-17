import React from 'react';
import CodeBlock from './CodeBlock';

const CommentContent = ({ content }: { content: string }) => {
  const parts = content.split(/(```[\w-]*\n[\s\S]*?\n```)/g);

  return (
    <div className='max-w-none text-white'>
      {parts?.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```([\w-]*)\n([\s\S]*?)\n```/);

          if (match) {
            const [, languge, code] = match;
            return <CodeBlock key={index} language={languge} code={code} />;
          }
        }

        return part.split('\n').map((line, lineIndex) => (
          <p className='mb-4 text-gray-300 last:mb-0' key={lineIndex}>
            {line}
          </p>
        ));
      })}
    </div>
  );
};

export default CommentContent;
