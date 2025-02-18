'use client'
import React, { useState } from 'react'

const SummaryOptionsModal = ({messages, selectedMessageId, setMessageStates, setShowSummaryModal, messageStates}) => {
  const [summaryOptions, setSummaryOptions] = useState({
    type: 'key-points',
    format: 'markdown', 
    length: 'medium'
  });

  // handle summary
  const handleSummary = async (messageId) => {
    setShowSummaryModal(false);
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isSummarizing: true,
        summaryError: null
      }
    }));

    try {
      const summarizer = await self.ai.summarizer.create({
        ...summaryOptions
      });

      const result = await summarizer.summarize(message.text);
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
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isSummarizing: false,
          summaryError: error.message
        }
      }));
    }
    setShowSummaryModal(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-options-title"
    >
    <div className="bg-gray-900 p-6 rounded-xl border border-indigo-500/20 w-96">
      <h3 id="summary-options-title" className="text-xl text-white mb-4">Summary Options</h3>
      
      <div className="space-y-4">
        {/* summary type */}
        <div>
          <label htmlFor="summary-type" className="block text-sm text-gray-300 mb-2">Type</label>
          <select 
            id="summary-type"
            value={summaryOptions.type}
            onChange={(e) => setSummaryOptions(prev => ({...prev, type: e.target.value}))}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-indigo-500/20"
            aria-describedby="type-description"
          >
            <option value="key-points">Key Points</option>
            <option value="tl;dr">TL;DR</option>
            <option value="teaser">Teaser</option>
            <option value="headline">Headline</option>
          </select>
          <div className="sr-only" id="type-description">Select the style of summary you want to generate</div>
        </div>

        {/* summary format */}
        <div>
          <label htmlFor="summary-format" className="block text-sm text-gray-300 mb-2">Format</label>
          <select 
            id="summary-format"
            value={summaryOptions.format}
            onChange={(e) => setSummaryOptions(prev => ({...prev, format: e.target.value}))}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-indigo-500/20"
            aria-describedby="format-description"
          >
            <option value="markdown">Markdown</option>
            <option value="plain-text">Plain Text</option>
          </select>
          <div className="sr-only" id="format-description">Choose the output format for the summary</div>
        </div>

        {/* summary length */}
        <div>
          <label htmlFor="summary-length" className="block text-sm text-gray-300 mb-2">Length</label>
          <select 
            id="summary-length"
            value={summaryOptions.length}
            onChange={(e) => setSummaryOptions(prev => ({...prev, length: e.target.value}))}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-indigo-500/20"
            aria-describedby="length-description"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
          <div className="sr-only" id="length-description">Select how detailed you want the summary to be</div>
        </div>
      </div>

      {/* summary action buttons (cancel, summarize) */}
      <div className="mt-6 flex justify-end space-x-4">
        <button 
          onClick={() => setShowSummaryModal(false)}
          className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          aria-label="Cancel and close modal"
        >
          Cancel
        </button>
        <button 
          onClick={() => handleSummary(selectedMessageId)}
          className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
          aria-label="Generate summary with selected options"
          disabled={messageStates[selectedMessageId]?.isSummarizing}
          aria-busy={messageStates[selectedMessageId]?.isSummarizing}
        >
          {messageStates[selectedMessageId]?.isSummarizing ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>
    </div>
  </div>
  )
}

export default SummaryOptionsModal
