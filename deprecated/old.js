'use strict';

const automata = require( './automata.js' );

const canvas = document.querySelector( 'canvas' );
const ctx = canvas.getContext( '2d' );

// Configurable variables
const _fr = 25; // frame rate, in ms
const _lrs = 0.0015; // Layer rotation scale
const _ird = 8; // Initial Radius Divisor
const _grd = 40; // Grow Radius Divisor
const _nl  = 6; // Number of block layers

// Sizing variables
let center = {};
let initRadius = 0;
let growRadius = 0;

const resize = function(){
  canvas.width  = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  initRadius = Math.round( Math.sqrt( Math.pow( canvas.width / _ird, 2 ), Math.pow( canvas.height / _ird, 2 ) ) );
  growRadius = Math.round( Math.sqrt( Math.pow( canvas.width / _grd, 2 ), Math.pow( canvas.height / _grd, 2 ) ) );

  center = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };
};

// Data Arrays
let fibb = [ 2, 3 ];
let renderData = [];
let nextData = [];

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
  resize();
  window.onresize = resize();

  for( let l = 0; l < _nl; l++ ){
    let trs = 0;

    if( l % 2 === 0 ){
      trs = _lrs;
    } else {
      trs = _lrs * -1;
    }

    renderData[ l ] = { r: [],
                       rs: trs };
    nextData[ l ] = [];
    fibb[ l + 2 ] = fibb[ l ] + fibb[ l + 1 ];

    for( let r = 0; r < fibb[ l + 2 ]; r++ ){
      const gen = Math.round( Math.random() ); // Each block's state is randomized to either 0 or 1
      const gA = 1 / fibb[ l + 2 ];
      const cA = r  * gA * 2;
      const nA = cA + gA * ( 4 / 3 );
      renderData[ l ].r[ r ] = { s: gen,
                                ca: cA,
                                na: nA };
      nextData[ l ][ r ] = { s: gen };
    }

    const t = 2 / fibb[ l + 2 ] / ( _lrs / _fr );
    setInterval( function(){
      calculateLayer( l );
    }, t );
  }

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

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height );
  drawBridges();
  drawNodes();
  tick();

  requestFrameRate( gameLoop );
};

const calculateLayer = function( l ){
  for( let r = 0; r < fibb[ l + 2 ]; r++ ){
    const ca2 = renderData[ l ].r[ r ].ca;
      let na2 = renderData[ l ].r[ r ].na;

    if( ca2 > na2 ){
      na2 += 2;
    }

    let cnc = 0;

    if( r + 1 !== fibb[ l + 2 ] ){
      if( renderData[ l ].r[ r + 1 ].s === 1 ){
        cnc++;
      }
    } else {
      if( renderData[ l ].r[ 0 ].s === 1 ){
        cnc++;
      }
    }

    if( r !== 0 ){
      if( renderData[ l ].r[ r - 1 ].s === 1 ){
        cnc++;
      }
    } else {
      if( renderData[ l ].r[ fibb[ l + 2 ] - 1 ].s === 1 ){
        cnc++;
      }
    }

    if( l !== 0 ){
      for( let i = 0; i < fibb[ l + 1 ]; i++ ){
        if( renderData[ l - 1 ].r[ i ].s !== 1 ){
          continue;
        }

        const ca1 = renderData[ l - 1 ].r[ i ].ca;
          let na1 = renderData[ l - 1 ].r[ i ].na;

        if( ca1 > na1 ){
          na1 += 2;
        }

        if( ( ca1 < na2 && ca2 < na1 ) || ( na1 > 2 && ca2 < na1 ) ){
          cnc++;
        }
      }
    }

    if( l + 1 !== _nl ){
      for( let o = 0; o < fibb[ l + 3 ]; o++ ){
        if( renderData[ l + 1 ].r[ o ].s !== 1 ){
          continue;
        }

        const ca3 = renderData[ l + 1 ].r[ o ].ca;
          let na3 = renderData[ l + 1 ].r[ o ].na;

        if( ca3 > na3 ){
          na3 += 2;
        }

        if( ( ca2 < na3 && ca3 < na2 ) || ( na2 > 2  && ca3 < na2 ) ){
          cnc++;
        }
      }
    }

    if( cnc == 2 ){
      nextData[ l ][ r ].s = 1;
    }

    if( cnc >= 3 ){
      nextData[ l ][ r ].s = 0;
    }
  }

  // function call to assure the for loop runs before this edit
  editLayer( l );
}

const editLayer = function( l ){
  for( let r = 0; r < fibb[ l + 2 ]; r++ ){
    renderData[ l ].r[ r ].s = nextData[ l ][ r ].s;
  }
}

