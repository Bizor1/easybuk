'use client'

import React, { useState, useEffect, useCallback } from 'react';

interface TypewriterTextProps {
    words: string[];
    className?: string;
    onWordChange?: (word: string, index: number) => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ words, className = '', onWordChange }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (words.length === 0) return;

        const word = words[currentWordIndex];
        let timeout: NodeJS.Timeout;

        if (isTyping) {
            // Typing animation
            if (currentText.length < word.length) {
                timeout = setTimeout(() => {
                    setCurrentText(word.slice(0, currentText.length + 1));
                }, 50); // Faster typing (was 80ms)
            } else {
                // Word is fully typed - notify parent immediately
                if (onWordChange) {
                    onWordChange(word, currentWordIndex);
                }
                // Wait before starting to delete
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 1800); // Shorter pause (was 2500ms)
            }
        } else {
            // Deleting animation
            if (currentText.length > 0) {
                timeout = setTimeout(() => {
                    setCurrentText(currentText.slice(0, -1));
                }, 25); // Faster deletion (was 40ms)
            } else {
                // Move to next word
                const nextIndex = (currentWordIndex + 1) % words.length;
                setCurrentWordIndex(nextIndex);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [currentText, currentWordIndex, isTyping, words, onWordChange]);

    // Initial call to set the first word and image
    useEffect(() => {
        if (onWordChange && words.length > 0) {
            onWordChange(words[0], 0);
        }
    }, [onWordChange, words]);

    return (
        <span className={`${className} text-secondary font-bold inline-block min-h-[1.2em]`}>
            {currentText}
            <span className="animate-pulse text-secondary ml-1">|</span>
        </span>
    );
};

export default TypewriterText; 