/* global $, TweenMax, TimelineMax, ScrollMagic, Power2, Bounce, THREE */

'use strict';

// Park-Miller-Carta Pseudo-Random Number Generator
// https://github.com/pnitsch/BitmapData.js/blob/master/js/BitmapData.js
var PRNG = function () {
  this.seed = 1;
  this.next = function() {
    return ( this.gen() / 2147483647 );
  };
  this.nextRange = function( min, max ) {
    return min + ( ( max - min ) * this.next() )
  };
  this.gen = function() {
    return this.seed = ( this.seed * 16807 ) % 2147483647;
  };
};

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
});

document.addEventListener('DOMContentLoaded', function(){
  var threeScript = document.createElement('script');
  threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r75/three.min.js';
  threeScript.addEventListener('load', function(){
    var $space = document.querySelector('#space');
    var rand = new PRNG();

    var radiusScene = 10000;
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 1/radiusScene);

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    var camera = new THREE.PerspectiveCamera( 55, .66, 0.1, radiusScene * 10 );

    var setSize = function setSize() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var aspect = width / height;
      camera.aspect = aspect;
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    setSize();
    window.addEventListener('resize', setSize);

    $space.appendChild(renderer.domElement);

    var particles = new THREE.Geometry();
    var sphere = new THREE.Sphere(new THREE.Vector3(0,0,0), radiusScene);
    var rand1 = function() {
      return rand.nextRange(-radiusScene, radiusScene);
    };

    for (var i = 0; i < 30000; i++ ){
      var p = new THREE.Vector3(rand1(), rand1(), rand1());
      p = sphere.clampPoint(p);
      particles.vertices.push(p);
    }

    var pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 1,
      sizeAttenuation: false,
      alphaTest: 0.5,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    var particleSystem = new THREE.Points(particles, pMaterial);

    scene.add(particleSystem);

    camera.position.z = -1500;
    camera.position.y = 1500;

    camera.rotation.x = -Math.PI / 2 + 0.5;

    var epsilon = 0.001;
    var timelineMap = function(x) {
      var res = x;
      if (x > 200) res += 30 * Math.max((Math.min(x, 800) - 200), 0);
      if (x > 1100) res += 30 * Math.max((Math.min(x, 1700) - 1100), 0);
      if (x > 2000) res += 30 * Math.max((Math.min(x, 2600) - 2000), 0);
      return res / 100;/// 100;
    };
    var currentTSpring = 0;
    var previousTSping = null;
    var render = function () {
      requestAnimationFrame( render );

      var dt = timelineMap(window.scrollY);

      currentTSpring += (dt - currentTSpring) / 10;
      if ((dt + epsilon) > currentTSpring && (dt - epsilon) < currentTSpring) currentTSpring = dt;

      if (previousTSping === currentTSpring) return;
      previousTSping = currentTSpring;

      var angle = currentTSpring/60;

      particleSystem.rotation.y = -angle;
      renderer.render(scene, camera);
    };

    render();
    $space.className = 'loaded';
  });
  document.body.appendChild(threeScript);
});


// Banner Marketing
function banner() {
  let header = document.querySelector('.ac-nav');
  let banner = document.querySelector('.marketing-banner');
  let bannerHeight = banner.offsetHeight;
  let headerHeight = header.offsetHeight;
  let close = document.querySelector('.banner-close');

  let inThreeMonth = new Date();
  inThreeMonth.setMonth(inThreeMonth.getMonth() + 3);

  // Cookies === js-cookie https://github.com/js-cookie/js-cookie
  if (Cookies.get('showRCv2') === undefined) {
    Cookies.set('showRCv2', true, {expires: 30}); // days
  }

  /* Second security - force banner to offset */
  banner.style.webkitTransform = `translateY(-${bannerHeight}px)`;
  banner.style.transform = `translateY(-${bannerHeight}px)`;

  /* Open banner after X seconds */
  if ( Cookies.getJSON('showRCv2') === true) {
    setTimeout( () => {
      banner.style.webkitTransform = `translateY(${headerHeight}px)`;
      banner.style.transform = `translateY(${headerHeight}px)`;
    }, 200);
  }

  /* Close banner if cross clicked */
  close.addEventListener('click', () => {
    if (Cookies.getJSON('showRCv2') === true) { // handle multiple clicks
      banner.style.webkitTransform = `translateY(-${bannerHeight}px)`;
      banner.style.transform = `translateY(-${bannerHeight}px)`;
      Cookies.set('showRCv2', false, {expires: 30});
    }
  });
}
banner();
