/**
 * @fileoverview Continuous 3-lane vertical scroll animation for 88x31 buttons
 * with hover pause and wheel scrubbing.
 */

const SPEED_PX_PER_SEC = 60;
const WHEEL_DAMPING = 0.2;
// Half of a button height + bottom padding ((31px + 6px) / 2) for a brick stagger.
const LANE_STAGGER_PX = 18.5;

/** Initializes the falling 88x31 button lanes if present on the page. */
export function initButtonWaterfall(): void {
  const elements = [
    ...document.querySelectorAll<HTMLElement>('.button-waterfall .button-lane'),
  ];
  if (elements.length === 0) {
    return;
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const lanes = elements.map((element, index) => ({
    element,
    offsetPx: index * LANE_STAGGER_PX,
    wheelPx: 0,
    paused: false,
  }));

  for (const lane of lanes) {
    lane.element.addEventListener('pointerenter', () => {
      lane.paused = true;
    });
    lane.element.addEventListener('pointerleave', () => {
      lane.paused = false;
    });
    lane.element.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        event.preventDefault();
        lane.wheelPx -= event.deltaY;
      },
      {passive: false},
    );
  }

  let prevMs = 0;

  const tick = (nowMs: number): void => {
    const dtSec = prevMs > 0 ? (nowMs - prevMs) / 1000 : 0;

    for (const lane of lanes) {
      // Each lane duplicates its items so scrolling half the height loops cleanly.
      const halfHeight = lane.element.scrollHeight / 2;
      if (halfHeight <= 0) {
        continue;
      }

      const wheelStep = lane.wheelPx * WHEEL_DAMPING;
      lane.wheelPx -= wheelStep;

      const autoStep = lane.paused || reducedMotion ? 0 : SPEED_PX_PER_SEC * dtSec;
      lane.offsetPx =
        (((lane.offsetPx + wheelStep + autoStep) % halfHeight) + halfHeight) %
        halfHeight;
      lane.element.style.transform = `translateY(${(
        lane.offsetPx - halfHeight
      ).toFixed(1)}px)`;
    }

    prevMs = nowMs;
    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}
