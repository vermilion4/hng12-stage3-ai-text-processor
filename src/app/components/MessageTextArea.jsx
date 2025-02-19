'use client'

import React, { useState, useCallback } from 'react'

const MessageTextArea = ({ setMessages, setMessageStates, supportedLanguages, inputError, setInputError }) => {
  const [text, setText] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDetect = async(messageId, messageText) => {
    // Check if browser supports language detection API
    if (!('ai' in self && 'languageDetector' in self.ai)) {
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          detectedLanguage: '',
          detectedLanguageLabel: '',
          isDetecting: false,
          isSupported: false,
          detectionError: "Your browser doesn't support the Language Detection API. Please update or switch to a compatible browser like Chrome Canary."
        }
      }));
      return;
    }

    try {
      // Check language detector capabilities
      const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.available;

      if (canDetect === 'no') {
        setMessageStates(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            detectedLanguage: '',
            detectedLanguageLabel: '',
            isDetecting: false,
            isSupported: false,
            detectionError: "Language detection is not available at the moment. Please try again later."
          }
        }));
        return;
      }

      let detector;
      if (canDetect === 'readily') {
        detector = await self.ai.languageDetector.create();
      } else {
        // Need to download model first
        setDownloadProgress(0);
        detector = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              setDownloadProgress(progress);
            });
          },
        });
        await detector.ready;
      }

      const result = await detector.detect(messageText);
      
      const detectedCode = result[0].detectedLanguage;
      
      // Check if detected language is available
      const languageAvailability = await languageDetectorCapabilities.languageAvailable(detectedCode);
      if (languageAvailability !== 'readily') {
        setMessageStates(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            detectedLanguage: detectedCode,
            detectedLanguageLabel: `Unsupported language (${detectedCode})`,
            isDetecting: false,
            isSupported: false,
            detectionError: 'This language is not supported for detection.'
          }
        }));
        return;
      }

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
    
    await handleDetect(messageId, text);
    
    setText('');
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [text]);

  return (
    <div className="relative flex flex-col gap-3">
          <textarea 
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInputError(''); // Clear error when user starts typing
            }}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-2 pr-7 sm:pr-16 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border-2 ${
              inputError ? 'border-red-500/50' : 'border-indigo-500/30 hover:border-indigo-400/50 focus:border-indigo-500/50'
            } focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none text-gray-200 shadow-lg transition-all duration-200 text-sm sm:text-base`}
            placeholder="Type your message in your language of choice..."
            rows={5}
            style={{
              boxShadow: inputError ? "0 0 30px rgba(239, 68, 68, 0.15)" : "0 0 30px rgba(99, 102, 241, 0.15)"
            }}
            aria-label="Message input"
            aria-invalid={!!inputError}
            aria-errormessage={inputError ? "input-error" : undefined}
            aria-describedby="message-hint"
          />
          {/* Hidden hint text for screen readers */}
          <span id="message-hint" className="sr-only">
            Press Enter to send. Use Shift + Enter for new line. Message must be at least 20 characters.
          </span>
          {downloadProgress > 0 && downloadProgress < 100 && (
            <div className="fixed top-5 right-4 bg-indigo-900/90 text-white text-sm px-3 py-1 rounded-lg backdrop-blur-sm">
              Downloading model: {downloadProgress}%
            </div>
          )}
          <button
            onClick={handleSend}
            className="absolute bottom-4 right-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2 group border border-indigo-500/30 hover:border-indigo-400/50 focus:border-indigo-500/50"
            aria-label="Send message"
          >
            <svg 
              className="w-5 h-5 transition-transform duration-300 ease-in-out group-hover:rotate-[360deg]"
              viewBox="0 0 512 512" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
            >
              <path 
                d="M1.398 431.634l21.593-89.001c3.063-12.622 11.283-23.562 22.554-30.015l83.684-47.915c6.723-3.849 6.738-13.546 0-17.403l-83.685-47.915c-11.271-6.453-19.491-17.392-22.554-30.014L1.398 80.368C-7.908 42.012 30.961 9.702 66.967 25.834l416.96 186.83c37.455 16.782 37.407 69.913.001 86.675L66.967 486.168C30.933 502.312-7.892 469.921 1.398 431.634z"
                fill="#E2E8F0"
              />
              <path 
                d="M483.927 212.665L256.011 110.541v290.923L483.929 299.34c37.405-16.762 37.454-69.894-.002-86.675z"
                fill="#CBD5E1"
              />
              <path 
                d="M186.997 329.76c-4.231-9.44-.006-20.523 9.434-24.752l109.37-49.006-109.37-49.006c-9.44-4.229-13.665-15.312-9.434-24.752 4.229-9.44 15.309-13.666 24.752-9.434l147.519 66.1c14.727 6.598 14.739 27.583 0 34.186l-147.519 66.1c-9.443 4.227-20.525.005-24.752-9.436z"
                fill="#F1F5F9"
              />
              <path 
                d="M359.268 238.908L256.01 192.64v41.05l49.791 22.311-49.791 22.311v41.05l103.258-46.268c14.738-6.603 14.727-27.587 0-34.186z"
                fill="#F8FAFC"
              />
            </svg>
          </button>
    </div>
  )
}

export default MessageTextArea
