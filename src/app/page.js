"use client";
import { useState } from "react";
import Image from "next/image";
import MessageOutput from "./components/MessageOutput";
import MessageTextArea from "./components/MessageTextArea";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [messageStates, setMessageStates] = useState({});
  const [inputError, setInputError] = useState('');

  const supportedLanguages = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
    { value: 'ru', label: 'Russian' },
    { value: 'tr', label: 'Turkish' },
    { value: 'fr', label: 'French' }
  ];

  console.log(messages)

  return (
    <div className="grid grid-rows-[10px_1fr_10px] items-center justify-items-center min-h-screen p-3 gap-8 sm:p-10 font-[family-name:var(--font-geist-sans)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black">
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
            <p className=" text-red-400 text-sm mt-2">{inputError}</p>
          )}
      </main>

      {/* Footer Section */}
      <footer className="row-start-3 flex gap-6 mt-2 flex-wrap items-center justify-center text-indigo-200/70">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-indigo-200"
          href="https://github.com/vermilion4/ai-text-processor"
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB
        </a>
      </footer>
    </div>
  );
}
