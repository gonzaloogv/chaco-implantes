export const VIEWER_ZOOM_MIN = 1;
export const VIEWER_ZOOM_MAX = 2.5;
export const VIEWER_ZOOM_STEP = 0.25;

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

const normalizeZoom = (value) =>
  Math.round(
    clamp(value, VIEWER_ZOOM_MIN, VIEWER_ZOOM_MAX) * 100,
  ) / 100;

export function computeSteppedZoom({ currentZoom, direction }) {
  const safeZoom = Number.isFinite(currentZoom)
    ? currentZoom
    : VIEWER_ZOOM_MIN;
  const safeDirection = Math.sign(direction);
  return normalizeZoom(safeZoom + safeDirection * VIEWER_ZOOM_STEP);
}

export function computePinchZoom({
  currentDistance,
  initialDistance,
  initialZoom,
}) {
  if (
    !Number.isFinite(currentDistance) ||
    !Number.isFinite(initialDistance) ||
    initialDistance <= 0
  ) {
    return normalizeZoom(initialZoom);
  }

  return normalizeZoom(
    initialZoom * (currentDistance / initialDistance),
  );
}

export function clampViewerPan({
  contentHeight,
  contentWidth,
  panX,
  panY,
  viewportHeight,
  viewportWidth,
}) {
  const maximumX = Math.max(
    (Math.max(Number(contentWidth) || 0, 0) -
      Math.max(Number(viewportWidth) || 0, 0)) /
      2,
    0,
  );
  const maximumY = Math.max(
    (Math.max(Number(contentHeight) || 0, 0) -
      Math.max(Number(viewportHeight) || 0, 0)) /
      2,
    0,
  );

  return {
    panX: clamp(Number(panX) || 0, -maximumX, maximumX),
    panY: clamp(Number(panY) || 0, -maximumY, maximumY),
  };
}
