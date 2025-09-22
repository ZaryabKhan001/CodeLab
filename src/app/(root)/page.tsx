import Header from './_components/Header';
import EditorPanel from './_components/EditorPanel';
import OutputPanel from './_components/OutputPanel';
import AskAI from '@/components/AskAI';

export default function Home() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-[1800px] mx-auto p-4 lg:relative'>
        <Header />
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <EditorPanel />
          <OutputPanel />
        </div>
        <AskAI />
      </div>
    </div>
  );
}
