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

const calculate = function( obj, p_l ){
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
  }
};

let Automata = {
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
      rd: [], // rendering data
      nd: [] // next iteration Data
    });

    return automata;
  },

  initialize(){
    this.rm.refit( this.nl );

    let rmref = this.rm;
    let amref = this;

    rmref.cnv.onmousedown = function( event ){
      rmref.mc =
        { x: event.x,
          y: event.y };
      rmref.md = true;
      console.log( rmref.md );
    };

    rmref.cnv.onmousemove = function( event ){
      if( rmref.md ){
        rmref.mc =
          { x: event.x,
            y: event.y };
        rmref.mdr = Math.dist( rmref.mc, rmref.c );
        const t_d = Math.calculateLesserDimension( rmref.cnv.width , rmref.cnv.height );
        rmref.cgr = ( t_d / 2 - rmref.cir / 2 - rmref.mdr ) / ( amref.nl * 2 + 1 );
        rmref.refit( amref.nl );
        console.log( rmref.cgr );
      }
    };

    rmref.cnv.onmouseup = function( event ){
      rmref.mc = {};
      rmref.md = false;
      console.log( rmref.md );
    };

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
      let obj = this;
      window.setInterval( function(){
        calculate( obj, l );
      }, t_time );
    }
  },

  update(){

  },

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
  },

  render(){
    for( let l = 0; l < this.nl; l++ ){
      const t_ga = 1 / this.fa[ l + 2 ];
      const t_sr = this.rm.cir + l * this.rm.cgr * 2;
      const t_er = t_sr + this.rm.cgr;

      const t_cr1 = this.rm.cir + l * this.rm.cgr * 2 + this.rm.cgr * 0.5;
      const t_cr2 = t_cr1 + this.rm.cgr * 2;

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

        this.rm.drawNode( this.rd[ l ].cna[ r ].ls, t_sr, t_er, t_sa, t_ea );
      }
    }
  },

  displayFrameRate( p_fr ){
    this.rm.output( p_fr );
  }
}

module.exports = Automata;
