import { test, expect } from '../fixtures';

test.describe('Chat focus', () => {
  test('focuses the prompt after the layout is revealed', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('1');

    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).not.toHaveClass(/ais-Chat-container--open/);
    await expect(container).toHaveAttribute('inert', '');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('0');

    await page.evaluate(() => {
      document.addEventListener(
        'focusin',
        (event) => {
          const prompt = event.target as HTMLElement;
          if (!prompt.matches('.ais-ChatPrompt-textarea')) {
            return;
          }

          const chatContainer = prompt.closest('.ais-Chat-container');
          if (!chatContainer) {
            return;
          }

          const style = getComputedStyle(chatContainer);
          document.documentElement.dataset.chatFocusAfterRevealStyle =
            JSON.stringify({
              opacity: style.opacity,
              transform: style.transform,
            });
        },
        { capture: true }
      );
    });

    await trigger.click();

    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.documentElement.dataset.chatFocusAfterRevealStyle ?? null
          ),
        { timeout: 2000 }
      )
      .not.toBeNull();

    const focusStyle = JSON.parse(
      (await page.evaluate(
        () => document.documentElement.dataset.chatFocusAfterRevealStyle
      ))!
    ) as {
      opacity: string;
      transform: string;
    };

    expect(focusStyle.opacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(
      focusStyle.transform
    );
  });

  test('focuses after the reveal when the open state starts an ongoing animation', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('0');

    await page.addStyleTag({
      content: `
        @keyframes chat-outline-pulse {
          from { outline-color: transparent; }
          to { outline-color: currentColor; }
        }

        .ais-Chat-container--open {
          animation: chat-outline-pulse 1s linear infinite alternate;
        }
      `,
    });

    await expect
      .poll(() =>
        container.evaluate((element) => element.getAnimations().length)
      )
      .toBe(0);

    await page.evaluate(() => {
      document.addEventListener(
        'focusin',
        (event) => {
          const prompt = event.target as HTMLElement;
          if (!prompt.matches('.ais-ChatPrompt-textarea')) {
            return;
          }

          const chatContainer = prompt.closest('.ais-Chat-container');
          if (!chatContainer) {
            return;
          }

          const style = getComputedStyle(chatContainer);
          document.documentElement.dataset.chatFocusStyle = JSON.stringify({
            opacity: style.opacity,
            transform: style.transform,
          });
        },
        { capture: true }
      );
    });

    await trigger.click();

    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.dataset.chatFocusStyle ?? null
          ),
        { timeout: 2000 }
      )
      .not.toBeNull();

    const focusStyle = JSON.parse(
      (await page.evaluate(
        () => document.documentElement.dataset.chatFocusStyle
      ))!
    ) as {
      opacity: string;
      transform: string;
    };

    expect(focusStyle.opacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(
      focusStyle.transform
    );
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'chat-outline-pulse' &&
                animation.playState === 'running'
            )
        )
      )
      .toBe(true);
  });

  test('focuses after the reveal while an unrelated animation stays paused', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');
    const prompt = page.locator('.ais-ChatPrompt-textarea');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('0');

    await page.addStyleTag({
      content: `
        @keyframes chat-outline-hold {
          from { outline-color: transparent; }
          to { outline-color: currentColor; }
        }

        .ais-Chat-container--open {
          animation: chat-outline-hold 10s linear paused;
        }
      `,
    });

    await expect
      .poll(() =>
        container.evaluate((element) => element.getAnimations().length)
      )
      .toBe(0);

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('1');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).transform)
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'chat-outline-hold' &&
                animation.playState === 'paused'
            )
        )
      )
      .toBe(true);
    await expect(prompt).toBeFocused();
  });

  test('focuses when a paused animation leaves the layout visible', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');
    const prompt = page.locator('.ais-ChatPrompt-textarea');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('0');

    await page.addStyleTag({
      content: `
        @keyframes chat-opacity-hold {
          from { opacity: 1; }
          to { opacity: 1; }
        }

        .ais-Chat-container--open {
          animation: chat-opacity-hold 10s linear paused;
        }
      `,
    });

    await expect
      .poll(() =>
        container.evaluate((element) => element.getAnimations().length)
      )
      .toBe(0);

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect(container).toHaveCSS('opacity', '1');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).transform)
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'chat-opacity-hold' &&
                animation.playState === 'paused'
            )
        )
      )
      .toBe(true);
    await expect(prompt).toBeFocused();
  });

  test('waits for a paused reveal animation to finish before focusing', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');
    const prompt = page.locator('.ais-ChatPrompt-textarea');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('0');

    await page.addStyleTag({
      content: `
        @keyframes chat-opacity-reveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ais-Chat-container--open {
          animation: chat-opacity-reveal 10s linear paused;
        }
      `,
    });

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'chat-opacity-reveal' &&
                animation.playState === 'paused'
            )
        )
      )
      .toBe(true);
    await expect(container).toHaveCSS('opacity', '0');
    await expect(trigger).toBeFocused();

    await container.evaluate((element) => {
      const reveal = element
        .getAnimations()
        .find(
          (animation) =>
            animation instanceof CSSAnimation &&
            animation.animationName === 'chat-opacity-reveal'
        );

      if (!reveal) {
        throw new Error('Expected the paused reveal animation');
      }

      reveal.finish();
    });

    await expect(container).toHaveCSS('opacity', '1');
    await expect(prompt).toBeFocused();
  });

  test('focuses after a reveal animation is canceled while the layout stays open', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).opacity)
      )
      .toBe('0');

    const revealStyles = await page.addStyleTag({
      content: `
        @keyframes chat-opacity-cancel {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ais-Chat-container--open {
          animation: chat-opacity-cancel 10s linear paused;
        }
      `,
    });

    await expect
      .poll(() =>
        container.evaluate((element) => element.getAnimations().length)
      )
      .toBe(0);

    await page.evaluate(() => {
      document.addEventListener(
        'focusin',
        (event) => {
          const prompt = event.target as HTMLElement;
          if (!prompt.matches('.ais-ChatPrompt-textarea')) {
            return;
          }

          const chatContainer = prompt.closest('.ais-Chat-container');
          if (!chatContainer) {
            return;
          }

          const style = getComputedStyle(chatContainer);
          document.documentElement.dataset.chatFocusAfterCancellation =
            JSON.stringify({
              opacity: style.opacity,
              transform: style.transform,
            });
        },
        { capture: true }
      );
    });

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect(container).toHaveCSS('opacity', '0');
    await expect(trigger).toBeFocused();
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'chat-opacity-cancel' &&
                animation.playState === 'paused'
            )
        )
      )
      .toBe(true);

    await revealStyles.evaluate((element) => element.remove());

    await expect
      .poll(() =>
        container.evaluate((element) => element.getAnimations().length)
      )
      .toBe(0);
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.documentElement.dataset.chatFocusAfterCancellation ??
              null
          ),
        { timeout: 2000 }
      )
      .not.toBeNull();

    const focusStyle = JSON.parse(
      (await page.evaluate(
        () => document.documentElement.dataset.chatFocusAfterCancellation
      ))!
    ) as {
      opacity: string;
      transform: string;
    };

    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect(container).not.toHaveAttribute('inert', '');
    expect(focusStyle.opacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(
      focusStyle.transform
    );
  });

  test('keeps opening content out of the keyboard order until the reveal finishes', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');
    const prompt = page.locator('.ais-ChatPrompt-textarea');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect(container).toHaveCSS('opacity', '0');

    await page.addStyleTag({
      content: `
        @keyframes chat-keyboard-reveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ais-Chat-container--open {
          animation: chat-keyboard-reveal 10s linear paused;
        }
      `,
    });

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect(container).toHaveCSS('opacity', '0');
    await expect(trigger).toBeFocused();
    await expect(container).toHaveAttribute('inert', '');

    await page.keyboard.press('Shift+Tab');

    expect(
      await container.evaluate((element) =>
        element.contains(document.activeElement)
      )
    ).toBe(false);

    await container.evaluate((element) => {
      const reveal = element
        .getAnimations()
        .find(
          (animation) =>
            animation instanceof CSSAnimation &&
            animation.animationName === 'chat-keyboard-reveal'
        );

      if (!reveal) {
        throw new Error('Expected the paused keyboard reveal animation');
      }

      reveal.finish();
    });

    await expect(container).toHaveCSS('opacity', '1');
    await expect(container).not.toHaveAttribute('inert', '');
    await expect(prompt).toBeFocused();
  });

  test('waits when an existing reveal animation resumes', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');
    const prompt = page.locator('.ais-ChatPrompt-textarea');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect(container).toHaveCSS('opacity', '0');

    await page.addStyleTag({
      content: `
        @keyframes chat-resumed-reveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ais-Chat-container {
          animation: chat-resumed-reveal 10s linear both paused;
        }

        .ais-Chat-container--open {
          animation-play-state: running;
        }
      `,
    });

    await expect
      .poll(() =>
        container.evaluate((element) => {
          const animation = element
            .getAnimations()
            .find(
              (candidate) =>
                candidate instanceof CSSAnimation &&
                candidate.animationName === 'chat-resumed-reveal'
            );

          if (animation) {
            (
              animation as Animation & { observedBeforeOpen?: boolean }
            ).observedBeforeOpen = true;
          }

          return animation?.playState;
        })
      )
      .toBe('paused');

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect
      .poll(() =>
        container.evaluate((element) => {
          const animation = element
            .getAnimations()
            .find(
              (candidate) =>
                candidate instanceof CSSAnimation &&
                candidate.animationName === 'chat-resumed-reveal'
            ) as (Animation & { observedBeforeOpen?: boolean }) | undefined;

          return {
            sameAnimation: animation?.observedBeforeOpen === true,
            playState: animation?.playState,
          };
        })
      )
      .toEqual({ sameAnimation: true, playState: 'running' });
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).transform)
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect(container).not.toHaveCSS('opacity', '1');
    await expect(trigger).toBeFocused();

    await container.evaluate((element) => {
      const reveal = element
        .getAnimations()
        .find(
          (animation) =>
            animation instanceof CSSAnimation &&
            animation.animationName === 'chat-resumed-reveal'
        );

      if (!reveal) {
        throw new Error('Expected the resumed reveal animation');
      }

      reveal.finish();
    });

    await expect(container).toHaveCSS('opacity', '1');
    await expect(prompt).toBeFocused();
  });

  test('waits for a replacement reveal animation', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['js', 'react'].includes(String(testInfo.project.metadata.flavor)),
      'Chat is only available in the JavaScript and React examples'
    );

    await page.goto('../default-theme/');

    const container = page.locator('.ais-Chat-container');
    const trigger = page.locator('.ais-ChatToggleButton');
    const prompt = page.locator('.ais-ChatPrompt-textarea');

    await trigger.click();
    await page.locator('.ais-ChatHeader-close').click();
    await expect(container).toHaveAttribute('inert', '');
    await expect(container).toHaveCSS('opacity', '0');

    const initialRevealStyles = await page.addStyleTag({
      content: `
        @keyframes chat-initial-reveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ais-Chat-container--open {
          animation: chat-initial-reveal 10s linear paused;
        }
      `,
    });

    await trigger.click();
    await expect(container).toHaveClass(/ais-Chat-container--open/);
    await expect(container).toHaveCSS('opacity', '0');
    await expect(trigger).toBeFocused();
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === 'chat-initial-reveal' &&
                animation.playState === 'paused'
            )
        )
      )
      .toBe(true);
    await expect
      .poll(() =>
        container.evaluate((element) => getComputedStyle(element).transform)
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)');

    await container.evaluate((element) => {
      const replacement = element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 10000,
        fill: 'both',
      });
      replacement.pause();
      (
        replacement as Animation & { replacementReveal?: boolean }
      ).replacementReveal = true;
    });
    await initialRevealStyles.evaluate((element) => element.remove());

    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .every(
              (animation) =>
                !(animation instanceof CSSAnimation) ||
                animation.animationName !== 'chat-initial-reveal'
            )
        )
      )
      .toBe(true);
    await expect(container).toHaveCSS('opacity', '0');
    await expect
      .poll(() =>
        container.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                (animation as Animation & { replacementReveal?: boolean })
                  .replacementReveal === true &&
                animation.playState === 'paused'
            )
        )
      )
      .toBe(true);
    await expect(trigger).toBeFocused();

    await container.evaluate((element) => {
      const replacement = element
        .getAnimations()
        .find(
          (animation) =>
            (animation as Animation & { replacementReveal?: boolean })
              .replacementReveal === true
        );

      if (!replacement) {
        throw new Error('Expected the replacement reveal animation');
      }

      replacement.finish();
    });

    await expect(container).toHaveCSS('opacity', '1');
    await expect(prompt).toBeFocused();
  });
});
