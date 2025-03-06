// src/components/RotatingPlaceholder.tsx

import { useState, useEffect, useRef } from "react";
import { exampleQueries } from "~/constants/example-queries";

interface RotatingPlaceholderProps {
  onPlaceholderChange: (placeholder: string) => void;
}

export const RotatingPlaceholder = ({
  onPlaceholderChange,
}: RotatingPlaceholderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Adjusted timings for smoother animation
  const typingSpeed = 60; // ms per character when typing
  const deletingSpeed = 15; // Increased from 1ms - still fast but more noticeable
  const deleteChunkSize = 3; // Delete multiple characters at once for faster deletion
  const pauseBeforeDeleting = 3000; // ms to pause before starting to delete
  const pauseBeforeNextText = 700; // ms to pause before typing the next text

  // Keep track of timeouts and refs to avoid race conditions
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const placeholderTextRef = useRef<string>("");

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Safe way to update the placeholder - using setTimeout to avoid React warnings
  const safeUpdatePlaceholder = (text: string) => {
    if (placeholderTextRef.current !== text) {
      placeholderTextRef.current = text;
      setTimeout(() => {
        onPlaceholderChange(text);
      }, 0);
    }
  };

  // Update display text
  useEffect(() => {
    if (!isDeleting) {
      safeUpdatePlaceholder(displayText);
    }
  }, [displayText, isDeleting, onPlaceholderChange]);

  // Main typing animation effect
  useEffect(() => {
    const currentQuery = exampleQueries[currentIndex];

    if (isTyping) {
      // If we haven't typed out the full placeholder yet
      if (displayText.length < currentQuery.length) {
        timeoutRef.current = setTimeout(() => {
          const newText = currentQuery.substring(0, displayText.length + 1);
          setDisplayText(newText);
        }, typingSpeed);
      } else {
        // We finished typing, pause before deleting
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
          }, 100); // Small delay before deletion starts
        }, pauseBeforeDeleting);
      }
    } else if (isDeleting) {
      // If we still have text to delete
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          // Delete multiple characters at once for faster deletion effect
          const newLength = Math.max(0, displayText.length - deleteChunkSize);
          const newText = displayText.substring(0, newLength);
          setDisplayText(newText);
          safeUpdatePlaceholder(newText);
        }, deletingSpeed);
      } else {
        // We finished deleting, move to next placeholder
        setIsDeleting(false);
        const nextIndex = (currentIndex + 1) % exampleQueries.length;
        setCurrentIndex(nextIndex);

        // Pause before starting to type the next placeholder
        timeoutRef.current = setTimeout(() => {
          setIsTyping(true);
        }, pauseBeforeNextText);
      }
    }
  }, [currentIndex, displayText, isTyping, isDeleting, onPlaceholderChange]);

  // This component doesn't render anything visible
  return null;
};

export default RotatingPlaceholder;
