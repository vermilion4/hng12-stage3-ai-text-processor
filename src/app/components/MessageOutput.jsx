"use client";

import React, { useEffect, useRef, useState } from "react";
import MessageActions from "./MessageActions";
import Markdown from "react-markdown";
import SummaryOptionsModal from "./SummaryOptionsModal";

const MessageOutput = ({
  messages,
  messageStates,
  setMessageStates,
  supportedLanguages,
  isCompactLayout,
}) => {
  const chatOutputRef = useRef(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll(".language-dropdown");
      dropdowns.forEach((dropdown) => {
        if (
          !dropdown.contains(event.target) &&
          !event.target.closest(".dropdown-toggle")
        ) {
          setMessageStates((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((id) => {
              newState[id] = { ...newState[id], isOpen: false };
            });
            return newState;
          });
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setMessageStates]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages, isCompactLayout]);

  return (
    <>
      {showSummaryModal && (
       <SummaryOptionsModal
        messages={messages}
        selectedMessageId={selectedMessageId}
        setMessageStates={setMessageStates}
        setShowSummaryModal={setShowSummaryModal}
        messageStates={messageStates}
       />
      )}

      <div
        ref={chatOutputRef}
        className={`${
          isCompactLayout
            ? 'h-full'
            : 'bg-gray-900/30 backdrop-blur-lg rounded-lg p-6 mb-6 border border-indigo-500/20 shadow-[0_0_50px_-12px] shadow-indigo-500/30 max-h-[500px]'
        } overflow-y-auto`}
        aria-label="Message history"
        role="log"
      >
        <div className="space-y-6" id="chat-output" aria-live="polite">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <article 
                key={msg.id} 
                className="relative group"
                aria-label={`Message ${msg.id}`}
              >
                <div className={`${
                  isCompactLayout
                    ? 'p-4 border-b border-indigo-500/20'
                    : 'p-6 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/10'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    {
                      isCompactLayout && 
                      <p className="text-gray-100 leading-relaxed bg-indigo-500/40 rounded-lg w-fit p-1 flex items-center justify-center text-xs border border-indigo-400/20" role="textbox" aria-label="Message number">
                        Text {index + 1}
                      </p>
                    }

                    {/* add date and time */}
                    <p className="text-gray-400 text-xs">
                      {new Date(msg.timestamp || Date.now()).toLocaleString()}
                    </p>
                  </div>
                  {/* Message Text Section */}
                  <p className="text-gray-100 leading-relaxed" role="textbox" aria-label="Message content">
                    {msg.text}
                  </p>

                  {/* Message Actions Section */}
                  <MessageActions
                    messages={messages}
                    messageStates={messageStates}
                    setMessageStates={setMessageStates}
                    supportedLanguages={supportedLanguages}
                    msg={msg}
                    setSelectedMessageId={setSelectedMessageId}
                    setShowSummaryModal={setShowSummaryModal}
                  />

                  {/* Translation Section */}
                  {messageStates[msg.id]?.isTranslating ? (
                    <div 
                      className={`mt-4 p-4 ${isCompactLayout ? 'bg-gray-800/30' : 'bg-gray-800/50'} rounded-lg border border-indigo-500/20`}
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-gray-300 text-sm animate-pulse">
                        🌟 Cosmic translation in progress... Traversing the
                        linguistic nebulae! 🚀
                      </p>
                    </div>
                  ) : messageStates[msg.id]?.translationError ? (
                    <div 
                      className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/20"
                      role="alert"
                      aria-atomic="true"
                    >
                      <p className="text-red-400 text-sm">
                        {messageStates[msg.id].translationError}
                      </p>
                    </div>
                  ) : (
                    messageStates[msg.id]?.translatedText && (
                      <div 
                        className={`mt-4 p-3 rounded-lg ${isCompactLayout ? 'bg-gray-800/30' : 'bg-gray-800/50'} border border-indigo-500/20`}
                        role="region"
                        aria-label="Translation result"
                      >
                        <p 
                          className="text-white p-1 bg-blue-500/30 rounded-lg w-fit text-xs mb-4 border border-blue-400/20"
                          aria-label="Translated to"
                        >
                          {
                            supportedLanguages.find(
                              (lang) =>
                                lang.value ===
                                messageStates[msg.id]?.translatedToLanguage,
                            )?.label
                          }
                        </p>
                        <p className="text-gray-300 text-sm">
                          {messageStates[msg.id].translatedText}
                        </p>
                      </div>
                    )
                  )}

                  {/* Summary Section */}
                  {messageStates[msg.id]?.isSummarizing ? (
                    <div 
                      className={`mt-4 p-4 rounded-lg ${isCompactLayout ? 'bg-gray-800/30' : 'bg-gray-800/50'} border border-indigo-500/20`}
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-gray-300 text-sm animate-pulse">
                        🌌 Distilling cosmic wisdom... Condensing the message
                        essence! ✨
                      </p>
                    </div>
                  ) : messageStates[msg.id]?.summaryError ? (
                    <div 
                      className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/20"
                      role="alert"
                      aria-atomic="true"
                    >
                      <p className="text-red-400 text-sm">
                        {messageStates[msg.id].summaryError}
                      </p>
                    </div>
                  ) : (
                    messageStates[msg.id]?.summary && (
                      <div 
                        className={`mt-4 p-3 rounded-lg ${isCompactLayout ? 'bg-gray-800/30' : 'bg-gray-800/50'} border border-indigo-500/20`}
                        role="region"
                        aria-label="Message summary"
                      >
                        <p 
                          className="text-white p-1 bg-purple-500/30 rounded-lg w-fit text-xs mb-4 border border-purple-400/20"
                          aria-hidden="true"
                        >
                          Summary
                        </p>
                        <div className="text-gray-300 text-sm prose prose-invert">
                          <Markdown>{messageStates[msg.id].summary}</Markdown>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </article>
            ))
          ) : (
            <div 
              className={`mt-4 p-4 rounded-lg ${isCompactLayout ? 'bg-transparent text-center' : 'bg-gray-800/50 border border-indigo-500/20'}`}
              role="status"
              aria-label="Empty message history"
            >
              <p className="text-gray-300 text-sm">
                The magic happens when you type something below...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageOutput;
