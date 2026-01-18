import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function ChatInput({ onSend, disabled, isCentered }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      if(textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Styles adapt based on isCentered prop
  const containerClasses = isCentered 
    ? "w-full max-w-3xl px-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[20%]" 
    : "absolute bottom-0 left-0 w-full pt-6 pb-6 bg-gradient-to-t from-background via-background to-transparent"; // Bottom state

  const inputWrapperClasses = "relative flex items-center w-full bg-muted/50 rounded-[26px] px-2 py-2 shadow-sm border-0 focus-within:ring-0 focus-within:bg-muted transition-colors";

  return (
    <div className={containerClasses}>
      <div className={isCentered ? "w-full mx-auto" : "mx-auto w-full max-w-3xl px-4"}>
        <div className={inputWrapperClasses}>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything"
            className="flex-1 resize-none border-0 bg-transparent px-2 py-3 focus-visible:ring-0 text-gray-700 placeholder:text-gray-400 text-base min-h-[48px] max-h-[200px] overflow-y-auto"
            rows={1}
          />
          <div className="flex items-center gap-4 ml-2">
            <Button
                onClick={handleSend}
                disabled={!input.trim() || disabled}
                size="icon"
                className={`h-9 w-9 rounded-full transition-all flex items-center justify-center ${
                    input.trim() ? "bg-black text-white hover:bg-gray-800" : "bg-[#dedede] text-white cursor-not-allowed"
                } ${disabled ? "opacity-50" : ""}`}
              >
                <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
       {!isCentered && (
           <div className="px-2 py-2 text-center text-[10px] text-gray-400 md:px-[60px]">
            <span>UniRAG can make mistakes. Consider checking important information.</span>
          </div>
       )}
    </div>
  );
}
