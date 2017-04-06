(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Render = require( './render.js' );

// Closure 'private' function
const applyRules = function( obj, p_cnc, p_l, p_r ){
  if( p_cnc == 2 ){
    obj.nd[ p_l ][ p_r ].ls = true;
  }

  if( p_cnc >= 3 ){
    obj.nd[ p_l ][ p_r ].ls = false;
  }
};

let Automata = {
  // Requires parameters of:
  // p_nl aka: Number of Layers
  // p_fa aka: Fibbonachi Array
  // p_rs aka: Rotation Scale
  // p_rd aka: Radius Divisor
  // p_rg aka: Radius Growth
  // p_fr aka: Frame Rate
  create( p_nl, p_fa, p_rs, p_fr, p_rd, p_rg ){
    const automata = Object.create( this );
    Object.assign( automata, {
      nl: p_nl,
      fa: p_fa,
      rs: p_rs,
      fr: p_fr,
      rm: Render.create( p_rd, p_rg ),
      rd: [], // rendering data
      nd: [] // next iteration Data
    });

    return automata;
  },

  initialize(){
    this.rm.refit();

    for( let l = 0; l< this.nl; l++ ){
      let trs = 0;
      if( l % 2 === 0 ){
        trs = this.rs;
      } else {
        trs = this.rs * -1;
      }

      this.rd[ l ] = {
        cna: [], // circumference node array
        lrs: trs // layer rotation scale
      };

      this.nd[ l ] = [];
      this.fa[ l + 2 ] = this.fa[ l ] + this.fa[ l + 1 ];

      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        const t_gen = Math.round( Math.random() ); // Each block's state is randomized to either 0 or 1
        const t_gan = 1 / this.fa[ l + 2 ];
        const t_san = r * t_gan * 2;
        const t_ean = t_san + t_gan * ( 4 / 3 );
        let t_ls;

        if( t_gen === 1 ){
          t_ls = true;
        } else {
          t_ls = false;
        }

        this.rd[ l ].cna[ r ] = {
         ls: t_ls, // life state
         sa: t_san,
         ea: t_ean
        };

        this.nd[ l ][ r ] = {
          ls: t_ls
        };
      }

      const t_time = 2 / this.fa[ l + 2 ] / ( this.rs / this.fr );
      setInterval( function(){
        calculate( l );
      }, t_time );
    }
  },

  render(){
    for( let l = 0; l < this.nl; l++ ){
      const t_ga = 1 / this.fa[ l + 2 ];
      const t_sr = this.rm.cir + l * this.rm.crg * 2;
      const t_er = t_sr + this.rm.crg;

      const t_cr1 = this.rm.cir + l * this.rm.crg * 2 + this.rm.crg * 0.5;
      const t_cr2 = t_cr1 + this.rm.crg * 2;

      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        const t_sa = this.rd[ l ].cna[ r ].sa * Math.PI;
        const t_ea = this.rd[ l ].cna[ r ].ea * Math.PI;

        this.rm.drawNode( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );

        const t_sa1 = this.rd[ l ].cna[ r ].sa;
          let t_ea1 = this.rd[ l ].cna[ r ].ea;

        if( t_sa1 > t_ea1 ){
          t_ea1 += 2;
        }

        const t_ac1 = ( t_sa1 + t_ea1 ) / 2 * Math.PI;
        let color = '';

        if( r + 1 !== this.fa[ l + 2 ] ){
          if( this.rd[ l ].cna[ r ].ls || this.rd[ l ].cna[ r + 1 ].ls ){
            color = 'yellow';
          } else {
            color = 'red';
          }

          this.rm.drawArcBridge( color, t_cr1, t_ea1 * Math.PI, this.rd[ l ].cna[ r + 1 ].sa * Math.PI );
        } else {
          if( this.rd[ l ].cna[ r ].ls || this.rd[ l ].cna[ 0 ].ls ){
            color = 'yellow';
          } else {
            color = 'red';
          }

          this.rm.drawArcBridge( color, t_cr1, t_ea1 * Math.PI, this.rd[ l ].cna[ 0 ].sa * Math.PI );
        }

        if( l + 1 !== this.nl ){
          for( let o = 0; o < this.fa[ l + 3 ]; o++ ){
            const t_sa2 = this.rd[ l + 1 ].cna[ o ].sa;
              let t_ea2 = this.rd[ l + 1 ].cna[ o ].ea;

            if( t_sa2 > t_ea2 ){
              t_ea2 += 2;
            }

            if( ( t_sa1 < t_ea2 && t_sa2 < t_ea1 ) ||
                ( t_ea1 > 2 && t_sa2 + 2 < t_ea1 ) ){
              const t_ac2 = ( t_sa2 + t_ea2 ) / 2 * Math.PI;

              if( this.rd[ l ].cna[ r ].ls || this.rd[ l + 1 ].cna[ o ].ls ){
                color = 'yellow';
              } else {
                color = 'red';
              }

              this.rm.drawStraightBridge( color, t_cr1, t_cr2, t_ac1, t_ac2 );
            }
          }
        }

        this.rm.drawNode( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );
      }
    }
  },

  cycle(){
    for( let l = 0; l < this.nl; l++ ){
      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        if( l % 2 === 0 ){
          this.rd[ l ].cna[ r ].sa += this.rs;
          this.rd[ l ].cna[ r ].ea += this.rs;

          this.rd[ l ].cna[ r ].sa = this.rd[ l ].cna[ r ].sa % 2;
          this.rd[ l ].cna[ r ].ea = this.rd[ l ].cna[ r ].ea % 2;
        } else {
          this.rd[ l ].cna[ r ].sa -= this.rs;
          this.rd[ l ].cna[ r ].ea -= this.rs;

          if( this.rd[ l ].cna[ r ].sa < 0 ){
              this.rd[ l ].cna[ r ].sa += 2;
          }
          if( this.rd[ l ].cna[ r ].ea < 0 ){
              this.rd[ l ].cna[ r ].ea += 2;
          }
        }
      }
    }
  },

  calculate( p_l ){
    for( let r = 0; r < this.fa[ p_l + 2 ]; r++ ){
      const t_sa2 = this.rd[ p_l ].cna[ r ].sa;
        let t_ea2 = this.rd[ p_l ].cna[ r ].ea;

      if( t_sa2 > t_ea2 ){
        t_ea2 += 2;
      }

      let t_cnc = 0;

      if( r + 1 !== this.fa[ p_l + 2 ] ){
        if( this.rd[ p_l ].cna[ r + 1 ].ls ){
          t_cnc++;
        } else {
          if( this.rd[ p_l ].cna[ 0 ].ls ){
            t_cnc++;
          }
        }
      }

      if( r !== 0 ){
        if( this.rd[ p_l ].cna[ r - 1 ].ls ){
          t_cnc++;
        }
      } else {
        if( this.rd[ p_l ].cna[ this.fa[ p_l + 2 ] - 1 ].ls ){
          t_cnc++;
        }
      }

      if( p_l !== 0 ){
        for( let i = 0; i < this.fa[ p_l + 1 ]; i++ ){
          if( !this.rd[ p_l - 1 ].cna[ p_l ].ls ){
            continue;
          }

          const t_sa1 = this.rd[ p_l - 1 ].cna[ i ].sa;
            let t_ea1 = this.rd[ p_l - 1 ].cna[ i ].ea;

          if( t_ca1 > t_na1 ){
            t_na1 += 2;
          }

          if( ( t_sa1 < t_ea2 && t_sa2 < t_ea1 ) || ( t_ea1 > 2 && t_sa2 < t_ea1 ) ){
            t_cnc++;
          }
        }
      }

      if( p_l + 1 !== this.nl ){
        for( let o = 0; o < this.fa[ p_l + 3 ]; o++ ){
          if( !this.rd[ p_l + 1 ].cna[ o ].ls ){
            continue;
          }

          const t_sa3 = this.rd[ p_l + 1 ].cna[ o ].sa;
            let t_ea3 = this.rd[ p_l + 1 ].cna[ o ].ea;

          if( t_sa3 > t_ea3 ){
            t_ea3 += 2;
          }

          if( ( t_sa2 < t_ea3 && t_sa3 < t_ea2 ) || ( t_sa2 > 2  && t_sa3 < t_ea2 ) ){
            t_cnc++;
          }
        }
      }

      applyRules( this, t_cnc, p_l, r );
    }
  }
};

