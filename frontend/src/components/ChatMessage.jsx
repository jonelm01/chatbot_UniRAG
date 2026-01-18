import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Copy, Check, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group w-full text-gray-800 bg-transparent`}
    >
      <div className="flex p-4 gap-4 text-base md:gap-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] m-auto">
        <div className="flex-shrink-0 flex flex-col relative items-end">
            <Avatar className="h-8 w-8 ring-1 ring-gray-200">
                <AvatarFallback className={isUser ? "bg-gray-100 text-gray-500" : "bg-black text-white"}>
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>
        </div>
        <div className="relative flex-1 overflow-hidden break-words">
          <div className="prose prose-slate max-w-none prose-p:leading-7 prose-pre:bg-[#f5f5f5] prose-pre:rounded-lg prose-pre:p-0">
            <ReactMarkdown
                components={{
                    code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                        <div className="relative rounded-lg overflow-hidden my-4 ring-1 ring-gray-200">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#f9f9f9] text-xs text-gray-500 border-b border-gray-100">
                                <span>{match[1]}</span>
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-colors">
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                </div>
                            </div>
                            <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, '')}
                                style={vs}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', backgroundColor: '#ffffff' }}
                            />
                        </div>
                        ) : (
                        <code {...props} className={className + " bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800"}>
                            {children}
                        </code>
                        )
                    }
                }}
            >
                {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
