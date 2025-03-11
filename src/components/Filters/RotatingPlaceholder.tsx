// src/components/Filters/RotatingPlaceholder.tsx

import { useState, useEffect, useRef } from "react";
import { exampleQueries } from "~/constants/example-queries";

interface RotatingPlaceholderProps {
  onPlaceholderChange: (placeholder: string) => void;
  inputValue?: string; // Prop to track input content
  isFocused?: boolean; // Prop to track input focus state
}

export const RotatingPlaceholder = ({
  onPlaceholderChange,
  inputValue = "",
  isFocused = false,
}: RotatingPlaceholderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Start false for initial delay
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Start paused for initial delay
  const [needsRestart, setNeedsRestart] = useState(false);

  // Timings
  const initialDelay = 1000; // 2-second initial delay (changed from 3s to match your comment)
  const typingSpeed = 60; // ms per character when typing
  const deletingSpeed = 15; // ms per character when deleting
  const deleteChunkSize = 3; // Delete multiple characters at once for faster deletion
  const pauseBeforeDeleting = 3000; // ms to pause before starting to delete
  const pauseBeforeNextText = 700; // ms to pause before typing the next text

  // Refs for managing timeouts and state
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const placeholderTextRef = useRef<string>("");
  const prevInputValueRef = useRef<string>(inputValue);
  const prevFocusedRef = useRef<boolean>(isFocused);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Placeholder is visible when there's no text, regardless of focus state
  const isVisible = inputValue === "";

  // Track changes to determine if we need to restart the animation
  useEffect(() => {
    // ONLY restart if we had text and now we don't
    // Focus/blur should NOT impact the placeholder animation
    if (prevInputValueRef.current !== "" && inputValue === "") {
      setNeedsRestart(true);
    }

    prevInputValueRef.current = inputValue;
    prevFocusedRef.current = isFocused;
  }, [inputValue, isFocused]);

  // Handle visibility and restart conditions
  useEffect(() => {
    if (!isVisible) {
      // When there is text, clear placeholder and stop animation
      safeUpdatePlaceholder("");
      setIsPaused(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else if (isVisible && needsRestart) {
      // Only restart when text was deleted (needsRestart flag)
      setDisplayText("");
      setIsTyping(false);
      setIsDeleting(false);
      setIsPaused(true);
      setNeedsRestart(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Apply initial delay before starting animation
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(true);
      }, initialDelay);
    } else if (
      isVisible &&
      isPaused &&
      !isTyping &&
      !isDeleting &&
      displayText === ""
    ) {
      // Initial start (first render) - only trigger if we don't have text displayed yet
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(true);
      }, initialDelay);
    }
    // Only depend on isVisible and needsRestart, not focus state
  }, [isVisible, needsRestart]);

  // Safe way to update the placeholder
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
    if (isVisible && !isDeleting) {
      safeUpdatePlaceholder(displayText);
    }
  }, [displayText, isVisible, isDeleting, onPlaceholderChange]);

  // Main typing animation effect
  useEffect(() => {
    // Only run animation when visible and not paused
    if (isPaused || !isVisible) return;

    const currentQuery = exampleQueries[currentIndex];
    if (!currentQuery) return;

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
  }, [
    currentIndex,
    displayText,
    isTyping,
    isDeleting,
    isPaused,
    isVisible,
    onPlaceholderChange,
  ]);

  // This component doesn't render anything visible
  return null;
};

export default RotatingPlaceholder;
