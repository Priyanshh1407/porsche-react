// RollingNumberInView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * RollingNumberInView animates from an initial zero-padded string (e.g. "000.0")
 * to the target number string (e.g. "123.4"), rolling random digits in between,
 * but **only when the component scrolls into the viewport**.
 *
 * Props:
 *  - target: number to display finally (e.g. 123.4)
 *  - decimals: number of decimal places to show (default: 1)
 *  - interval: how fast (ms) to flicker random digits during rolling (default: 50)
 *  - baseDelay: base delay (ms) before the first digit starts revealing (default: 300)
 *  - stagger: additional delay per-digit index (ms) so digits reveal one by one (default: 100)
 *  - jitter: max random extra ms added to each digit’s reveal time (default: 100)
 *  - charPool: string of characters to pick randomly for rolling (default: "0123456789")
 *  - threshold: IntersectionObserver threshold (default: 0.1)
 *  - rootMargin: IntersectionObserver rootMargin (default: "0px")
 *  - triggerOnce: whether to trigger rolling only once (true) or retrigger each time it re-enters (false). Default: true.
 *
 * Example:
 *   <RollingNumberInView 
 *      target={123.4} 
 *      decimals={1} 
 *      interval={50} 
 *      baseDelay={300} 
 *      stagger={100} 
 *      jitter={150} 
 *      threshold={0.2}
 *      rootMargin="0px 0px -10% 0px"
 *      triggerOnce={true}
 *   />
 */
const RollingNumberInView = ({
  target,
  decimals = 1,
  interval = 50,
  baseDelay = 300,
  stagger = 100,
  jitter = 100,
  charPool = '0123456789',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}) => {
  // Format target to fixed decimals
  const targetStr = Number(target).toFixed(decimals);
  // Split into integer and fractional parts
  const [intPart, fracPart] = targetStr.split('.');
  // Prepare initial zero-padded string
  const initialInt = '0'.repeat(intPart.length);
  const initialFrac = fracPart != null ? '0'.repeat(fracPart.length) : '';
  const initialStr = fracPart != null ? `${initialInt}.${initialFrac}` : initialInt;

  // State: array of { char: string, revealed: boolean }
  // Initially, display the zeros and decimal points immediately, but don't start rolling until visible
  const [displayArr, setDisplayArr] = useState(
    Array.from(initialStr).map((ch) => ({
      char: ch,
      revealed: ch === '.', // decimal point is immediately shown
    }))
  );

  // Ref to the container element for observing visibility
  const containerRef = useRef(null);
  // Track whether we've started the rolling animation
  const [hasStarted, setHasStarted] = useState(false);

  // Store intervals/timeouts for cleanup
  const intervalsRef = useRef([]);
  const timeoutsRef = useRef([]);

  // Intersection Observer setup
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When it enters viewport:
            setHasStarted((prev) => {
              if (prev && triggerOnce) {
                // already started and only trigger once → do nothing
                return prev;
              }
              return true;
            });
            if (triggerOnce) {
              observer.disconnect();
            }
          } else {
            // If you want to reset when leaving viewport and retrigger on re-enter:
            if (!triggerOnce) {
              setHasStarted(false);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  // Effect: run the rolling logic when hasStarted becomes true
  useEffect(() => {
    if (!hasStarted) {
      // If not started, just ensure displayArr shows initial zeros/decimal and clear any timers
      intervalsRef.current.forEach((id) => clearInterval(id));
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      intervalsRef.current = [];
      timeoutsRef.current = [];
      setDisplayArr(
        Array.from(initialStr).map((ch) => ({
          char: ch,
          revealed: ch === '.',
        }))
      );
      return;
    }

    // Start rolling:
    // First clear any existing timers from prior runs (in case triggerOnce=false).
    intervalsRef.current.forEach((id) => clearInterval(id));
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    intervalsRef.current = [];
    timeoutsRef.current = [];

    // Initialize displayArr to initial zeros/decimal
    setDisplayArr(
      Array.from(initialStr).map((ch) => ({
        char: ch,
        revealed: ch === '.',
      }))
    );

    // For each position, if digit, start cycling and schedule reveal
    Array.from(initialStr).forEach((initialChar, idx) => {
      if (initialChar === '.') return; // skip decimal point

      // Start cycling random digits
      const intervalId = setInterval(() => {
        setDisplayArr((prev) => {
          const copy = [...prev];
          const randChar = charPool.charAt(
            Math.floor(Math.random() * charPool.length)
          );
          copy[idx] = { char: randChar, revealed: false };
          return copy;
        });
      }, interval);
      intervalsRef.current.push(intervalId);

      // Compute reveal delay: baseDelay + stagger * idx + random jitter
      const revealDelay = baseDelay + stagger * idx + Math.random() * jitter;

      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        // Reveal the actual digit from targetStr
        const actualChar = targetStr.charAt(idx);
        setDisplayArr((prev) => {
          const copy = [...prev];
          copy[idx] = { char: actualChar, revealed: true };
          return copy;
        });
      }, revealDelay);
      timeoutsRef.current.push(timeoutId);
    });

    // Cleanup on unmount or when hasStarted toggles
    return () => {
      intervalsRef.current.forEach((id) => clearInterval(id));
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      intervalsRef.current = [];
      timeoutsRef.current = [];
    };
  // Re-run whenever hasStarted changes, or if target string / timing props change while visible
  }, [hasStarted, targetStr, initialStr, interval, baseDelay, stagger, jitter, charPool]);

  return (
    <div ref={containerRef} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
      {displayArr.map((item, idx) => {
        const { char, revealed } = item;
        // Framer Motion variants: when revealed, animate y from -10 → 0 and opacity 0 → 1
        const variants = {
          initial: { y: -10, opacity: 0 },
          animate: { y: 0, opacity: 1 },
        };
        return (
          <motion.span
            key={`rolling-num-${idx}-${char}-${revealed}`}
            style={{ display: 'inline-block' }}
            variants={variants}
            initial="initial"
            animate={revealed ? 'animate' : ''}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
};

RollingNumberInView.propTypes = {
  target: PropTypes.number.isRequired,
  decimals: PropTypes.number,
  interval: PropTypes.number,
  baseDelay: PropTypes.number,
  stagger: PropTypes.number,
  jitter: PropTypes.number,
  charPool: PropTypes.string,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  triggerOnce: PropTypes.bool,
};

export default RollingNumberInView;
