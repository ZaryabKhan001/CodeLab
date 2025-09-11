"use client";
import { useEffect, useState } from 'react';

export const useMounted = (): boolean => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
};
