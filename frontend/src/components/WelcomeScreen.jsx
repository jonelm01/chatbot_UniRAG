import React from 'react';
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-24" 
        >
            <h1 className="text-3xl font-medium text-gray-800 tracking-tight">How can I help you?</h1>
        </motion.div>
    </div>
  );
}
