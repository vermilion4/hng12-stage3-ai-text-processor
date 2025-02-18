import React, { useEffect, useRef } from 'react'

const MessageOutput = ({ messages, messageStates, setMessageStates, supportedLanguages }) => {
    const chatOutputRef = useRef(null);
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
          sourceLanguage,
          targetLanguage,
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
            translatedToLanguage: targetLanguage,
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
      // Close all other dropdowns first
      setMessageStates(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(id => {
          if (id !== messageId) {
            newState[id] = { ...newState[id], isOpen: false };
          }
        });
        newState[messageId] = {
          ...newState[messageId],
          isOpen: !newState[messageId].isOpen
        };
        return newState;
      });
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

    const handleSummary = async(messageId) => {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;

      if (!messageStates[messageId]?.isSupported) {
        setMessageStates(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            isSummarizing: false,
            summaryError: 'Summary is not available for unsupported languages.'
          }
        }));
        return;
      }

      // Reset any previous summarization errors
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isSummarizing: true,
          summaryError: null
        }
      }));

      try {
        const summarizer = await ai.summarizer.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });

        const result = await summarizer.summarize(message.text);
        console.log(result)
        setMessageStates(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            summary: result,
            isSummarizing: false,
            summaryError: null
          }
        }));
      } catch (error) {
        console.error('Summary error:', error);
        setMessageStates(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            isSummarizing: false,
            summaryError: 'An error occurred during summarization. Please try again.'
          }
        }));
      }
    }

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event) => {
        const dropdowns = document.querySelectorAll('.language-dropdown');
        dropdowns.forEach(dropdown => {
          if (!dropdown.contains(event.target) && !event.target.closest('.dropdown-toggle')) {
            setMessageStates(prev => {
              const newState = { ...prev };
              Object.keys(newState).forEach(id => {
                newState[id] = { ...newState[id], isOpen: false };
              });
              return newState;
            });
          }
        });
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setMessageStates]);

    // Scroll to bottom whenever messages change
    useEffect(() => {
      if (chatOutputRef.current) {
        chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
      }
    }, [messages, messageStates]);

  return (
    <div ref={chatOutputRef} className="flex-1 bg-gray-900/30 backdrop-blur-lg rounded-lg p-6 mb-6 overflow-y-auto border border-indigo-500/20 shadow-[0_0_50px_-12px] shadow-indigo-500/30 h-[500px]">
    <div className="space-y-6" id="chat-output">
      {messages.map((msg) => (
        <div key={msg.id} className="relative group">
          <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/10">
            <p className="text-gray-100 leading-relaxed">{msg.text}</p>
            <div className="mt-3 pt-3 border-t border-indigo-500/10 flex items-center gap-2 justify-between flex-wrap">
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
              <div className="flex items-center flex-wrap gap-2">
                <div className="relative flex items-center flex-wrap gap-2">
                  <button 
                    className="dropdown-toggle text-xs text-white font-medium bg-gradient-to-r from-cyan-500/70 to-blue-500/70 px-3 py-2 rounded-lg border border-blue-400/20 shadow-[0_0_15px_-3px] shadow-blue-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-blue-400/40 hover:from-cyan-400/70 hover:to-blue-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center gap-2"
                    onClick={() => toggleDropdown(msg.id)}
                  >
                    <span>Translate to: {supportedLanguages.find(lang => lang.value === messageStates[msg.id]?.selectedLanguage)?.label}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleTranslate(msg.id, messageStates[msg.id]?.detectedLanguage, messageStates[msg.id]?.selectedLanguage)}
                    className="text-xs text-white font-medium bg-gradient-to-r from-blue-500/70 to-indigo-500/70 px-3 py-2 rounded-lg border border-blue-400/20 shadow-[0_0_15px_-3px] shadow-blue-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-blue-400/40 hover:from-blue-400/70 hover:to-indigo-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out"
                  >
                    Translate
                  </button>
                  {messageStates[msg.id]?.isOpen && (
                    <div className="language-dropdown fixed z-50 mt-2 w-48 rounded-lg bg-gray-900/95 backdrop-blur-lg border border-blue-400/20 shadow-lg">
                      {supportedLanguages.map((option) => (
                        <button
                          key={option.value}
                          className={`block w-full px-4 py-2 text-left text-xs text-white hover:bg-blue-500/20 transition-colors duration-150 ${messageStates[msg.id]?.selectedLanguage === option.value ? 'bg-blue-500/30' : ''}`}
                          onClick={() => handleLanguageSelect(msg.id, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.text.length > 150 && <button 
                  onClick={() => handleSummary(msg.id)}
                  className="text-xs text-white font-medium bg-gradient-to-r from-indigo-500/70 to-purple-500/70 px-3 py-2 rounded-lg border border-indigo-400/20 shadow-[0_0_15px_-3px] shadow-indigo-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-indigo-400/40 hover:from-indigo-400/70 hover:to-purple-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out">
                  Summarize
                </button>}
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
              <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                <p className="text-white p-1 bg-blue-500/30 rounded-lg w-fit text-xs mb-4 border border-blue-400/20">{supportedLanguages.find(lang => lang.value === messageStates[msg.id]?.translatedToLanguage)?.label}</p>
                <p className="text-gray-300 text-sm">{messageStates[msg.id].translatedText}</p>
              </div>
            )}
            {messageStates[msg.id]?.isSummarizing ? (
              <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                <p className="text-gray-300 text-sm animate-pulse">
                  🌌 Distilling cosmic wisdom... Condensing the message essence! ✨
                </p>
              </div>
            ) : messageStates[msg.id]?.summaryError ? (
              <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                <p className="text-red-400 text-sm">{messageStates[msg.id].summaryError}</p>
              </div>
            ) : messageStates[msg.id]?.summary && (
              <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                <p className="text-white p-1 bg-purple-500/30 rounded-lg w-fit text-xs mb-4 border border-purple-400/20">Summary</p>
                <p className="text-gray-300 text-sm">{messageStates[msg.id].summary}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
  )
}

export default MessageOutput
