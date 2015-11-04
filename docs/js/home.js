$(function () {

  // init scroll magic
  var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
      triggerHook: 'onLeave'
    }
  });

  // get all section window
  var windows = $("section.window");

  // an array to stock our timelines, relative to each window
  var tl = [];


  // First Section: There is a widget
  tl[0] = new TimelineMax();
  tl[0]
    .to("#anim", .5, {scale: .5, autoAlpha: .5, ease:Back.easeOut})



  // create scene for every window
  var scenes = [];
  for (var i=0; i<windows.length; i++) {

    scenes[i] = new ScrollMagic.Scene({
        triggerElement: windows[i],
        duration: 600
      })
      // .setPin("#target", {pushFollowers: false})
      .setTween(tl[i])
      .offset(20)
      .addIndicators() // add indicators (requires plugin)
      .addTo(controller);
  };

  function floatingWidgets(){
    // TweenMax.to(".widget", 1, {opacity: .4 });
    TweenMax.fromTo(".widget-1", 2,
      {z: 40},
      {z: 90, repeat: -1, yoyo: true, ease: Power2.linear}
    );
    TweenMax.fromTo(".widget-3", 2,
      {z: 40},
      {z: 80, repeat: -1, yoyo: true, ease: Power2.linear}
    );
    TweenMax.fromTo(".widget-2, .widget-4", 2,
      {z: 40},
      {z: 70, repeat: -1, yoyo: true, ease: Power2.linear}
    );
    TweenMax.fromTo(".widget-5", 2,
      {z: 40},
      {z: 60, repeat: -1, yoyo: true, ease: Power2.linear}
    );
    TweenMax.fromTo(".widget-6, .widget-7", 2,
      {z: 40},
      {z: 50, repeat: -1, yoyo: true, ease: Power2.linear}
    );
  };


  function fadeScaleInWidgets(){
    TweenMax.to(".widget-1", .5, {scale:1 , opacity:1 }).delay(2.2);
    TweenMax.to(".widget-2", .5, {scale:1 , opacity:1 }).delay(2.2);
    TweenMax.to(".widget-3", .5, {scale:1 , opacity:1 }).delay(2.2);
    TweenMax.to(".widget-4", .5, {scale:1 , opacity:1 }).delay(2.3);
    TweenMax.to(".widget-5", .5, {scale:1 , opacity:1 }).delay(2.4);
    TweenMax.to(".widget-6", .5, {scale:1 , opacity:1 }).delay(2.5);
    TweenMax.to(".widget-7", .5, {scale:1 , opacity:1 }).delay(2.2);
  };

  function combineWidgets(){
    TweenMax.to("#anim", .5, {rotationX: 0, rotationZ:0, ease:Power2.easeInOut });
    TweenMax.to("#anim", .5, {scale: .5});
    TweenMax.to(".screen", .3, {opacity: 1});
    TweenMax.fromTo(".screen-1", 1,
      {scale: 0},
      {scale: 1}
    ).delay(.4);
    TweenMax.fromTo(".screen-2", 1,
      {scale: 0},
      {scale: 1}
    ).delay(.6);
    TweenMax.fromTo(".screen-3", 1,
      {scale: 0},
      {scale: 1}
    ).delay(.8);
  };

  function themeWidgets(color){
    TweenMax.to(".widget", .2, {backgroundColor: color });
  };

  function fadeScaleOutWidgets(){
    TweenMax.to(".widget", .2, {z: 0, opacity:0, scale:0 });
  };


    TweenMax.to(".widget-1", .5, {scale:1 , opacity:1 }).delay(3.2);
    TweenMax.to(".widget-2", .5, {scale:1 , opacity:1 }).delay(3.2);
    TweenMax.to(".widget-3", .5, {scale:1 , opacity:1 }).delay(3.2);
    TweenMax.to(".widget-4", .5, {scale:1 , opacity:1 }).delay(3.3);
    TweenMax.to(".widget-5", .5, {scale:1 , opacity:1 }).delay(3.4);
    TweenMax.to(".widget-6", .5, {scale:1 , opacity:1 }).delay(3.5);
    TweenMax.to(".widget-7", .5, {scale:1 , opacity:1 }).delay(3.2);


  TweenMax.fromTo("#anim img", 1.4,
      {opacity: 0},
      {opacity: 1, ease:Power2.easeInOut}
    ).delay(1.6);

  TweenMax.fromTo("#anim", 3,
      {opacity: 1, scale: 0},
      {opacity: 1, scale: 1, rotationX: 30, rotationZ: -6, ease:Power2.easeInOut}
    ).delay(1);

  TweenMax.fromTo("#anim-overlay", 2,
      {opacity: 0},
      {opacity: 1, ease:Power2.easeInOut }
    ).delay(3.4);

  TweenMax.fromTo("#anim-overlay img", .2,
      {scale: 0},
      {scale: 1}
    ).delay(4);

  TweenMax.set(".widget", {opacity: 0, scale: 0});
  // fadeScaleInWidgets();

  TweenMax.to(".screen", 1, {opacity: 1});
  // TweenMax.to("#anim", 2, {rotationX: 30, rotationZ:-6, ease:Power2.easeInOut });

  scenes[0].on("start", function (event) {
    TweenMax.to('#space-overlay', 1, {backgroundColor:'#1D96C7' });
    // console.log("Hit start point of scene 1.");
    // floatingWidgets();
  });

  scenes[1].on("start", function (event) {
    // console.log("Hit start point of scene 2.");
    TweenMax.to(".widget-intro", .2, {opacity:0});

    TweenMax.to("#anim", .5, {rotationX: 0, rotationZ: 0, ease:Power2.easeInOut });

    fadeScaleOutWidgets();
    // combineWidgets();
    TweenMax.to('#space-overlay', 1, {backgroundColor:'#F6624E' });
  });

  scenes[2].on("start", function (event) {
    // console.log("Hit start point of scene 2.");
    TweenMax.to("#anim-overlay", .5, {opacity:0});
    // fadeScaleOutWidgets();
    // fadeScaleInWidgets();
    // combineWidgets();
    TweenMax.to('#space-overlay', 1, {backgroundColor:'#F6624E' });
  });

  scenes[3].on("start", function (event) {
    TweenMax.to( '.anim-container', 1, {css:{position:'absolute', top: 400, left: 0}});

  });
  scenes[3].on("leave", function (event) {
    $('body:after').addClass('hide');
    TweenMax.to('.anim-container', .3, {css:{position:'fixed', top: 240, left: 0}});
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

