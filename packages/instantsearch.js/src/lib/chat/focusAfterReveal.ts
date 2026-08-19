export function getActiveContainerAnimations(
  prompt: HTMLTextAreaElement | null
): Animation[] {
  if (!prompt) {
    return [];
  }

  const container = prompt.closest<HTMLElement>('.ais-Chat-container');
  return container && typeof container.getAnimations === 'function'
    ? container
        .getAnimations()
        .filter((animation) => animation.playState !== 'finished')
    : [];
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
  prompt: HTMLTextAreaElement | null
): Set<RevealProperty> {
  const container = prompt?.closest<HTMLElement>('.ais-Chat-container');

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

export function focusAfterReveal(
  prompt: HTMLTextAreaElement | null,
  animationsBeforeReveal: Animation[],
  shouldFocus: () => boolean
): void {
  const pendingRevealProperties = getPendingRevealProperties(prompt);
  const revealAnimations = getActiveContainerAnimations(prompt).filter(
    (animation) =>
      !animationsBeforeReveal.includes(animation) &&
      animation.effect?.getTiming().iterations !== Infinity &&
      affectsReveal(animation, pendingRevealProperties)
  );

  const focus = () => {
    if (prompt && shouldFocus()) {
      prompt.focus();
    }
  };

  if (revealAnimations.length === 0) {
    focus();
    return;
  }

  Promise.all(
    revealAnimations.map((animation) => animation.finished.catch(() => {}))
  ).then(focus);
}
