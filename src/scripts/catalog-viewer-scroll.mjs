const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export function computeViewerMaximumShift({ endSpacing, overlap }) {
  const safeEndSpacing = Number.isFinite(endSpacing)
    ? Math.max(endSpacing, 0)
    : 0;
  const safeOverlap = Number.isFinite(overlap) ? Math.max(overlap, 0) : 0;
  return safeOverlap + safeEndSpacing;
}

export function computeViewerRevealOffset({
  maxShift,
  reducedMotion,
  scrollY,
}) {
  const safeMaxShift = Number.isFinite(maxShift) ? Math.max(maxShift, 0) : 0;

  if (reducedMotion) {
    return safeMaxShift;
  }

  const safeScrollY = Number.isFinite(scrollY) ? scrollY : 0;
  return clamp(safeScrollY, 0, safeMaxShift);
}
