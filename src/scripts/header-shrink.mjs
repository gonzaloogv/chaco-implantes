export const HEADER_SHRINK_RANGE = 140;
export const HEADER_SNAP_THRESHOLD = 60;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const mix = (from, to, progress) => from + (to - from) * progress;

export function computeHeaderVisualState({
  isHome,
  reducedMotion,
  rootFontSize,
  scrollY,
  viewportHeight,
  viewportWidth,
}) {
  const shrink = !isHome
    ? 1
    : reducedMotion
      ? scrollY < HEADER_SNAP_THRESHOLD
        ? 0
        : 1
      : clamp(scrollY / HEADER_SHRINK_RANGE, 0, 1);
  const isCompact = viewportWidth < rootFontSize * 64;
  const expanded = isCompact
    ? {
        headerHeight: rootFontSize * 5.5,
        logoSize: rootFontSize * 3.25,
        subtitleSize: rootFontSize * 0.68,
        titleSize: rootFontSize * 1.2,
      }
    : {
        headerHeight: Math.max(viewportHeight * 0.15, rootFontSize * 8.5),
        logoSize: clamp(
          viewportHeight * 0.1,
          rootFontSize * 5,
          rootFontSize * 7.5,
        ),
        subtitleSize: clamp(
          viewportWidth * 0.01,
          rootFontSize * 0.8,
          rootFontSize,
        ),
        titleSize: clamp(
          viewportWidth * 0.02,
          rootFontSize * 1.45,
          rootFontSize * 2.35,
        ),
      };
  const collapsed = {
    headerHeight: rootFontSize * 4.5,
    logoSize: rootFontSize * 2.75,
    subtitleSize: rootFontSize * 0.6875,
    titleSize: rootFontSize * 1.125,
  };

  return {
    backgroundAlpha: mix(0, 0.94, shrink),
    blur: mix(0, 18, shrink),
    borderAlpha: mix(0, 0.18, shrink),
    headerHeight: mix(expanded.headerHeight, collapsed.headerHeight, shrink),
    logoGlowAlpha: mix(0.55, 0.5, shrink),
    logoGlowSize: mix(12, 8, shrink),
    logoSize: mix(expanded.logoSize, collapsed.logoSize, shrink),
    shadowAlpha: mix(0, 0.75, shrink),
    shrink,
    subtitleSize: mix(expanded.subtitleSize, collapsed.subtitleSize, shrink),
    titleSize: mix(expanded.titleSize, collapsed.titleSize, shrink),
  };
}
