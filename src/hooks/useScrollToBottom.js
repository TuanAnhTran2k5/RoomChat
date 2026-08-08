import { useEffect, useRef } from "react";

export function useScrollToBottom(dependency) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Đợi DOM cập nhật đầy đủ rồi scroll
      const timeoutId = setTimeout(() => {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [dependency]);

  return containerRef;
}

export default useScrollToBottom;
