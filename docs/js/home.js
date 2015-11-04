$(function () {

  // init scroll magic
  var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
      triggerHook: 'onLeave'
    }
  });

  // get all section window
  var windows = $("section.window");

  //intro
  var intro = new TimelineMax();
  intro
    .set(".screen", {opacity: 0})
    .set("#anim", {opacity: 0, scale: 0})
    .set("#anim img", {opacity: 0})
    .set("#anim-overlay", {opacity: 0})
    .set("#anim-overlay img", {scale: 0})
    .set(".widget", {opacity: 0, scale: 0})
    .to("#anim", 2, {opacity: 1, scale: 1, rotationX: 30, rotationZ: -6, ease:Power2.easeInOut})
    .to("#anim img", 1, {opacity: 1}, "-=1")
    .to(".widget-1", .3, {scale:1 , opacity:1 })
    .to(".widget-2", .3, {scale:1 , opacity:1 })
    .to(".widget-3", .3, {scale:1 , opacity:1 })
    .to(".widget-4", .3, {scale:1 , opacity:1 }, "-=.2")
    .to(".widget-5", .3, {scale:1 , opacity:1 }, "-=.2")
    .to(".widget-6", .3, {scale:1 , opacity:1 }, "-=.2")
    .to(".widget-7", .3, {scale:1 , opacity:1 }, "-=.5")
    .to("#anim-overlay", .3, {opacity: 1, ease:Power2.easeInOut }, "3.5")
    .to("#anim-overlay img", .4, {scale: 1, ease:Bounce.easeOut }, "3.6");

  // an array to stock our timelines, relative to each sections
  var tl = [];
  // First Section: There is a widget
  tl[0] = new TimelineMax();
  tl[0]
    .to(".widget-intro", 2, {opacity: 0})
    .to(".widget", 8, {z: 400, opacity: 0})
    .to(".widget-1", 8, {y: -350 }, "-=8")
    .to(".widget-3", 8, {x: -200, y: -50 }, "-=8")
    .to(".widget-4", 8, {x: -200 }, "-=8")
    .to(".widget-5", 8, {x: -200, y: 50 }, "-=8")
    .to(".widget-6", 8, {x: -200, y: 200 }, "-=8")
    .to(".widget-7", 8, {y: 350 }, "-=8")
    .to("#anim", 8, {opacity: 1, scale: 1, rotationX: 0, rotationZ: 0, ease:Power2.easeInOut}, "-=8")
    .to(".illus-sync", 4, {opacity:1}, "-=4")
    .to('#space-overlay', 8, {backgroundColor:'#00B6BA' }, "0");

  // First Section: There is a widget
  tl[1] = new TimelineMax();
  tl[1]
    .to(".widget", .2, {x: 0, y: 0, z: 0, scale: 0 })
    .to(".illus-sync", 3, {scale: 0, opacity: 0})
    .to("#anim", 5, {scale: .5 })
    .to("#anim img", 4, {opacity: 0}, "-=8")
    .to("#anim > .widget", 2, {opacity: 1, scale: 1})
    .to(".screen-1", 3, {opacity: 1})
    .to(".screen-1 .widget", 5, {opacity: 1, scale: 1},"-=2")
    .to(".screen-2", 3, {opacity: 1})
    .to(".screen-2 .widget", 5, {opacity: 1, scale: 1},"-=2")
    .to(".screen-3", 3, {opacity: 1})
    .to(".screen-3 .widget", 5, {opacity: 1, scale: 1},"-=2")
    .to('#space-overlay', 8, {backgroundColor:'#F6624E' }, "0");

  // First Section: There is a widget
  tl[2] = new TimelineMax();
  tl[2]
    .to("#anim", 10, {scale: 1, y:100, rotationX: 20, rotationZ: -6, ease:Power2.easeInOut })
    .to(".screen", 5, {opacity: 0}, "-=8")
    .to(".widget-5", 8, {z: 200})
    .to(".widget-5", 4, {rotationY: 180, backgroundColor:'#674492'}, "-=4")
    .to(".widget-5", 4, {z: 0})
    .to('#space-overlay', 8, {backgroundColor:'#674492' }, "0");

  tl[3] = new TimelineMax();
  tl[3]
    .to("#anim", 12, {y: -400, rotationX: 60}, "2s")
    .to("#anim", 4, {opacity: 0}, "5");

  // create scene for every window
  var scenes = [];
  for (var i=0; i<windows.length; i++) {

    scenes[i] = new ScrollMagic.Scene({
        triggerElement: windows[i],
        duration: 800
      })
      .setTween(tl[i])
      .offset(20)
      .addIndicators() // add indicators (requires plugin)
      .addTo(controller);
  };

  scenes[0].on("start", function (event) {
    intro.seek(20);
  });

  scenes[3].on("leave", function (event) {
    $('body:after').addClass('hide');
  });





  // Space Canvas

  var canvas;
  var context;
  var screenH;
  var screenW;
  var stars = [];
  var fps = 30;
  var numStars = 300;

  // Calculate the screen size
  screenH = $(window).height();
  screenW = $(window).width();

  // Get the canvas
  canvas = $('#space');

  // Fill out the canvas
  canvas.attr('height', screenH);
  canvas.attr('width', screenW);
  context = canvas[0].getContext('2d');

  // Create all the stars
  for (var i = 0; i < numStars; i++) {
    var x = Math.round(Math.random() * screenW);
    var y = Math.round(Math.random() * screenH);
    var length = 1 + Math.random() * 2;
    var opacity = Math.random();

    // Create a new star and draw
    var star = new Star(x, y, length, opacity);

    // Add the the stars array
    stars.push(star);
  }
  setInterval(animate, 1000 / fps);

  // Animate the canvas
  function animate() {
    context.clearRect(0, 0, screenW, screenH);
    $.each(stars, function() {
      this.draw(context);
    })
  }

  // Star
  function Star(x, y, length, opacity) {
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.length = parseInt(length);
    this.opacity = opacity;
    this.factor = 1;
    this.increment = Math.random() * .03;
  }

  // Draw a star
  Star.prototype.draw = function() {
    context.rotate((Math.PI * 1 / 10));

    // Save the context
    context.save();

    // move into the middle of the canvas, just to make room
    context.translate(this.x, this.y);

    // Change the opacity
    if (this.opacity > 1) {
      this.factor = -1;
    } else if (this.opacity <= 0) {
      this.factor = 1;
      this.x = Math.round(Math.random() * screenW);
      this.y = Math.round(Math.random() * screenH);
    }

    this.opacity += this.increment * this.factor;

    context.beginPath()
    for (var i = 5; i--;) {
      context.lineTo(0, this.length);
      context.translate(0, this.length);
      context.rotate((Math.PI * 2 / 10));
      context.lineTo(0, -this.length);
      context.translate(0, -this.length);
      context.rotate(-(Math.PI * 6 / 10));
    }
    context.lineTo(0, this.length);
    context.closePath();
    context.fillStyle = "rgba(200, 200, 250, " + this.opacity + ")";
    // context.shadowBlur = 5;
    // context.shadowColor = '#1D96C7';
    context.fill();
    context.restore();
  }

});
