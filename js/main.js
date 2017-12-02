'use strict';

// Configure variables
const c_nnl = 5; // Number of node layers
const c_ifa = [ 2, 3 ]; // Initial Fibbonachi Array
const c_lrs = 1 / 10000; // Layer Rotation Scale, divsor is time in milliseconds required for one full rotation
let crd = 10; // Canvas-scaled Radius Divisor;
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
  automata.rm.drawFloaters();
  if( automata.dm === "all" ){
    automata.renderBridges();
    automata.renderNodes();
  } else {
    automata.renderNodes();
  }

  requestFrameRate( gameLoop );
};

window.onload = function(){
  init();

  let center = document.querySelector( 'section' );
  let panel  = document.querySelector( 'div' );
  let muteButton = document.querySelector( 'button.mute' );
  let drawButton = document.querySelector( 'button.draw' );

  let panelSwap = function(){
    if( panel.classList.contains( 'overlay' ) ){
      panel.classList.remove( 'overlay' );
      center.classList.remove( 'active' );
    } else {
      panel.className += 'overlay';
      center.className += 'active';
    }
  };

  center.onclick = panelSwap;

  muteButton.onclick = function(){
    const status = automata.am.mute;
    if( status ){
      muteButton.innerHTML = "Mute";
      automata.am.switchMute();
    } else {
      muteButton.innerHTML = "Unmute";
      automata.am.switchMute();
    }
  };

  drawButton.onclick = function(){
    const status = automata.dm;
    if( status === "minim" ){
      drawButton.innerHTML = "allNodes";
      automata.dm = "allNodes";
    } else if( status === "allNodes"){
      drawButton.innerHTML = "all";
      automata.dm = "all";
    } else if( status === "all"){
      drawButton.innerHTML = "minim";
      automata.dm = "minim";
    }
  }
};
