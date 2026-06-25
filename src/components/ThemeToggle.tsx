import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-6 right-6 z-50"
    >
      <motion.button
        onClick={toggleTheme}
        className={`
          relative flex items-center justify-center w-16 h-8 rounded-full p-1 transition-all duration-300 ease-in-out
          ${isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700' 
            : 'bg-gradient-to-r from-blue-200 to-blue-300 border border-blue-400'
          }
          hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Slider Background */}
        <motion.div
          className={`
            absolute inset-1 rounded-full transition-all duration-300
            ${isDark 
              ? 'bg-gradient-to-r from-slate-700 to-slate-800' 
              : 'bg-gradient-to-r from-white to-blue-50'
            }
          `}
        />
        
        {/* Sliding Circle */}
        <motion.div
          className={`
            relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
            ${isDark 
              ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-yellow-400' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
            }
          `}
          animate={{
            x: isDark ? 0 : 24,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: isDark ? 0 : 180,
              scale: isDark ? 1 : 1.1
            }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <Moon className="w-3 h-3" />
            ) : (
              <Sun className="w-3 h-3" />
            )}
          </motion.div>
        </motion.div>

        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <motion.div
            animate={{
              opacity: isDark ? 0.3 : 0.7,
              scale: isDark ? 0.8 : 1
            }}
            transition={{ duration: 0.3 }}
            className="text-yellow-500"
          >
            <Sun className="w-3 h-3" />
          </motion.div>
          <motion.div
            animate={{
              opacity: isDark ? 0.7 : 0.3,
              scale: isDark ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
            className="text-slate-400"
          >
            <Moon className="w-3 h-3" />
          </motion.div>
        </div>
      </motion.button>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className={`
          absolute top-12 right-0 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap
          ${isDark 
            ? 'bg-slate-800 text-slate-200 border border-slate-700' 
            : 'bg-white text-slate-700 border border-slate-300 shadow-lg'
          }
        `}
      >
        {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        <div className={`
          absolute -top-1 right-4 w-2 h-2 rotate-45
          ${isDark ? 'bg-slate-800 border-l border-t border-slate-700' : 'bg-white border-l border-t border-slate-300'}
        `} />
      </motion.div>
    </motion.div>
  );
};

export default ThemeToggle;
