"use client";

import { useState, useRef, useEffect } from 'react';
import { SparklesIcon, CommandLineIcon, XMarkIcon, ArrowsPointingOutIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import AIAssistant from './AIAssistant';

type Stage = 'closed' | 'minimized' | 'open';

export default function CopilotWidget() {
  // Three stages: closed (tiny tab), minimized (widget), open (full assistant)
  const [stage, setStage] = useState<Stage>('minimized');
  const [draft, setDraft] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Listen for global Help button event to open Copilot
  useEffect(() => {
    const handler = () => {
      setStage('open');
      focusInputSoon();
    };
    window.addEventListener('copilot:open', handler as EventListener);
    return () => window.removeEventListener('copilot:open', handler as EventListener);
  }, []);

  return (
    <>
      {/* Closed tiny tab */}
      {stage === 'closed' && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="w-56 rounded-lg border border-token surface-1 dark:backdrop-blur-sm shadow-lg overflow-hidden">
            <button
              onClick={cycleFromClosed}
              aria-label="Open Copilot"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            >
              <div className="h-10 w-10 rounded-md bg-amber-600 dark:bg-amber-500 flex items-center justify-center shadow-inner">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Remodely Ai</p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">Click to activate</p>
              </div>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500">⌘K</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimized widget (resting quick chat) */}
      {stage === 'minimized' && (
        <div
          ref={containerRef}
          className="fixed bottom-4 right-4 z-40 w-72 rounded-xl border border-token surface-1 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow bg-[var(--surface-1)]"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-token bg-[var(--surface-2)] dark:bg-[var(--surface-2)] rounded-t-xl">
            <div className="h-8 w-8 rounded-md bg-amber-600 dark:bg-amber-500 flex items-center justify-center shadow-inner">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Remodely Ai Assistant</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 tracking-tight">AI workspace assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md hover:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-2)] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                title="Expand"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
              <button
                onClick={closeAll}
                className="p-1 rounded-md hover:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-2)] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
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
                className="w-full rounded-md border border-[var(--border)] dark:border-gray-700 bg-[var(--surface-2)] dark:bg-[var(--surface-2)] px-3 py-2 pr-14 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-gray-500 dark:placeholder:text-gray-500"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onFocus={() => setStage('open')}
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1 pointer-events-none">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">/</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">⌘K</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {['/projects','/clients','/new-project'].map(s => (
                <button
                  key={s}
                  onClick={() => setCommandAndOpen(s)}
                  className="text-[10px] px-2 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-gray-700 dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-3)] dark:text-gray-200 border border-[var(--border)] dark:border-gray-800 transition-colors"
                >{s}</button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <CommandLineIcon className="h-3 w-3" />
                Smart actions ready
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={openAssistant}
                  className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
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
