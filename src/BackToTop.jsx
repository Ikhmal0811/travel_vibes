import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const SCROLL_THRESHOLD = 300;

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const transition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 320, damping: 26, mass: 0.7 };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          className="back-to-top"
          aria-label="Back to top"
          title="Back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1, backgroundColor: '#FFBE27' }}
          exit={{ opacity: 0, y: 14, scale: 0.94 }}
          whileHover={reducedMotion
            ? { backgroundColor: '#FFD15C' }
            : { scale: 1.08, y: -3, backgroundColor: '#FFD15C' }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          transition={transition}
        >
          <ArrowUp size={22} strokeWidth={2.2} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
