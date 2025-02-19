'use client'
import React, { useState } from 'react'

const SummaryOptionsModal = ({messages, selectedMessageId, setMessageStates, setShowSummaryModal, messageStates}) => {
  const [summaryOptions, setSummaryOptions] = useState({
    type: 'key-points',
    format: 'markdown', 
    length: 'medium'
  });
  const [downloadProgress, setDownloadProgress] = useState(0);

  // handle summary
  const handleSummary = async (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    // Check if browser supports summarization API
    if (!('ai' in self && 'summarizer' in self.ai)) {
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isSummarizing: false,
          summaryError: "Your browser doesn't support the Summarization API. Please update to a compatible browser like Chrome."
        }
      }));
      return;
    }

    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isSummarizing: true,
        summaryError: null
      }
    }));

    try {
      // Check summarizer capabilities
      const summarizerCapabilities = await self.ai.summarizer.capabilities();
      const canSummarize = summarizerCapabilities.available;

      if (canSummarize === 'no') {
        setMessageStates(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            isSummarizing: false,
            summaryError: "Summarization is not available at the moment. Please try again later."
          }
        }));
        return;
      }

      let summarizer;
      if (canSummarize === 'readily') {
        summarizer = await self.ai.summarizer.create({
          ...summaryOptions
        });
      } else {
        // Need to download model first
        setDownloadProgress(0);
        summarizer = await self.ai.summarizer.create({
          ...summaryOptions,
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              setDownloadProgress(progress);
            });
          },
        });
        await summarizer.ready;
      }

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
      console.error("Summarization error:", error);
      setMessageStates(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isSummarizing: false,
          summaryError: "Something went wrong generating the summary. Please try again."
        }
      }));
    } finally {
      setShowSummaryModal(false);
    }
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

        {/* Download progress indicator */}
        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div 
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
                role="progressbar"
                aria-valuenow={downloadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <p className="text-sm text-gray-300 mt-2">Downloading model: {downloadProgress}%</p>
          </div>
        )}
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
