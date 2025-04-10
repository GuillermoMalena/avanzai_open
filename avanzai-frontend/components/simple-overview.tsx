import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ArrowUpIcon, PaperclipIcon } from './icons';
import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TextLoop } from './ui/text-loop';

interface SimpleOverviewProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  isLoading: boolean;
}

// Auto-resize textarea hook
function useAutoResizeTextarea(minHeight: number, maxHeight?: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export const SimpleOverview = ({ input, setInput, handleSubmit, isLoading }: SimpleOverviewProps) => {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(60, 200);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current?.focus();
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (input.trim()) {
        handleSubmit();
      }
    }
  };

  return (
    <motion.div
      key="simple-overview"
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 h-screen mt-[3vh]"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8 flex items-center justify-center">
        <TextLoop interval={3} className="min-w-[300px] sm:min-w-[400px] text-center">
          {[
            "How can Avanzai help you?",
            "Search market news",
            "Find historical asset performance",
            "Compare stock fundamentals"
          ].map((text) => (
            <span key={text} className="block text-center">
              {text}
            </span>
          ))}
        </TextLoop>
      </h1>

      <div className="w-full">
        <div className="relative bg-neutral-900 rounded-xl border border-neutral-800">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              tabIndex={0}
              placeholder="Ask a question..."
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none", 
                "text-white text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-500 placeholder:text-sm",
                "min-h-[60px]"
              )}
              style={{
                overflow: "hidden",
              }}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <PaperclipIcon size={16} />
                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">
                  Attach
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                  input.trim()
                    ? "bg-white text-black"
                    : "text-zinc-400"
                )}
                onClick={(event) => {
                  event.preventDefault();
                  if (input.trim()) {
                    handleSubmit();
                  }
                }}
                disabled={!input.trim() || isLoading}
              >
                <ArrowUpIcon size={16} />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};