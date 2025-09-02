import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SelectionOverlay = memo(
  ({
    selections = [],
    _previewSelections = [],
    _containerBounds,
    itemHeight = 24,
    weeksPerRow = 52,
    isMobile = false,
  }) => {
    const overlayElements = useMemo(() => {
      const elements = [];
      const weekWidth = isMobile ? 8 : 12;
      const gap = 1;

      const selectionRanges = groupConsecutiveWeeks(selections);

      selectionRanges.forEach((range, index) => {
        const startYear = Math.floor((range.start - 1) / weeksPerRow);
        const startWeek = (range.start - 1) % weeksPerRow;
        const endYear = Math.floor((range.end - 1) / weeksPerRow);
        const endWeek = (range.end - 1) % weeksPerRow;

        const left = startWeek * (weekWidth + gap);
        const top = startYear * itemHeight;
        const width = (endWeek - startWeek + 1) * (weekWidth + gap) - gap;
        const height = (endYear - startYear + 1) * itemHeight;

        elements.push(
          <motion.div
            key={`selection-${index}`}
            className="absolute bg-yellow-400 bg-opacity-30 border-2 border-yellow-400 rounded pointer-events-none"
            style={{
              left,
              top,
              width,
              height,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        );
      });

      return elements;
    }, [selections, itemHeight, weeksPerRow, isMobile]);

    return (
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>{overlayElements}</AnimatePresence>
      </div>
    );
  }
);

function groupConsecutiveWeeks(weeks) {
  if (!weeks || !weeks.length) return [];

  const sorted = [...weeks].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push({ start, end });
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push({ start, end });

  return ranges;
}

SelectionOverlay.displayName = "SelectionOverlay";
export default SelectionOverlay;