module.exports = Automata;

},{"./render.js":3}],2:[function(require,module,exports){
'use strict';

// Configure variables
const c_fr = 25; // frame rate, in ms

const c_nnl = 4; // Number of node layers
const c_ifa = [ 2, 3 ]; // Initial Fibbonachi Array
const c_lrs = 0.0015; // Layer Rotation Scale
const c_crd = 8;  // Canvas-sacled Radius Divisor
const c_crg = 40; // Canvas-scaled Radius Growth

const Automata = require( './automata.js' );
const automata = Automata.create( c_nnl, c_ifa, c_lrs, c_fr, c_crd, c_crg );

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

  automata.rm.clear();
  automata.render();
  automata.cycle();
  requestFrameRate( gameLoop );
};

init();

},{"./automata.js":1}],3:[function(require,module,exports){
const _cnv = document.querySelector( 'canvas' );
const _ctx = _cnv.getContext( '2d' );

const Render = {
  // Requires parameters of:
  // p_rd aka: Radius Divisor
  // p_rg aka: Radius Growth
  create( p_rd, p_rg ){
    if( !_cnv ){
      console.log( 'Canvas does not exist! Activate the Existential Crisis!' );
      return;
    }

    const render = Object.create( this );
    Object.assign( render, {
      cnv: _cnv,
      ctx: _ctx,
      crd: p_rd,
      crg: p_rg,
      cir: 0, // calculated initial radius
      cgr: 0, // calculated growth radius
        c: {} // reference to center point of canvas
    });

    return render;
  },

  refit(){
    this.cnv.width  = this.cnv.clientWidth;
    this.cnv.height = this.cnv.clientHeight;

    this.cir =
      Math.round(
        Math.sqrt(
          Math.pow( this.cnv.width  / this.crd, 2 ) +
          Math.pow( this.cnv.height / this.crd, 2 )
        )
      );

    this.cgr =
      Math.round(
        Math.sqrt(
          Math.pow( this.cnv.width  / this.crg, 2 ) +
          Math.pow( this.cnv.height / this.crg, 2 )
        )
      );

    this.c = {
      x: this.cnv.width  / 2,
      y: this.cnv.height / 2
    };
  },

  drawStraightBridge( p_cs, p_cr1, p_cr2, p_ac1, p_ac2 ){
    this.ctx.lineWeight = 1;
    this.ctx.strokeStyle = p_cs;
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.c.x + p_cr1 * Math.cos( p_ac1 ),
      this.c.y + p_cr1 * Math.sin( p_ac1 ) );
    this.ctx.lineTo(
      this.c.x + p_cr2 * Math.cos( p_ac2 ),
      this.c.y + p_cr2 * Math.sin( p_ac2 ) );
    this.ctx.stroke();
  },

  drawArcBridge( p_cs, p_cr, p_a1, p_a2 ){
    this.ctx.lineWeight = 1;
    this.ctx.strokeStyle = p_cs;
    this.ctx.beginPath();
    this.ctx.arc( this.c.x, this.c.y, p_cr, p_a1, p_a2, false );
    this.ctx.stroke();
  },

  drawNode( p_ls, p_sr, p_er, p_sa, p_ea ){
    this.ctx.lineWeight = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.c.x + p_sr * Math.cos( p_sa ),
      this.c.y + p_sr * Math.sin( p_sa )
    );

    this.ctx.arc(
      this.c.x,
      this.c.y,
      p_sr,
      p_sa,
      p_ea,
      false
    );

    this.ctx.arc(
      this.c.x,
      this.c.y,
      p_er,
      p_ea,
      p_sa,
      true
    );

    this.ctx.lineTo(
      this.c.x + p_sr * Math.cos( p_sa ),
      this.c.y + p_sr * Math.sin( p_sa ),
      this.c.x + p_er * Math.cos( p_sa ),
      this.c.y + p_er * Math.sin( p_sa )
    );
    this.ctx.closePath();

    if( p_ls ){
      this.ctx.strokeStyle = 'black';
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      this.ctx.fillStyle = 'black';
      this.ctx.fill();
    }
  },

  clear(){
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height );
  }
};

module.exports = Render;

},{}]},{},[2]);
