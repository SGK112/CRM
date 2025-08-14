"use client";

import { useState, useRef, useEffect } from 'react';
import { SparklesIcon, CommandLineIcon, XMarkIcon, ArrowsPointingOutIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import AIAssistant from './AIAssistant';

type Stage = 'closed' | 'minimized' | 'open';

export default function CopilotWidget() {
  // Three stages: closed (tiny tab), minimized (widget), open (full assistant)
  const [stage, setStage] = useState<Stage>('minimized');
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setStage(s => s === 'open' ? 'minimized' : 'open');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const focusInputSoon = () => setTimeout(() => inputRef.current?.focus(), 40);

  const openAssistant = () => setStage('open');
  const openMinimized = () => { setStage('minimized'); focusInputSoon(); };
  const closeAll = () => setStage('closed');
  const cycleFromClosed = () => openMinimized();

  const setCommandAndOpen = (cmd: string) => {
    setDraft(cmd);
    setStage('open');
  };

  return (
    <>
      {/* Closed tiny tab */}
      {stage === 'closed' && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="w-56 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
            <button
              onClick={cycleFromClosed}
              aria-label="Open Copilot"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="h-10 w-10 rounded-md bg-purple-600 flex items-center justify-center shadow-inner">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">Copilot</p>
                <p className="text-[11px] text-gray-500">Click to activate</p>
              </div>
              <span className="text-[10px] font-medium text-gray-400">⌘K</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimized widget (resting quick chat) */}
      {stage === 'minimized' && (
        <div
          ref={containerRef}
          className="fixed bottom-4 right-4 z-40 w-72 rounded-xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="h-8 w-8 rounded-md bg-purple-600 flex items-center justify-center shadow-inner">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800">Construct Copilot</p>
              <p className="text-[10px] text-gray-500 tracking-tight">AI workspace assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={openAssistant}
                className="p-1 rounded-md hover:bg-white text-gray-500 hover:text-gray-700"
                title="Expand to full assistant"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
              <button
                onClick={closeAll}
                className="p-1 rounded-md hover:bg-white text-gray-500 hover:text-gray-700"
                title="Close Copilot"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-3 py-2 space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                placeholder="Ask or type / ..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-14 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onFocus={() => setStage('open')}
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1 pointer-events-none">
                <span className="text-[10px] text-gray-400">/</span>
                <span className="text-[10px] text-gray-400">⌘K</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {['/projects','/clients','/new-project'].map(s => (
                <button
                  key={s}
                  onClick={() => setCommandAndOpen(s)}
                  className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                >{s}</button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <CommandLineIcon className="h-3 w-3" />
                Smart actions ready
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={openAssistant}
                  className="inline-flex items-center gap-1 text-[10px] text-purple-600 hover:underline"
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full assistant overlay */}
      <AIAssistant isOpen={stage === 'open'} onClose={() => setStage('minimized')} />
    </>
  );
}
