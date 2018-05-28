function move() {
  const mover = args => {
    const item = args.element;
    const threesold = item.dataset.threesold;
    const axis = item.dataset.move;
    const factor = item.dataset.factor;
    const xtraTransform = item.dataset.xtraTransform || null;
    let start = null;

    // eslint-disable-next-line no-shadow
    function moveEl(timestamp, axis) {
      if (!start) start = timestamp;
      const progress = timestamp - start;

      const value = window.scrollY;

      if (value <= (threesold * factor) / 2) {
        if (axis === '-y') {
          // eslint-disable-next-line no-unused-expressions
          xtraTransform
            ? (item.style.cssText = `transform: translateY(-${(value / factor) *
                (threesold / factor)}px) ${xtraTransform}`)
            : (item.style.cssText = `transform: translateY(-${(value / factor) *
                (threesold / factor)}px)`);
        } else if (axis === '-x') {
          // eslint-disable-next-line no-unused-expressions
          xtraTransform
            ? (item.style.cssText = `transform: translateX(-${(value / factor) *
                (threesold / factor)}px) ${xtraTransform}`)
            : (item.style.cssText = `transform: translateX(-${(value / factor) *
                (threesold / factor)}px)`);
        } else if (axis === '+y') {
          // eslint-disable-next-line no-unused-expressions
          xtraTransform
            ? (item.style.cssText = `transform: translateY(${(value / factor) *
                (threesold / factor)}px) ${xtraTransform}`)
            : (item.style.cssText = `transform: translateY(${(value / factor) *
                (threesold / factor)}px)`);
        } else if (axis === '+x') {
          // eslint-disable-next-line no-unused-expressions
          xtraTransform
            ? (item.style.cssText = `transform: translateX(${(value / factor) *
                (threesold / factor)}px) ${xtraTransform}`)
            : (item.style.cssText = `transform: translateX(${(value / factor) *
                (threesold / factor)}px)`);
        }
      }

      if (progress < 2000) {
        window.requestAnimationFrame(moveEl);
      }
    }

    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(timestamp => {
        moveEl(timestamp, axis);
      });
    });
  };

  const animatedElement = document.querySelectorAll('[data-move]');
  animatedElement.forEach((e, s) => {
    mover({
      element: animatedElement[s],
    });
  });
}

export default move;
