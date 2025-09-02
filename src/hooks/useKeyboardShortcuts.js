import { useEffect, useRef } from "react";

export const useKeyboardShortcuts = ({
  selectedColor,
  selectedWeeks,
  setSelectedWeeks,
  setSelectedColor,
  setIsDragging,
  setDraggedWeeks,
  setDragStartWeek,
  milestones,
  setMilestones,
}) => {
  const selectedWeeksRef = useRef(selectedWeeks);
  const selectedColorRef = useRef(selectedColor);
  const milestonesRef = useRef(milestones);
  
  // Keep refs updated
  useEffect(() => {
    selectedWeeksRef.current = selectedWeeks;
  }, [selectedWeeks]);
  
  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);
  
  useEffect(() => {
    milestonesRef.current = milestones;
  }, [milestones]);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setSelectedWeeks(new Set());
        setSelectedColor(null);
        setIsDragging(false);
        setDraggedWeeks(new Set());
        setDragStartWeek(null);
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "a" &&
        selectedColorRef.current
      ) {
        event.preventDefault();
        const paintedWeeks = new Set();
        Object.keys(milestonesRef.current || {}).forEach((weekNum) => {
          paintedWeeks.add(parseInt(weekNum));
        });
        setSelectedWeeks(paintedWeeks);
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedWeeksRef.current?.size > 0) {
          event.preventDefault();
          selectedWeeksRef.current.forEach((weekNum) => {
            setMilestones((prev) => {
              const updated = { ...prev };
              delete updated[weekNum];
              return updated;
            });
          });
          setSelectedWeeks(new Set());
        }
      }
    };

    window.addEventListener("keydown", handleKeydown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [
    // Only include setter functions in dependencies - they're stable
    setSelectedWeeks,
    setSelectedColor,
    setIsDragging,
    setDraggedWeeks,
    setDragStartWeek,
    setMilestones,
  ]);
};