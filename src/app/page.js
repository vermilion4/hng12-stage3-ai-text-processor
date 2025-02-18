"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [text, setText] = useState('');
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

  const handleDetect = async(messageId, messageText) => {
    try {
      const detector = await self.ai.languageDetector.create({
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });

      const result = await detector.detect(messageText);
      console.log(result);
      
      const detectedCode = result[0].detectedLanguage;
      const supportedLanguage = supportedLanguages.find(lang => lang.value === detectedCode);
      
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          detectedLanguage: detectedCode,
          detectedLanguageLabel: supportedLanguage ? supportedLanguage.label : `Unsupported language (${detectedCode})`,
          isDetecting: false,
          isSupported: !!supportedLanguage,
          detectionError: supportedLanguage ? null : 'This language is not supported for translation.'
        }
      }));
    } catch (error) {
      console.error('Language detection error:', error);
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          detectedLanguage: '',
          detectedLanguageLabel: '',
          isDetecting: false,
          isSupported: false,
          detectionError: 'Failed to detect language. Please try again.'
        }
      }));
    }
  }

  const handleSend = async () => {
    // Clear any previous errors
    setInputError('');

    // Validate input
    if (!text) {
      setInputError('Please enter some text.');
      return;
    }

    if (text.trim().length < 20) {
      setInputError('Message must be at least 20 characters long.');
      return;
    }

    const messageId = Date.now().toString();
    
    // Initialize message state first
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        isOpen: false,
        selectedLanguage: 'en',
        translatedText: '',
        detectedLanguage: '',
        detectedLanguageLabel: '',
        isSupported: false,
        summary: '',
        isTranslating: false,
        isDetecting: true,
        detectionError: null,
        translationError: null,
        summaryError: null
      }
    }));

    // Add message to messages array
    setMessages(prev => [...prev, { id: messageId, text: text }]);
    
    // Start language detection immediately with the text
    await handleDetect(messageId, text);
    
    // Clear input
    setText('');
  }

  const handleTranslate = async(messageId, sourceLanguage, targetLanguage) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    if (!messageStates[messageId]?.isSupported) {
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError: 'Translation is not available for unsupported languages.'
        }
      }));
      return;
    }

    // Reset any previous translation errors
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isTranslating: true,
        translationError: null
      }
    }));

    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });

      const result = await translator.translate(message.text);
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          translatedText: result,
          isOpen: false,
          isTranslating: false,
          translationError: null
        }
      }));
    } catch (error) {
      console.error('Translation error:', error);
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError: 'An error occurred during translation. Please try again.'
        }
      }));
    }
  }

  const toggleDropdown = (messageId) => {
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isOpen: !prev[messageId].isOpen
      }
    }));
  }

  const handleLanguageSelect = (messageId, language) => {
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        selectedLanguage: language,
        isOpen: false
      }
    }));
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black">
      <main className="flex flex-col w-full max-w-4xl row-start-2 h-full">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text">Cosmic AI Text Processor</h1>
        
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

        <div className="flex-1 bg-gray-900/30 backdrop-blur-lg rounded-lg p-6 mb-6 overflow-y-auto border border-indigo-500/20 shadow-[0_0_50px_-12px] shadow-indigo-500/30">
          <div className="space-y-6" id="chat-output">
            {messages.map((msg) => (
              <div key={msg.id} className="relative group">
                <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/10">
                  <p className="text-gray-100 leading-relaxed">{msg.text}</p>
                  <div className="mt-3 pt-3 border-t border-indigo-500/10 flex items-center gap-2 justify-between">
                  {messageStates[msg.id]?.isDetecting ? (
                    <span className="text-xs text-indigo-300/70 font-medium">
                      Detecting language...
                    </span>
                  ) : messageStates[msg.id]?.detectionError ? (
                    <span className="text-xs text-red-400 font-medium">
                      {messageStates[msg.id].detectionError}
                    </span>
                  ) : messageStates[msg.id]?.detectedLanguageLabel && (
                    <span className="text-xs text-indigo-300/70 font-medium">
                      Detected language: {messageStates[msg.id]?.detectedLanguageLabel}
                    </span>
                  )}
                    <div className="flex items-center gap-2">
                      <div className="relative inline-block">
                        <button 
                          className="text-xs text-white font-medium bg-gradient-to-r from-cyan-500/70 to-blue-500/70 px-3 py-2 rounded-lg border border-blue-400/20 shadow-[0_0_15px_-3px] shadow-blue-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-blue-400/40 hover:from-cyan-400/70 hover:to-blue-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center gap-2"
                          onClick={() => toggleDropdown(msg.id)}
                        >
                          <span>Translate to {supportedLanguages.find(lang => lang.value === messageStates[msg.id]?.selectedLanguage)?.label}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {messageStates[msg.id]?.isOpen && (
                          <div className="absolute z-10 mt-2 w-48 rounded-lg bg-gray-900/95 backdrop-blur-lg border border-blue-400/20 shadow-lg">
                            {supportedLanguages.map((option) => (
                              <button
                                key={option.value}
                                className={`block w-full px-4 py-2 text-left text-xs text-white hover:bg-blue-500/20 transition-colors duration-150 ${messageStates[msg.id]?.selectedLanguage === option.value ? 'bg-blue-500/30' : ''}`}
                                onClick={() => {
                                  handleLanguageSelect(msg.id, option.value)
                                  handleTranslate(msg.id, messageStates[msg.id]?.detectedLanguage, option.value)
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="text-xs text-white font-medium bg-gradient-to-r from-indigo-500/70 to-purple-500/70 px-3 py-2 rounded-lg border border-indigo-400/20 shadow-[0_0_15px_-3px] shadow-indigo-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-indigo-400/40 hover:from-indigo-400/70 hover:to-purple-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out">
                        Summarize
                      </button>
                    </div>
                  </div>
                  {messageStates[msg.id]?.isTranslating ? (
                    <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                      <p className="text-gray-300 text-sm animate-pulse">
                        🌟 Cosmic translation in progress... Traversing the linguistic nebulae! 🚀
                      </p>
                    </div>
                  ) : messageStates[msg.id]?.translationError ? (
                    <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                      <p className="text-red-400 text-sm">{messageStates[msg.id].translationError}</p>
                    </div>
                  ) : messageStates[msg.id]?.translatedText && (
                    <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                      <p className="text-gray-300 text-sm">{messageStates[msg.id].translatedText}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col gap-3">
          <textarea 
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInputError(''); // Clear error when user starts typing
            }}
            className={`w-full p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border-2 ${
              inputError ? 'border-red-500/50' : 'border-indigo-500/30 hover:border-indigo-400/50 focus:border-indigo-500/50'
            } focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none text-gray-200 shadow-lg transition-all duration-200`}
            placeholder="Type your message in your language of choice..."
            rows={3}
            style={{
              boxShadow: inputError ? "0 0 30px rgba(239, 68, 68, 0.15)" : "0 0 30px rgba(99, 102, 241, 0.15)"
            }}
          />
          <button
            onClick={handleSend}
            className="absolute bottom-4 right-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2 group"
          >
            <span>Send</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        {inputError && (
            <p className=" text-red-400 text-sm mt-2">{inputError}</p>
          )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-indigo-200/70">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-indigo-200"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-indigo-200"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-indigo-200"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
