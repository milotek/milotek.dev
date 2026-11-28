/**
 * @fileoverview Continuous 3-lane vertical scroll animation for 88x31 buttons.
 *
 * Each lane drifts at its own base speed with a subtle sinusoidal modulation,
 * pauses when hovered, and supports wheel scrubbing.
 */

interface LaneState {
  readonly element: HTMLElement;
  readonly baseSpeedPxPerSec: number;
  readonly driftPeriodMs: number;
  readonly driftPhaseRad: number;
  offsetPx: number;
  wheelMomentumPx: number;
  isHovered: boolean;
}

const LANE_SPEEDS_PX_PER_SEC: readonly number[] = [60, 80, 50];
const DRIFT_AMPLITUDE = 0.35;
const MIN_DRIFT_PERIOD_MS = 7000;
const EXTRA_DRIFT_PERIOD_MS = 8000;
const WHEEL_DAMPING_FACTOR = 0.2;

/** Wraps `value` into the half-open interval `[0, period)`. */
function wrapOffset(value: number, period: number): number {
  return ((value % period) + period) % period;
}

/** Initializes the falling 88x31 button lanes if present on the page. */
export function initButtonWaterfall(): void {
  const laneElements = [
    ...document.querySelectorAll<HTMLElement>('.button-waterfall .button-lane'),
  ];
  if (laneElements.length === 0) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const lanes: LaneState[] = laneElements.map((element, index) => ({
    element,
    baseSpeedPxPerSec: LANE_SPEEDS_PX_PER_SEC[index] ?? 60,
    driftPeriodMs: MIN_DRIFT_PERIOD_MS + Math.random() * EXTRA_DRIFT_PERIOD_MS,
    driftPhaseRad: Math.random() * Math.PI * 2,
    offsetPx: 0,
    wheelMomentumPx: 0,
    isHovered: false,
  }));

  for (const lane of lanes) {
    lane.element.addEventListener('pointerenter', () => {
      lane.isHovered = true;
    });
    lane.element.addEventListener('pointerleave', () => {
      lane.isHovered = false;
    });
    lane.element.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        event.preventDefault();
        lane.wheelMomentumPx -= event.deltaY;
      },
      {passive: false},
    );
  }

  let previousTimestampMs = 0;

  const animateFrame = (timestampMs: number): void => {
    const deltaSeconds =
      previousTimestampMs > 0 ? (timestampMs - previousTimestampMs) / 1000 : 0;

    for (const lane of lanes) {
      // Each lane duplicates its items so scrolling half the height loops seamlessly.
      const loopHeightPx = lane.element.scrollHeight / 2;
      if (loopHeightPx <= 0) {
        continue;
      }

      const wheelStepPx = lane.wheelMomentumPx * WHEEL_DAMPING_FACTOR;
      lane.wheelMomentumPx -= wheelStepPx;

      const driftWave = Math.sin(
        (timestampMs / lane.driftPeriodMs) * Math.PI * 2 + lane.driftPhaseRad,
      );
      const currentSpeedPxPerSec =
        lane.baseSpeedPxPerSec * (1 + DRIFT_AMPLITUDE * driftWave);

      const autoStepPx =
        lane.isHovered || prefersReducedMotion
          ? 0
          : currentSpeedPxPerSec * deltaSeconds;

      lane.offsetPx = wrapOffset(
        lane.offsetPx + wheelStepPx + autoStepPx,
        loopHeightPx,
      );
      lane.element.style.transform = `translateY(${(
        lane.offsetPx - loopHeightPx
      ).toFixed(1)}px)`;
    }

    previousTimestampMs = timestampMs;
    window.requestAnimationFrame(animateFrame);
  };

  window.requestAnimationFrame(animateFrame);
}