const drawBridges = function(){
  ctx.lineWeight = 1;
  ctx.strokeStyle = 'green';
  ctx.beginPath();
  ctx.moveTo( center.x, center.y );
  ctx.lineTo( center.x * 2,  center.y );
  ctx.stroke();

  // block-loop iteration, to detect neighbor states
  for( let l = 0; l < _nl; l++ ){
    const cr1 = initRadius + l * growRadius * 2 + growRadius * 0.5;
    const cr2 = cr1 + growRadius * 2;

    for( let r = 0; r < fibb[ l + 2 ]; r++ ){
      const ca1 = renderData[ l ].r[ r ].ca;
        let na1 = renderData[ l ].r[ r ].na;

      if( ca1 > na1 ){
        na1 += 2;
      }

      const ac1 = ( ca1 + na1 ) / 2 * Math.PI;

      let cnc = 0;

      ctx.lineWeight = 1;
      if( r + 1 !== fibb[ l + 2 ] ){
        if( renderData[ l ].r[ r ].s === 1 || renderData[ l ].r[ r + 1 ].s === 1 ){
          ctx.strokeStyle = 'yellow';
        } else {
          ctx.strokeStyle = 'red';
        }

        ctx.beginPath();
        ctx.arc( center.x, center.y, cr1, renderData[ l ].r[ r ].na * Math.PI, renderData[ l ].r[ r + 1 ].ca * Math.PI, false );
        ctx.stroke();
      } else {
        if( renderData[ l ].r[ r ].s === 1 || renderData[ l ].r[ 0 ].s === 1 ){
          ctx.strokeStyle = 'yellow';
        } else {
          ctx.strokeStyle = 'red';
        }

        ctx.beginPath();
        ctx.arc( center.x, center.y, cr1, renderData[ l ].r[ r ].na * Math.PI, renderData[ l ].r[ 0 ].ca * Math.PI, false );
        ctx.stroke();
      }

      // This block requires a greater layer than context layer to exist
      if( l + 1 !== _nl ){
        // Iterating throug the layer above the scan
        for( let o = 0; o < fibb[ l + 3 ]; o++ ){
          const ca2 = renderData[ l + 1 ].r[ o ].ca;
            let na2 = renderData[ l + 1 ].r[ o ].na;

          if( ca2 > na2 ){
            na2 += 2;
          }

          if( ( ca1 < na2 && ca2 < na1 ) ||
              ( na1 > 2 && ca2 + 2 < na1 ) ){

            const ac2 = ( ca2 + na2 ) / 2 * Math.PI;

            if( renderData[ l ].r[ r ].s === 1 || renderData[ l + 1 ].r[ o ].s === 1 ){
              ctx.strokeStyle = 'yellow';
            } else {
              ctx.strokeStyle = 'red';
            }

            ctx.beginPath();
            ctx.moveTo( center.x + cr1 * Math.cos( ac1 ),
                        center.y + cr1 * Math.sin( ac1 ) );
            ctx.lineTo( center.x + cr2 * Math.cos( ac2 ),
                        center.y + cr2 * Math.sin( ac2 ) );
            ctx.stroke();
          }
        }
      }
    }
  }
};

const drawNodes = function(){
  for( let l = 0; l < _nl; l++ ){
    const gA = 1 / fibb[ l + 2];
    const sR = initRadius + l * growRadius * 2;
    const cR = sR + growRadius;

    for( let r = 0; r < fibb[ l + 2 ]; r++ ){
      const cA = renderData[ l ].r[ r ].ca * Math.PI;
      const nA = renderData[ l ].r[ r ].na * Math.PI;

      ctx.beginPath();
      ctx.moveTo( center.x + sR * Math.cos( cA ),
                  center.y + sR * Math.sin( cA ) );
      ctx.arc( center.x,
               center.y,
               sR,
               cA,
               nA,
               false );
      ctx.arc( center.x,
               center.y,
               cR,
               nA,
               cA,
               true );
      ctx.lineTo( center.x + sR * Math.cos( cA ),
                  center.y + sR * Math.sin( cA ),
                  center.x + ( cR ) * Math.cos( cA ),
                  center.y + ( cR ) * Math.sin( cA ) );
      ctx.closePath();

      if( renderData[ l ].r[ r ].s === 0 ){
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = 'black';
        ctx.fill();
      }
    }
  }
};

const tick = function(){
  for( let l = 0; l < _nl; l++ ){
    for( let r = 0; r < fibb[ l + 2 ]; r++ ){
      if( l % 2 === 0 ){
        renderData[ l ].r[ r ].ca += _lrs;
        renderData[ l ].r[ r ].ca = renderData[ l ].r[ r ].ca % 2;

        renderData[ l ].r[ r ].na += _lrs;
        renderData[ l ].r[ r ].na = renderData[ l ].r[ r ].na % 2;
      } else {
        renderData[ l ].r[ r ].ca -= _lrs;
        renderData[ l ].r[ r ].na -= _lrs;
        if( renderData[ l ].r[ r ].ca < 0 ){
            renderData[ l ].r[ r ].ca += 2;
        }
        if( renderData[ l ].r[ r ].na < 0 ){
            renderData[ l ].r[ r ].na += 2;
        }
      }
    }
  }
};

init();

/*
render(){
  for( let l = 0; l < this.nl; l++ ){
    const t_ga = 1 / this.fa[ l + 2 ];
    const t_sr = this.rm.cir + l * this.rm.crg * 2;
    const t_er = t_sr + this.rm.crg;

    for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
      const t_sa = this.rd[ l ].cna[ r ].sa * Math.PI;
      const t_ea = this.rd[ l ].cna[ r ].ea * Math.PI;

      this.rm.drawNode( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );
    }
  }
},
*/
