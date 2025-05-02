"use client";

import cn from "classnames";
import Markdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ChevronDownIcon, LoaderIcon, ArrowUpIcon } from "./icons";
import { Message } from "@ai-sdk/react";
import React from "react";

// Use local Markdown component instead of importing markdown-components
import { Markdown as AppMarkdown } from "./markdown";

export interface ReasoningPart {
  type: "reasoning";
  reasoning: string;
  details: Array<
    | { type: "text"; text: string; signature?: string }
    | { type: "redacted"; data: string }
  >;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  // Start expanded
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Keep track of when reasoning has been stable-off for a period
  const reasoningTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Improved simple query detection
  const isSimpleQuery = part.details.some(detail => 
    detail.type === "text" && 
    ('text' in detail) && 
    (detail.text.includes("Simple query detected.") || 
     detail.text.includes("SIMPLE_QUERY:"))
  ) || part.reasoning?.includes("SIMPLE_QUERY:");

  // Debug reasoning state
  console.log('[REASONING-COMPONENT-DEBUG] State:', {
    isReasoning,
    isExpanded
  });

  // Bidirectional effect with debounce for closing
  useEffect(() => {
    // If reasoning is active, always ensure it's expanded
    if (isReasoning) {
      setIsExpanded(true);
      
      // Clear any pending collapse timer
      if (reasoningTimerRef.current) {
        clearTimeout(reasoningTimerRef.current);
        reasoningTimerRef.current = null;
      }
    } 
    // Only collapse after reasoning has been off for a stable period
    else {
      // Clear any existing timer
      if (reasoningTimerRef.current) {
        clearTimeout(reasoningTimerRef.current);
      }
      
      // Set a new timer
      reasoningTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
        reasoningTimerRef.current = null;
      }, 1500); // Longer debounce to handle fluctuations
    }
    
    // Cleanup on unmount
    return () => {
      if (reasoningTimerRef.current) {
        clearTimeout(reasoningTimerRef.current);
      }
    };
  }, [isReasoning]);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  return (
    <div className="flex flex-col">
      {isReasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">
            {isSimpleQuery ? "Quick reasoning" : "Reasoning"}
          </div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">
            {isSimpleQuery 
              ? "Quick analysis completed" 
              : "Reasoned for a few seconds"}
          </div>
          <button
            className={cn(
              "cursor-pointer rounded-full dark:hover:bg-zinc-800 hover:bg-zinc-200",
              {
                "dark:bg-zinc-800 bg-zinc-200": isExpanded,
              },
            )}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDownIcon /> : <ArrowUpIcon />}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className={cn(
              "text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800",
              {
                "italic": isSimpleQuery
              }
            )}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {part.details.map((detail, detailIndex) =>
              detail.type === "text" ? (
                <AppMarkdown key={detailIndex}>
                  {isSimpleQuery && detail.text.includes("Simple query detected.")
                    ? detail.text.replace("Simple query detected.", "")
                    : detail.text}
                </AppMarkdown>
              ) : (
                <div key={detailIndex} className="text-xs italic">
                  [redacted content]
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextMessagePartProps {
  text: string;
}

export function TextMessagePart({ text }: TextMessagePartProps) {
  return (
    <div className="flex flex-col gap-4">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  );
} 