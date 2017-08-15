function move() {
  let mover = (args) => {
    let item = args.element;
    let threesold = item.dataset.threesold;
    let axis = item.dataset.move;
    let factor = item.dataset.factor;
    let xtraTransform = item.dataset.xtraTransform || null;
    let start = null;

    function moveEl(timestamp, axis) {

      if (!start) start = timestamp;
      var progress = timestamp - start;

      let value = window.scrollY;

      if ( value <= ((threesold * factor) / 2)){
        if (axis === '-y'){
          xtraTransform ? item.style.cssText = `transform: translateY(-${(value/factor) * (threesold/factor)}px) ${xtraTransform}` : item.style.cssText = `transform: translateY(-${(value/factor) * (threesold/factor)}px)`;
        } else if (axis === '-x') {
          xtraTransform ? item.style.cssText = `transform: translateX(-${(value/factor) * (threesold/factor)}px) ${xtraTransform}` : item.style.cssText = `transform: translateX(-${(value/factor) * (threesold/factor)}px)`;
        } else if (axis === '+y') {
          xtraTransform ? item.style.cssText = `transform: translateY(${(value/factor) * (threesold/factor)}px) ${xtraTransform}` : item.style.cssText = `transform: translateY(${(value/factor) * (threesold/factor)}px)`;
        } else if (axis === '+x') {
          xtraTransform ? item.style.cssText = `transform: translateX(${(value/factor) * (threesold/factor)}px) ${xtraTransform}` : item.style.cssText = `transform: translateX(${(value/factor) * (threesold/factor)}px)`;
        }
      }

      if (progress < 2000) {
        window.requestAnimationFrame(moveEl);
      }
    }

    window.addEventListener('scroll', e => {
      window.requestAnimationFrame(function(timestamp) {
        moveEl(timestamp, axis)
      });

    })

  }


  let animatedElement = document.querySelectorAll('[data-move]');
  animatedElement.forEach( (e,s) => {
    mover({
      element: animatedElement[s]
    });
  })
}

export default move;
