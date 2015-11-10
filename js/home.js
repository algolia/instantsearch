/* global $, TweenMax, TimelineMax, ScrollMagic, Power2, Bounce */
'use strict';

$(function () {

  // init scroll magic
  var controller = new ScrollMagic.Controller({
    globalSceneOptions:{
      triggerHook:'onLeave'
    }
  });

  // get animation elements
  var windows = $('section.window');
  var $anim = $('#anim');
  var $overlay = $('#anim-overlay');
  var $spaceOverlay = $('#space-overlay');
  var $screens = $('.screen');
  var $widgets = $('.widget');
  var $widgetsTooltips = $('.widget-intro');
  var $illusSync = $('.illus-sync');
  var $screenshotWebsite = $('#screenshot-website');
  var $widgetsIcons = $('#anim-overlay img');
  var $animWidget1 = $anim.find('.widget-1');
  var $animWidget2 = $anim.find('.widget-2');
  var $animWidget3 = $anim.find('.widget-3');
  var $animWidget4 = $anim.find('.widget-4');
  var $animWidget5 = $anim.find('.widget-5');
  var $animWidget6 = $anim.find('.widget-6');
  var $animWidget7 = $anim.find('.widget-7');

  // Intro
  var intro = new TimelineMax();
  intro
    .set($screens, {opacity:0})
    .set($anim, {opacity:0, scale:0})
    .set($screenshotWebsite, {opacity:0})
    .set($overlay, {opacity:0})
    .set($widgetsIcons, {scale:0})
    .set($widgets, {opacity:0, scale:0})
    .to($anim, 2, {opacity:1, scale:1, rotationX:30, rotationZ:-6, ease:Power2.easeInOut})
    .to($screenshotWebsite, 1, {opacity:1}, '-=1')
    .to($animWidget1, 0.3, {scale:1 , opacity:1 })
    .to($animWidget2, 0.3, {scale:1 , opacity:1 })
    .to($animWidget3, 0.3, {scale:1 , opacity:1 })
    .to($animWidget4, 0.3, {scale:1 , opacity:1 }, '-=.2')
    .to($animWidget5, 0.3, {scale:1 , opacity:1 }, '-=.2')
    .to($animWidget6, 0.3, {scale:1 , opacity:1 }, '-=.2')
    .to($animWidget7, 0.3, {scale:1 , opacity:1 }, '-=.5')
    .to($overlay, 0.3, {opacity:1, ease:Power2.easeInOut }, '3.5')
    .to($widgetsIcons, 0.4, {scale:1, ease:Bounce.easeInOut }, '3.6');

  // An array to stock our timelines, relative to each sections
  var tl = [];
  // First Section
  tl[0] = new TimelineMax();
  tl[0]
    .to($widgetsTooltips, 2, {opacity:0})
    .to($widgets, 8, {z:400, opacity:0})
    .to($animWidget1, 8, {y:-350 }, '-=8')
    .to($animWidget3, 8, {x:-200, y:-50 }, '-=8')
    .to($animWidget4, 8, {x:-200 }, '-=8')
    .to($animWidget5, 8, {x:-200, y:50 }, '-=8')
    .to($animWidget6, 8, {x:-200, y:200 }, '-=8')
    .to($animWidget7, 8, {y:350 }, '-=8')
    .to($anim, 8, {opacity:1, scale:1, rotationX:0, rotationZ:0, ease:Power2.easeInOut}, '-=8')
    .to($illusSync, 4, {opacity:1}, '-=4')
    .to($spaceOverlay, 8, {backgroundColor:'#00B6BA' }, '0');

  // Second Section
  tl[1] = new TimelineMax();
  tl[1]
    .to($widgets, 0.2, {x:0, y:0, z:0, scale:0 })
    .to($illusSync, 3, {scale:0, opacity:0}, '+=3')
    .to($anim, 3, {scale:0.5 }, '-=3')
    .to($screenshotWebsite, 4, {opacity:0}, '-=5')
    .to('#anim > .widget', 2, {opacity:1, scale:1})
    .to('#screen-1', 3, {opacity:1})
    .to('#screen-1 .widget', 5, {opacity:1, scale:1},'-=2')
    .to('#screen-2', 3, {opacity:1})
    .to('#screen-2 .widget', 5, {opacity:1, scale:1},'-=2')
    .to('#screen-3', 3, {opacity:1})
    .to('#screen-3 .widget', 5, {opacity:1, scale:1},'-=2')
    .to($spaceOverlay, 8, {backgroundColor:'#F6624E' }, '0');

  // Third Section
  tl[2] = new TimelineMax();
  tl[2]
    .to($anim, 10, {scale:1, y:100, rotationX:20, rotationZ:-6, ease:Power2.easeInOut })
    .to($screens, 5, {opacity:0}, '-=8')
    .to($animWidget5, 4, {z:200})
    .to($animWidget5, 4, {rotationY:180, backgroundColor:'#674492'}, '-=2')
    .to($animWidget5, 4, {z:0})
    .to($spaceOverlay, 8, {backgroundColor:'#674492' }, '0');

  // Fourth Section
  tl[3] = new TimelineMax();
  tl[3]
    .to($anim, 12, {y:-400, rotationX:60}, '2s')
    .to($anim, 4, {opacity:0}, '5');

  // Create a scene for every window
  var scenes = [];
  for (var i=0; i<windows.length; i++) {

    scenes[i] = new ScrollMagic.Scene({
        triggerElement:windows[i],
        duration:800
      })
      .setTween(tl[i])
      .offset(20)
      // .addIndicators() // add indicators (requires plugin)
      .addTo(controller);
  }

  scenes[0].on('start', function () {
    intro.seek(20);
  });

  scenes[3].on('leave', function () {
    $('body:after').addClass('hide');
  });

  var isMenuOverWhite = false;
  $(window).load(checkMenuOverWhite)
  // change the menu to use black font when we arrive at the white background
  $(window).scroll(throttle(checkMenuOverWhite, 50));

  function checkMenuOverWhite() {
    var $navbar = $('.site-header .navbar');
    var $whiteBottom = $('.white-bottom');
    var currentIsMenuOverWhite = overlap($navbar, $whiteBottom);

    if (currentIsMenuOverWhite !== isMenuOverWhite) {
      isMenuOverWhite = currentIsMenuOverWhite;
      if (isMenuOverWhite) {
        TweenMax.to('header.site-header nav.navbar a', 0.1, {color:'rgba(0,0,0,1)'});
      } else {
        TweenMax.to('header.site-header nav.navbar a', 0.1, {color:'rgba(255,255,255,1)'});
      }
    }
  }
});


