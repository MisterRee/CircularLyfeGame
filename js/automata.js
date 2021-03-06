// Configurable variables
const audioAttack        = 0.25;
const audioDecay         = 0.25;
const audioSustain       = 0.25;
const audioRelease       = 0.25;
const audioSustainVolume = 0.5;

const Render = require( './render.js' );
const Audio = require( './audio.js' );

// Closure function which holds the rules for the automata to cycle through
const applyRules = function( obj, p_cnc, p_l, p_r ){
  // p_cnc is the count of neighbors that are alive
  // p_l is the node layer in question
  // p_r is a reference to a specific node in a layer
  if( p_cnc == 2 ){
    obj.nd[ p_l ][ p_r ].ls = true;
  }

  if( p_cnc >= 3 ){
    obj.nd[ p_l ][ p_r ].ls = false;
  }
};

// Closure function which calculates the number of living nodes in the layer
// Creates a new floater based on results of tally
const generateFloater = function( obj, p_l, p_na ){
  if( p_na > 16 ){
    p_na = Math.round( p_na / 4 );
  } else if( p_na > 12 ){
    p_na = Math.round( p_na / 3 );
  } else if( p_na > 8 ){
    p_na = Math.floor( p_na / 2 );
  }

  obj.am.play( p_l, obj.fa[ p_l + 2 ], p_na * 2, obj.rm.cgr / ( ( obj.rm.ldr - obj.rm.cir ) / ( obj.nl * 2 ) ) );

  const sa = Math.random() * 2 * Math.PI;
  const ea = 1 / obj.fa[ p_l + 2 ] * Math.PI;
  const el = obj.rm.cir * Math.random() / 4;
  const r = Math.floor( Math.random() * 255 );
  const g = Math.floor( Math.random() * 255 );
  const b = Math.floor( Math.random() * 255 );

  obj.rm.addFloater( sa, ea, el, r, g, b );
};

// Closure function which scans through a specific node layer.
// Calculates the amount of living neighbors for every node,
// Calls the rule application  and floater geneeration functions
const calculate = function( obj, p_l ){
  let t_na = 0;

  for( let r = 0; r < obj.fa[ p_l + 2 ]; r++ ){
    const t_sa2 = obj.rd[ p_l ].cna[ r ].sa;
      let t_ea2 = obj.rd[ p_l ].cna[ r ].ea;

    if( t_sa2 > t_ea2 ){
      t_ea2 += 2;
    }

    let t_cnc = 0;

    if( r + 1 !== obj.fa[ p_l + 2 ] ){
      if( obj.rd[ p_l ].cna[ r + 1 ].ls ){
        t_cnc++;
      } else {
        if( obj.rd[ p_l ].cna[ 0 ].ls ){
          t_cnc++;
        }
      }
    }

    if( r !== 0 ){
      if( obj.rd[ p_l ].cna[ r - 1 ].ls ){
        t_cnc++;
      }
    } else {
      if( obj.rd[ p_l ].cna[ obj.fa[ p_l + 2 ] - 1 ].ls ){
        t_cnc++;
      }
    }

    if( p_l !== 0 ){
      for( let i = 0; i < obj.fa[ p_l + 1 ]; i++ ){
        if( !obj.rd[ p_l - 1 ].cna[ i ].ls ){
          continue;
        }

        const t_sa1 = obj.rd[ p_l - 1 ].cna[ i ].sa;
          let t_ea1 = obj.rd[ p_l - 1 ].cna[ i ].ea;

        if( t_sa1 > t_ea1 ){
          t_ea1 += 2;
        }

        if( ( t_sa1 < t_ea2 && t_sa2 < t_ea1 ) || ( t_ea1 > 2 && t_sa2 < t_ea1 ) ){
          t_cnc++;
        }
      }
    }

    if( p_l + 1 !== obj.nl ){
      for( let o = 0; o < obj.fa[ p_l + 3 ]; o++ ){
        if( !obj.rd[ p_l + 1 ].cna[ o ].ls ){
          continue;
        }

        const t_sa3 = obj.rd[ p_l + 1 ].cna[ o ].sa;
          let t_ea3 = obj.rd[ p_l + 1 ].cna[ o ].ea;

        if( t_sa3 > t_ea3 ){
          t_ea3 += 2;
        }

        if( ( t_sa2 < t_ea3 && t_sa3 < t_ea2 ) || ( t_sa2 > 2  && t_sa3 < t_ea2 ) ){
          t_cnc++;
        }
      }
    }
    applyRules( obj, t_cnc, p_l, r );
  }

  for( let c = 0; c < obj.fa[ p_l + 2 ]; c++ ){
    obj.rd[ p_l ].cna[ c ].ls = obj.nd[ p_l ][ c ].ls;

    if( obj.rd[ p_l ].cna[ c ].ls ){
      t_na++;
    }
  }
  generateFloater( obj, p_l, t_na );
};

