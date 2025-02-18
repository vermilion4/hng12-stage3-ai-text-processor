"use client";

import React, { useEffect, useRef } from "react";
import MessageActions from "./MessageActions";

const MessageOutput = ({
  messages,
  messageStates,
  setMessageStates,
  supportedLanguages,
}) => {
  const chatOutputRef = useRef(null);

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
  }, [messages, messageStates]);

  return (
    <div
      ref={chatOutputRef}
      className="flex-1 bg-gray-900/30 backdrop-blur-lg rounded-lg p-6 mb-6 overflow-y-auto border border-indigo-500/20 shadow-[0_0_50px_-12px] shadow-indigo-500/30 h-[500px]"
    >
      <div className="space-y-6" id="chat-output">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="relative group">
              <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 shadow-lg hover:shadow-indigo-500/10">
                {/* Message Text Section */}
                <p className="text-gray-100 leading-relaxed">{msg.text}</p>

                {/* Message Actions Section */}
                <MessageActions
                  messages={messages}
                  messageStates={messageStates}
                  setMessageStates={setMessageStates}
                  supportedLanguages={supportedLanguages}
                  msg={msg}
                />

                {/* Translation Section */}
                {messageStates[msg.id]?.isTranslating ? (
                  <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                    <p className="text-gray-300 text-sm animate-pulse">
                      🌟 Cosmic translation in progress... Traversing the
                      linguistic nebulae! 🚀
                    </p>
                  </div>
                ) : messageStates[msg.id]?.translationError ? (
                  <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                    <p className="text-red-400 text-sm">
                      {messageStates[msg.id].translationError}
                    </p>
                  </div>
                ) : (
                  messageStates[msg.id]?.translatedText && (
                    <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                      <p className="text-white p-1 bg-blue-500/30 rounded-lg w-fit text-xs mb-4 border border-blue-400/20">
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
                  <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                    <p className="text-gray-300 text-sm animate-pulse">
                      🌌 Distilling cosmic wisdom... Condensing the message
                      essence! ✨
                    </p>
                  </div>
                ) : messageStates[msg.id]?.summaryError ? (
                  <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                    <p className="text-red-400 text-sm">
                      {messageStates[msg.id].summaryError}
                    </p>
                  </div>
                ) : (
                  messageStates[msg.id]?.summary && (
                    <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-indigo-500/20">
                      <p className="text-white p-1 bg-purple-500/30 rounded-lg w-fit text-xs mb-4 border border-purple-400/20">
                        Summary
                      </p>
                      <p className="text-gray-300 text-sm">
                        {messageStates[msg.id].summary}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-indigo-500/20">
            <p className="text-gray-300 text-sm">
              The magic happens when you type something below...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageOutput;