// Space Canvas

var canvas, context, screenH, screenW, stars = [], fps = 10, numStars = 200;

// Calculate the screen size
screenH = $(window).height();
screenW = $(window).width();

// Get the canvas
canvas = $('#space');

// Fill out the canvas
canvas.attr('height', screenH);
canvas.attr('width', screenW);
context = canvas[0].getContext('2d');

var x, y, len, opacity, star;

// Create all the stars
for (var i = 0; i < numStars; i++) {
  x = Math.round(Math.random() * screenW);
  y = Math.round(Math.random() * screenH);
  len = 1 + Math.random() * 2;
  opacity = Math.random();

  // Create a new star and draw
  star = new Star(x, y, len, opacity);

  // Add the the stars array
  stars.push(star);
}

setInterval(animate, 1000 / fps);

// Animate the canvas
function animate() {
  context.clearRect(0, 0, screenW, screenH);
  $.each(stars, function() {
    this.draw(context);
  });
}

// Star
function Star(x, y, length, opacity) {
  this.x = parseInt(x);
  this.y = parseInt(y);
  this.length = parseInt(length);
  this.opacity = opacity;
  this.factor = 1;
  this.increment = Math.random() * 0.03;
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

  context.beginPath();
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
  context.fillStyle = 'rgba(200, 200, 250, ' + this.opacity + ')';
  // context.shadowBlur = 5;
  // context.shadowColor = '#1D96C7';
  context.fill();
  context.restore();
};

// http://stackoverflow.com/questions/14012766/detecting-whether-two-divs-overlap
function overlap($div1, $div2) {
  var rect1 = $div1[0].getBoundingClientRect();
  var rect2 = $div2[0].getBoundingClientRect();

  return !(rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top + 80 ||
    rect1.top > rect2.bottom);
}

// https://remysharp.com/2010/07/21/throttling-function-calls
function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}
