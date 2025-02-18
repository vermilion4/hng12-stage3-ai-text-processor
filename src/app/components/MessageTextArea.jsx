import React, { useState } from 'react'

const MessageTextArea = ({ setMessages, setMessageStates, supportedLanguages, inputError, setInputError }) => {
  const [text, setText] = useState('');
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
    
    await handleDetect(messageId, text);
    
    setText('');
  }

  return (
    <div className="relative flex flex-col gap-3">
          <textarea 
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInputError(''); // Clear error when user starts typing
            }}
            className={`w-full p-6 pr-16 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border-2 ${
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
  )
}

export default MessageTextArea