const Automata = {
  // Requires parameters of:
  // p_nl aka: Number of Layers
  // p_fa aka: Fibbonachi Array
  // p_rs aka: Rotation Scale
  // p_rd aka: Radius Divisor
  // p_rg aka: Radius Growth
  create( p_nl, p_fa, p_rs, p_rd, p_rg ){
    const automata = Object.create( this );
    Object.assign( automata, {
      nl: p_nl,
      fa: p_fa,
      rs: p_rs,
      rm: Render.create( p_rd, p_rg ),
      am:  Audio.create( 55 ),
      rd: [], // rendering data
      nd: [], // next iteration Data
      dm: "minim" // draw mode
    });

    return automata;
  },

  // Adds onmousedown, onmousemove, and onmouseleave functions to the Canvas
  initialize(){
    this.rm.refit( this.nl );

    let rmref = this.rm;
    let amref = this;

    rmref.cnv.onmousedown = function( event ){
      rmref.mc =
        { x: event.x,
          y: event.y };
      rmref.md = true;
    };

    rmref.cnv.onmousemove = function( event ){
      if( rmref.md ){
        rmref.mc =
          { x: event.x,
            y: event.y };

        rmref.ldr = Math.calculateLesserDimension( rmref.cnv.width , rmref.cnv.height ) / 2;
        rmref.mdr = Math.dist( rmref.mc, rmref.c );

        if( rmref.mdr < rmref.cir ){
          rmref.cgr = ( rmref.cir / 2 ) / ( amref.nl * 2 - 1 );
        } else if( rmref.mdr > rmref.ldr - rmref.cir / 4 ){
          rmref.cgr = ( rmref.ldr - rmref.cir ) / ( amref.nl * 2 );
        } else {
          rmref.cgr = Math.abs( rmref.mdr * ( ( rmref.cir - rmref.ldr ) / ( rmref.ldr ) ) / ( amref.nl * 2 ) );
        }
      }
    };

    rmref.cnv.onmouseleave = function( event ){
      rmref.md = false;
    };

    rmref.cnv.onmouseup = function( event ){
      rmref.mc = {};
      rmref.md = false;
    };

    rmref.cgr = ( Math.calculateLesserDimension( rmref.cnv.width , rmref.cnv.height ) / 2 - rmref.cir ) / ( amref.nl * 2 );

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

      const t_time = 2 / this.fa[ l + 2 ] / this.rs;

      // creating audio module, refer to audio.js for parameter definitions
      this.am.data[ l ] = this.am.setup( l ,t_time / 1000, 0.25, 0.25, 0.25, 0.25, 0.5 );
      let obj = this;

      calculate( obj, l );
      window.setInterval( function(){
        calculate( obj, l );
      }, t_time );
    }
  },

  // function which cycles every node and floater each frame in respect to their rotation speeds
  // p_fr refers to time in milliseconds passed since last frame call
  cycle( p_fr ){
    for( let l = 0; l < this.nl; l++ ){
      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        let scaledRS = this.rs / p_fr;

        if( l % 2 === 0 ){
          this.rd[ l ].cna[ r ].sa += scaledRS;
          this.rd[ l ].cna[ r ].ea += scaledRS;

          this.rd[ l ].cna[ r ].sa = this.rd[ l ].cna[ r ].sa % 2;
          this.rd[ l ].cna[ r ].ea = this.rd[ l ].cna[ r ].ea % 2;
        } else {
          this.rd[ l ].cna[ r ].sa -= scaledRS;
          this.rd[ l ].cna[ r ].ea -= scaledRS;

          if( this.rd[ l ].cna[ r ].sa < 0 ){
              this.rd[ l ].cna[ r ].sa += 2;
          }
          if( this.rd[ l ].cna[ r ].ea < 0 ){
              this.rd[ l ].cna[ r ].ea += 2;
          }
        }
      }
    }

    for( let i = this.rm.ea.length - 1; i >= 0; i-- ){
      this.rm.ea[ i ].ca -= this.rm.ea[ i ].cd / p_fr;
      this.rm.ea[ i ].sl += ( this.rm.ea[ i ].ae / 5000 / p_fr ) * ( this.rm.cgr / ( ( this.rm.ldr - this.rm.cir ) ) * 10 );

      if( this.rm.ea[ i ].ca < 0 ){
        this.rm.ea.splice( i, 1 );
      }
    }
  },

  renderNodes(){
    for( let l = 0; l < this.nl; l++ ){
      const t_ga = 1 / this.fa[ l + 2 ];
      const t_sr = this.rm.cir + l * this.rm.cgr * 2;
      const t_er = t_sr + this.rm.cgr;

      const t_cr1 = this.rm.cir + l * this.rm.cgr * 2 + this.rm.cgr * 0.5;
      const t_cr2 = t_cr1 + this.rm.cgr * 2;

      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        const t_sa = this.rd[ l ].cna[ r ].sa * Math.PI;
        const t_ea = this.rd[ l ].cna[ r ].ea * Math.PI;

        if( this.dm === "minim" ){
          this.rm.drawNode( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );
        } else if( this.dm === "allNodes" ){
          this.rm.drawAllNodes( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );
        }
      }
    }
  },

  renderBridges(){
    for( let l = 0; l < this.nl; l++ ){
      const t_ga = 1 / this.fa[ l + 2 ];
      const t_sr = this.rm.cir + l * this.rm.cgr * 2;
      const t_er = t_sr + this.rm.cgr;

      const t_cr1 = this.rm.cir + l * this.rm.cgr * 2 + this.rm.cgr * 0.5;
      const t_cr2 = t_cr1 + this.rm.cgr * 2;

      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        const t_sa = this.rd[ l ].cna[ r ].sa * Math.PI;
        const t_ea = this.rd[ l ].cna[ r ].ea * Math.PI;

        const t_sa1 = this.rd[ l ].cna[ r ].sa;
          let t_ea1 = this.rd[ l ].cna[ r ].ea;

        if( t_sa1 > t_ea1 ){
          t_ea1 += 2;
        }

        const t_ac1 = ( t_sa1 + t_ea1 ) / 2 * Math.PI;
        let color = '';

        if( r + 1 !== this.fa[ l + 2 ] ){
          if( this.rd[ l ].cna[ r ].ls || this.rd[ l ].cna[ r + 1 ].ls ){
            color = 'red';
          } else {
            color = 'yellow';
          }

          this.rm.drawArcBridge( color, t_cr1, t_ea1 * Math.PI, this.rd[ l ].cna[ r + 1 ].sa * Math.PI );
        } else {
          if( this.rd[ l ].cna[ r ].ls ||  this.rd[ l ].cna[ 0 ].ls ){
            color = 'red';
          } else {
            color = 'yellow';
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
                color = 'red';
              } else {
                color = 'yellow';
              }

              this.rm.drawStraightBridge( color, t_cr1, t_cr2, t_ac1, t_ac2 );
            }
          }
        }

        this.rm.drawAllNodes( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );
      }
    }
  },

  displayFrameRate( p_fr ){
    this.rm.output( p_fr );
  }
}

module.exports = Automata;
