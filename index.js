'use strict';

// Configure variables
const c_nnl = 5; // Number of node layers
const c_ifa = [ 2, 3 ]; // Initial Fibbonachi Array
const c_lrs = 2 / 20000; // Layer Rotation Scale, divsor is time required for one full rotation

let crd = 10; // Canvas-sacled Radius Divisor
let crg = 10; // Canvas-scaled Radius Growth

const Automata = require( './automata.js' );
const automata = Automata.create( c_nnl, c_ifa, c_lrs, crd, crg );

window.requestFrameRate = ( function(){
  return  window.requestAnimationFrame        ||
          window.webkitRequestAnimationFrame  ||
          window.mozRequestAnimationFrame     ||
          window.oRequestAnimationFrame       ||
          window.msRequestAnimationFrame      ||
  function( callback, element ){
    window.setTimeout( function(){
      callback( +new Date );
    }, 1000 / 60 );
  };
})();

const init = function(){
  automata.initialize();
  gameLoop();
};

// Frame rate variables
let tbr = 0; // time between requests
let lrc;     // last called time

const gameLoop = function(){
  if( !lrc ){
    lrc = new Date().getTime();
    requestFrameRate( gameLoop );
    return;
  }

  let delta = ( new Date().getTime() - lrc );
  lrc = new Date().getTime();
  tbr = 1 / delta;

  automata.cycle( tbr );
  automata.rm.clear();
  automata.render();
  //automata.displayFrameRate( delta );

  requestFrameRate( gameLoop );
};

init();
