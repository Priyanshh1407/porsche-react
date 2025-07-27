import React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = {};

export const useScrollPosition = (key = 'default') => {
    const location = useLocation();
    const scrollRef = useRef(null);

    useEffect(() => {
        // Restore scroll position when component mounts or key changes
        const restoreScrollPosition = () => {
            const savedPosition = scrollPositions[key] || 0;
            
            if (scrollRef.current) {
                scrollRef.current.scrollTop = savedPosition;
            } else {
                window.scrollTo(0, savedPosition);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(restoreScrollPosition, 100);
        
        return () => clearTimeout(timer);
    }, [key]); // Remove location dependency to prevent unnecessary restores

    useEffect(() => {
        // Save scroll position when component unmounts or location changes
        const saveScrollPosition = () => {
            if (scrollRef.current) {
                scrollPositions[key] = scrollRef.current.scrollTop;
            } else {
                scrollPositions[key] = window.pageYOffset;
            }
        };

        // Save on location change (before unmount)
        return saveScrollPosition;
    }, [location, key]);

    // Also save scroll position periodically during scrolling
    useEffect(() => {
        const saveScrollPosition = () => {
            if (scrollRef.current) {
                scrollPositions[key] = scrollRef.current.scrollTop;
            } else {
                scrollPositions[key] = window.pageYOffset;
            }
        };

        const handleScroll = () => {
            // Debounce scroll saving to avoid too many saves
            clearTimeout(handleScroll.timeoutId);
            handleScroll.timeoutId = setTimeout(saveScrollPosition, 100);
        };

        let scrollElement = scrollRef.current || window;
        
        if (scrollRef.current) {
            scrollRef.current.addEventListener('scroll', handleScroll);
        } else {
            window.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollRef.current) {
                scrollRef.current.removeEventListener('scroll', handleScroll);
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
            clearTimeout(handleScroll.timeoutId);
            // Final save when cleanup
            saveScrollPosition();
        };
    }, [key]);

    return scrollRef;
};