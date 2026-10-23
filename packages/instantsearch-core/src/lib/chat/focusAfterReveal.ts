export type ContainerAnimationSnapshot = Array<{
  animation: Animation;
  currentTime: CSSNumberish | null;
  playState: AnimationPlayState;
  startTime: CSSNumberish | null;
}>;

const containersHeldInert = new WeakSet<HTMLElement>();
const revealAnimationsHeldByContainer = new WeakMap<
  HTMLElement,
  Set<Animation>
>();

function getContainer(prompt: HTMLTextAreaElement | null): HTMLElement | null {
  return prompt?.closest<HTMLElement>('.ais-Chat-container') ?? null;
}

export function getActiveContainerAnimations(
  prompt: HTMLTextAreaElement | null
): ContainerAnimationSnapshot {
  return getActiveAnimations(getContainer(prompt));
}

function getActiveAnimations(
  container: HTMLElement | null
): ContainerAnimationSnapshot {
  if (!container || typeof container.getAnimations !== 'function') {
    return [];
  }

  return container
    .getAnimations()
    .filter((animation) => animation.playState !== 'finished')
    .map((animation) => ({
      animation,
      currentTime: animation.currentTime,
      playState: animation.playState,
      startTime: animation.startTime,
    }));
}

const revealProperties = [
  'opacity',
  'transform',
  'translate',
  'scale',
  'rotate',
  'visibility',
  'clip',
  'clipPath',
] as const;

type RevealProperty = (typeof revealProperties)[number];

function isRevealed(
  style: CSSStyleDeclaration,
  property: RevealProperty
): boolean {
  if (property === 'opacity') {
    return style.opacity === '1';
  }

  if (property === 'transform') {
    return [
      'none',
      'matrix(1, 0, 0, 1, 0, 0)',
      'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    ].includes(style.transform);
  }

  if (property === 'translate') {
    return ['none', '0px', '0px 0px', '0px 0px 0px'].includes(style.translate);
  }

  if (property === 'scale') {
    return ['none', '1', '1 1'].includes(style.scale);
  }

  if (property === 'rotate') {
    return ['none', '0deg'].includes(style.rotate);
  }

  if (property === 'visibility') {
    return style.visibility === 'visible';
  }

  if (property === 'clip') {
    return ['auto', 'rect(auto, auto, auto, auto)'].includes(
      style.getPropertyValue('clip')
    );
  }

  return style.clipPath === 'none';
}

function getPendingRevealProperties(
  container: HTMLElement | null
): Set<RevealProperty> {
  if (!container || typeof getComputedStyle !== 'function') {
    return new Set(revealProperties);
  }

  const style = getComputedStyle(container);
  return new Set(
    revealProperties.filter((property) => !isRevealed(style, property))
  );
}

function affectsReveal(
  animation: Animation,
  pendingRevealProperties: Set<RevealProperty>
): boolean {
  if (pendingRevealProperties.size === 0) {
    return false;
  }

  const effect = animation.effect as KeyframeEffect | null;

  if (typeof effect?.getKeyframes !== 'function') {
    return true;
  }

  return effect
    .getKeyframes()
    .some((keyframe) =>
      Array.from(pendingRevealProperties).some((property) =>
        Object.prototype.hasOwnProperty.call(keyframe, property)
      )
    );
}

function startedDuringReveal(
  current: ContainerAnimationSnapshot[number],
  animationsBeforeReveal: ContainerAnimationSnapshot
): boolean {
  const previous = animationsBeforeReveal.find(
    ({ animation }) => animation === current.animation
  );

  if (!previous) {
    return true;
  }

  if (previous.playState !== current.playState) {
    return true;
  }

  if (current.startTime !== null && previous.startTime !== current.startTime) {
    return true;
  }

  return (
    typeof previous.currentTime === 'number' &&
    typeof current.currentTime === 'number' &&
    current.currentTime < previous.currentTime
  );
}

export function holdContainerInertUntilReveal(
  prompt: HTMLTextAreaElement | null
): void {
  const container = getContainer(prompt);

  if (
    !container?.classList.contains('ais-Chat-container--open') ||
    container.hasAttribute('inert')
  ) {
    return;
  }

  container.setAttribute('inert', '');
  containersHeldInert.add(container);
}

export function restoreContainerInertUntilReveal(
  prompt: HTMLTextAreaElement | null
): void {
  const container = getContainer(prompt);

  if (
    container &&
    containersHeldInert.has(container) &&
    getPendingRevealProperties(container).size > 0
  ) {
    container.setAttribute('inert', '');
  }
}

function requestAnimationFrameOrRun(callback: () => void): void {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(callback);
  } else {
    callback();
  }
}

export function focusAfterReveal(
  prompt: HTMLTextAreaElement | null,
  animationsBeforeReveal: ContainerAnimationSnapshot,
  shouldFocus: () => boolean,
  shouldRelease: () => boolean = shouldFocus
): void {
  const container = getContainer(prompt);

  const settle = () => {
    if (!shouldRelease()) {
      return;
    }

    if (container) {
      revealAnimationsHeldByContainer.delete(container);
    }

    if (
      container &&
      containersHeldInert.has(container) &&
      container.classList.contains('ais-Chat-container--open')
    ) {
      container.removeAttribute('inert');
      containersHeldInert.delete(container);
    }

    if (prompt && shouldFocus()) {
      prompt.focus();
    }
  };

  const waitForReveal = () => {
    const requestIsCurrent = shouldRelease();
    const pendingRevealProperties = getPendingRevealProperties(container);
    const heldRevealAnimations = container
      ? revealAnimationsHeldByContainer.get(container)
      : undefined;
    const activeAnimations = getActiveAnimations(container);
    const heldRevealIsActive = activeAnimations.some(({ animation }) =>
      heldRevealAnimations?.has(animation)
    );
    const replacesInactiveHeldReveal =
      heldRevealAnimations !== undefined && !heldRevealIsActive;
    const revealAnimations = activeAnimations.filter(
      (current) =>
        (startedDuringReveal(current, animationsBeforeReveal) ||
          heldRevealAnimations?.has(current.animation) ||
          replacesInactiveHeldReveal) &&
        current.animation.effect?.getTiming().iterations !== Infinity &&
        affectsReveal(current.animation, pendingRevealProperties)
    );

    if (
      container &&
      revealAnimations.length > 0 &&
      (!heldRevealAnimations || requestIsCurrent || !heldRevealIsActive)
    ) {
      revealAnimationsHeldByContainer.set(
        container,
        new Set(revealAnimations.map(({ animation }) => animation))
      );
    }

    if (!requestIsCurrent) {
      if (
        container &&
        !container.classList.contains('ais-Chat-container--open')
      ) {
        revealAnimationsHeldByContainer.delete(container);
        containersHeldInert.delete(container);
      }
      return;
    }

    if (revealAnimations.length === 0) {
      settle();
      return;
    }

    Promise.all(
      revealAnimations.map(({ animation }) =>
        animation.finished.catch(() => {})
      )
    ).then(() => requestAnimationFrameOrRun(waitForReveal));
  };

  waitForReveal();
}
