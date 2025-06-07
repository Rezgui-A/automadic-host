
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinAnimationProps {
  show: boolean;
  onAnimationComplete: () => void;
  type?: 'stack' | 'routine';
}

const WinAnimation: React.FC<WinAnimationProps> = ({ show, onAnimationComplete, type = 'stack' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Trigger confetti effect - more celebratory now!
      if (type === 'routine') {
        // More elaborate confetti for routine completion
        const duration = 3000;
        const end = Date.now() + duration;
        
        (function frame() {
          confetti({
            particleCount: 12,
            angle: 60,
            spread: 75,
            origin: { x: 0.1, y: 0.6 },
            colors: ['#7E69AB', '#9b87f5', '#FFD700', '#4CAF50']
          });
          
          confetti({
            particleCount: 12,
            angle: 120,
            spread: 75,
            origin: { x: 0.9, y: 0.6 },
            colors: ['#7E69AB', '#9b87f5', '#FFD700', '#4CAF50']
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      } else {
        // Enhanced standard confetti for stack completion
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#7E69AB', '#9b87f5', '#4CAF50', '#FFD700']
        });
      }
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAnimationComplete();
      }, type === 'routine' ? 3000 : 2000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onAnimationComplete, type]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <motion.div 
        className="relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Celebration animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className={`w-28 h-28 ${type === 'routine' ? 'bg-stacks-purple' : 'bg-green-500'} rounded-full flex items-center justify-center`}
            animate={{ 
              scale: [1, 1.3, 1.1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default WinAnimation;
