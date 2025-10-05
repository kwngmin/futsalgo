"use client";

import { useNavigationState } from "@/shared/hooks/use-navigation-state";
import { motion, AnimatePresence } from "motion/react";

/**
 * 네비게이션 전환 중 표시되는 로딩 인디케이터
 * 페이지 전환 시 즉각적인 시각적 피드백을 제공
 */
export const NavigationLoading = () => {
  const { isNavigating } = useNavigationState();

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
