import React from 'react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  badgeText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F6F8] text-zinc-900 relative overflow-x-hidden flex items-center justify-center py-10 px-4 sm:px-6 font-['SF_Pro_Display',-apple-system,sans-serif]">
      {/* Crisp Stark White Container - generous breathing room matching Viora design */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[465px] bg-white border border-zinc-200/80 rounded-[36px] p-8 sm:p-11 shadow-xl relative overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
};
