"use client";

import { create } from "zustand";

interface NavigationState {
  isNavigating: boolean;
  setNavigating: (isNavigating: boolean) => void;
}

/**
 * 네비게이션 상태를 관리하는 전역 스토어
 * 페이지 전환 중 로딩 상태를 추적하여 사용자에게 즉각적인 피드백 제공
 */
export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  setNavigating: (isNavigating: boolean) => set({ isNavigating }),
}));

/**
 * 네비게이션 상태를 사용하는 커스텀 훅
 * @returns 네비게이션 상태와 상태 변경 함수
 */
export const useNavigationState = () => {
  const { isNavigating, setNavigating } = useNavigationStore();

  return {
    isNavigating,
    setNavigating,
  };
};
