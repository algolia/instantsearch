/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  focusAfterReveal,
  getActiveContainerAnimations,
  holdContainerInertUntilReveal,
  restoreContainerInertUntilReveal,
} from '../focusAfterReveal';

type ControlledAnimation = {
  animation: Animation;
  finish: () => void;
  cancel: () => void;
  setPlayState: (playState: AnimationPlayState) => void;
};

function createControlledAnimation(
  initialPlayState: AnimationPlayState
): ControlledAnimation {
  let resolveFinished!: () => void;
  let rejectFinished!: () => void;
  let playState = initialPlayState;
  const finished = new Promise<void>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = reject;
  });
  const animation = {
    effect: {
      getKeyframes: () => [{ opacity: 0 }, { opacity: 1 }],
      getTiming: () => ({ iterations: 1 }),
    },
    finished,
    get playState() {
      return playState;
    },
  } as unknown as Animation;

  return {
    animation,
    finish: resolveFinished,
    cancel: rejectFinished,
    setPlayState(nextPlayState) {
      playState = nextPlayState;
    },
  };
}

function renderPrompt() {
  const container = document.createElement('div');
  container.className = 'ais-Chat-container ais-Chat-container--open';
  const prompt = document.createElement('textarea');
  container.appendChild(prompt);
  document.body.appendChild(container);

  return { container, prompt };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('focusAfterReveal', () => {
  let opacity: string;

  beforeEach(() => {
    opacity = '0';
    jest.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          clipPath: 'none',
          opacity,
          rotate: 'none',
          scale: 'none',
          transform: 'none',
          translate: 'none',
          visibility: 'visible',
          getPropertyValue: () => 'auto',
        }) as unknown as CSSStyleDeclaration
    );
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
  });

  afterEach(() => {
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  test('waits when an existing reveal animation resumes', async () => {
    const { container, prompt } = renderPrompt();
    const reveal = createControlledAnimation('paused');
    let animations = [reveal.animation];
    Object.defineProperty(container, 'getAnimations', {
      configurable: true,
      value: () => animations,
    });
    const focus = jest.spyOn(prompt, 'focus');
    const animationsBeforeReveal = getActiveContainerAnimations(prompt);

    reveal.setPlayState('running');
    focusAfterReveal(prompt, animationsBeforeReveal, () => true);

    expect(focus).not.toHaveBeenCalled();

    opacity = '1';
    animations = [];
    reveal.finish();
    await flushPromises();

    expect(focus).toHaveBeenCalledTimes(1);
  });

  test('waits for a replacement reveal after the selected animation is canceled', async () => {
    const { container, prompt } = renderPrompt();
    const selectedReveal = createControlledAnimation('running');
    const replacementReveal = createControlledAnimation('paused');
    let animations = [selectedReveal.animation];
    Object.defineProperty(container, 'getAnimations', {
      configurable: true,
      value: () => animations,
    });
    const focus = jest.spyOn(prompt, 'focus');

    focusAfterReveal(prompt, [], () => true);

    expect(focus).not.toHaveBeenCalled();

    animations = [replacementReveal.animation];
    selectedReveal.cancel();
    await flushPromises();

    expect(focus).not.toHaveBeenCalled();

    opacity = '1';
    animations = [];
    replacementReveal.finish();
    await flushPromises();

    expect(focus).toHaveBeenCalledTimes(1);
  });

  test('keeps a replacement focus request on the reveal already held inert', async () => {
    const { container, prompt } = renderPrompt();
    const reveal = createControlledAnimation('running');
    let animations = [reveal.animation];
    Object.defineProperty(container, 'getAnimations', {
      configurable: true,
      value: () => animations,
    });
    const focus = jest.spyOn(prompt, 'focus');
    let focusRequestId = 1;

    holdContainerInertUntilReveal(prompt);
    focusAfterReveal(
      prompt,
      [],
      () => focusRequestId === 1,
      () => focusRequestId === 1
    );

    const animationsBeforeReplacement = getActiveContainerAnimations(prompt);
    focusRequestId = 2;
    holdContainerInertUntilReveal(prompt);
    focusAfterReveal(
      prompt,
      animationsBeforeReplacement,
      () => focusRequestId === 2,
      () => focusRequestId === 2
    );

    expect(container).toHaveAttribute('inert');
    expect(focus).not.toHaveBeenCalled();

    opacity = '1';
    animations = [];
    reveal.finish();
    await flushPromises();

    expect(container).not.toHaveAttribute('inert');
    expect(focus).toHaveBeenCalledTimes(1);
  });

  test('carries a replacement reveal observed by a stale request into the newer request', async () => {
    const { container, prompt } = renderPrompt();
    const selectedReveal = createControlledAnimation('running');
    const replacementReveal = createControlledAnimation('running');
    let animations = [selectedReveal.animation];
    Object.defineProperty(container, 'getAnimations', {
      configurable: true,
      value: () => animations,
    });
    const animationFrames: Array<() => void> = [];
    jest.mocked(window.requestAnimationFrame).mockImplementation((callback) => {
      animationFrames.push(() => callback(0));
      return animationFrames.length;
    });
    const focus = jest.spyOn(prompt, 'focus');
    let focusRequestId = 1;

    holdContainerInertUntilReveal(prompt);
    focusAfterReveal(
      prompt,
      [],
      () => focusRequestId === 1,
      () => focusRequestId === 1
    );

    animations = [replacementReveal.animation];
    selectedReveal.cancel();
    await flushPromises();
    expect(animationFrames).toHaveLength(1);

    const animationsBeforeReplacement = getActiveContainerAnimations(prompt);
    focusRequestId = 2;
    holdContainerInertUntilReveal(prompt);
    animationFrames.shift()!();
    focusAfterReveal(
      prompt,
      animationsBeforeReplacement,
      () => focusRequestId === 2,
      () => focusRequestId === 2
    );

    expect(container).toHaveAttribute('inert');
    expect(focus).not.toHaveBeenCalled();

    opacity = '1';
    animations = [];
    replacementReveal.finish();
    await flushPromises();
    animationFrames.shift()!();

    expect(container).not.toHaveAttribute('inert');
    expect(focus).toHaveBeenCalledTimes(1);
  });

  test('keeps a newer request on a replacement reveal before the canceled reveal settles', async () => {
    const { container, prompt } = renderPrompt();
    const selectedReveal = createControlledAnimation('running');
    const replacementReveal = createControlledAnimation('running');
    let animations = [selectedReveal.animation];
    Object.defineProperty(container, 'getAnimations', {
      configurable: true,
      value: () => animations,
    });
    const focus = jest.spyOn(prompt, 'focus');
    let focusRequestId = 1;

    holdContainerInertUntilReveal(prompt);
    focusAfterReveal(
      prompt,
      [],
      () => focusRequestId === 1,
      () => focusRequestId === 1
    );

    animations = [replacementReveal.animation];
    selectedReveal.cancel();
    const animationsBeforeReplacement = getActiveContainerAnimations(prompt);
    focusRequestId = 2;
    holdContainerInertUntilReveal(prompt);
    focusAfterReveal(
      prompt,
      animationsBeforeReplacement,
      () => focusRequestId === 2,
      () => focusRequestId === 2
    );

    expect(container).toHaveAttribute('inert');
    expect(focus).not.toHaveBeenCalled();

    opacity = '1';
    animations = [];
    replacementReveal.finish();
    await flushPromises();

    expect(container).not.toHaveAttribute('inert');
    expect(focus).toHaveBeenCalledTimes(1);
  });

  test('releases opening inertness without focusing a replaced prompt', () => {
    const { container, prompt } = renderPrompt();
    const focus = jest.spyOn(prompt, 'focus');

    holdContainerInertUntilReveal(prompt);
    expect(container).toHaveAttribute('inert');

    opacity = '1';
    focusAfterReveal(
      prompt,
      [],
      () => false,
      () => true
    );

    expect(container).not.toHaveAttribute('inert');
    expect(focus).not.toHaveBeenCalled();
  });

  test('keeps opening inertness when the focus request is no longer current', () => {
    const { container, prompt } = renderPrompt();
    const focus = jest.spyOn(prompt, 'focus');

    holdContainerInertUntilReveal(prompt);
    opacity = '1';
    focusAfterReveal(
      prompt,
      [],
      () => false,
      () => false
    );

    expect(container).toHaveAttribute('inert');
    expect(focus).not.toHaveBeenCalled();
  });

  test('restores opening inertness after an open layout rerenders', () => {
    const { container, prompt } = renderPrompt();

    holdContainerInertUntilReveal(prompt);
    container.removeAttribute('inert');
    restoreContainerInertUntilReveal(prompt);

    expect(container).toHaveAttribute('inert');
  });
});
