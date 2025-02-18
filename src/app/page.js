"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import MessageOutput from "./components/MessageOutput";
import MessageTextArea from "./components/MessageTextArea";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const mainRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    // Get messages from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [messageStates, setMessageStates] = useState(() => {
    // Get messageStates from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messageStates');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('messageStates', JSON.stringify(messageStates));
  }, [messageStates]);

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom after loading completes
  useEffect(() => {
    if (!isLoading && mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isLoading]);

  const [inputError, setInputError] = useState('');

  const supportedLanguages = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
    { value: 'ru', label: 'Russian' },
    { value: 'tr', label: 'Turkish' },
    { value: 'fr', label: 'French' }
  ];
  
  const starColor = '#8B5CF6';

  const stars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
    }));
  }, []);

  const Star = ({ style }) => (
    <svg
      height="20"
      width="20"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-9.59 -9.59 67.12 67.12"
      fill="#000000"
      stroke="#000000"
      strokeWidth="0.91086"
      style={style}
      className="animate-pulse"
    >
      <g id="SVGRepo_iconCarrier">
        <path
          style={{fill: starColor}}
          d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757 c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042 c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685 c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528 c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956 C22.602,0.567,25.338,0.567,26.285,2.486z"
        ></path>
      </g>
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div ref={mainRef} className="grid grid-rows-[10px_1fr_10px] items-center justify-items-center min-h-screen p-3 gap-8 sm:p-10 font-[family-name:var(--font-geist-sans)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black pb-6 relative">
      {stars.map(star => (
        <div key={star.id} className="absolute" style={{ top: star.top, left: star.left}}>
          <Star style={{ transform: `rotate(${Math.random() * 360}deg)` }} />
        </div>
      ))}
      
      <main className="flex flex-col w-full max-w-4xl row-start-2 h-full">
        <h1 className="text-4xl md:text-6xl mb-6 text-center bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text font-roadrage">Cosmic AI Text Processor</h1>
        
        {/* Supported Languages Section */}
        <div className="mb-6 p-4 rounded-lg bg-gray-900/30 backdrop-blur-lg border border-indigo-500/20">
          <h2 className="text-sm font-medium text-indigo-300 mb-3">Supported Languages:</h2>
          <div className="flex flex-wrap gap-2">
            {supportedLanguages.map((lang) => (
              <span key={lang.value} className="px-3 py-1 text-xs text-white bg-indigo-500/20 rounded-full border border-indigo-400/20">
                {lang.label}
              </span>
            ))}
          </div>
        </div>

        {/* Messages Output Section */}
        <MessageOutput messages={messages} messageStates={messageStates} setMessageStates={setMessageStates} supportedLanguages={supportedLanguages} />

        {/* Text Area Section */}
        <MessageTextArea setMessages={setMessages} setMessageStates={setMessageStates} supportedLanguages={supportedLanguages} inputError={inputError} setInputError={setInputError} />

        {/* Input Error Display Section */}
        {inputError && (
            <p className="text-red-400 text-sm mt-2">{inputError}</p>
          )}
      </main>

      {/* Footer Section */}
      <footer className="row-start-3 flex gap-6 mt-2 flex-wrap items-center justify-center text-indigo-200/70">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-indigo-200"
          href="https://github.com/vermilion4/hng12-stage3-ai-text-processor"
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB
        </a>
      </footer>
    </div>
  );
}