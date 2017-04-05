const Automata = {
  // Requires parameters of:
  // p_nl aka: Number of layers
  // p_fa aka: Fibbonachi Array
  // p_rs aka: Rotation scale
  // p_rm aka: Render Module
  create( p_nl, p_fa, p_rs, p_rm ){
    const automata = Object.create( this );
    Object.assign( automata, {
      nl: p_nl,
      fa: p_fa,
      rs: p_rs,
      rd: [], // rendering data
      nd: [], // next iteration Data
      rm: p_rm
    });

    return automata;
  },

  initialize(){
    for( let l = 0; l< nl; l++ ){
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
        const t_gan = 1 / fibb[ l + 2 ];
        const t_can =    r * t_gA * 2;
        const t_nan = t_cA + t_gA * ( 4 / 3 );
        let t_ls;

        if( t_gen === 1 ){
          t_ls = true;
        } else {
          t_ls = false;
        }

        this.rd[ l ].cna[ r ] = {
         ls: t_ls, // life state
         ca: t_gan,  //
         na: t_nan
        };

        this.nd[ l ][ r ] = {
          ls: t_ls
        };
      }
    }
  },

  calculate(){
    for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
      const t_ca2 = this.rd[ l ].cna[ r ].ca;
        let t_na2 = this.rd[ l ].cna[ r ].na;

      if( t_ca2 > t_na2 ){
        t_na2 += 2;
      }

      let t_cnc = 0;

      if( r + 1 !== this.fa[ l + 2 ] ){
        if( this.rd[ l ].cna[ r + 1 ].ls ){
          t_cnc++;
        } else {
          if( this.rd[ l ].cna[ 0 ].ls ){
            t_cnc++;
          }
        }
      }

      if( r !== 0 ){
        if( this.rd[ l ].cna[ r - 1 ].ls ){
          t_cnc++;
        }
      } else {
        if( this.rd[ l ].cna[ this.fa[ l + 2 ] - 1 ].ls ){
          t_cnc++;
        }
      }

      if( l !== 0 ){
        for( let i = 0; i < this.fa[ l + 1 ]; i++ ){
          if( !this.rd[ l - 1 ].cna[ i ].ls ){
            continue;
          }

          const t_ca1 = this.rd[ l - 1 ].cna[ i ].ca;
            let t_na1 = this.rd[ l - 1 ].cna[ i ].na;

          if( t_ca1 > t_na1 ){
            t_na1 += 2;
          }

          if( ( t_ca1 < t_na2 && t_ca2 < t_na1 ) || ( t_na1 > 2 && t_ca2 < t_na1 ) ){
            t_cnc++;
          }
        }
      }

      if( l + 1 !== this.nl ){
        for( let o = 0; o < this.fa[ l + 3 ]; o++ ){
          if( !this.rd[ l + 1 ].cna[ o ].ls ){
            continue;
          }

          const ca3 = this.rd[ l + 1 ].cna[ o ].ca;
            let na3 = this.rd[ l + 1 ].cna[ o ].na;

          if( t_ca3 > t_na3 ){
            t_na3 += 2;
          }

          if( ( t_ca2 < t_na3 && t_ca3 < t_na2 ) || ( t_na2 > 2  && t_ca3 < t_na2 ) ){
            t_cnc++;
          }
        }
      }

      this.rules( t_cnc );
    }
  },

    rules( p_cnc ){
      if( p_cnc == 2 ){
        this.nd[ l ][ r ].ls = 1;
      }

      if( p_cnc >= 3 ){
        this.nd[ l ][ r ].ls = 0;
      }
    },

  cycle(){
    for( let l = 0; l < this.nl; l++ ){
      for( let r = 0; r < this.fa[ l + 2 ]; r++ ){
        if( l % 2 === 0 ){
          this.rd[ l ].cna[ r ].ca += this.rs;
          this.rd[ l ].cna[ r ].na += this.rs;

          this.rd[ l ].cna[ r ].ca = this.rd[ l ].cna[ r ].ca % 2;
          this.rd[ l ].cna[ r ].na = this.rd[ l ].cna[ r ].na % 2;
        } else {
          this.rd[ l ].cna[ r ].ca -= this.rs;
          this.rd[ l ].cna[ r ].na -= this.rs;

          if( this.rd[ l ].cna[ r ].ca < 0 ){
              this.rd[ l ].cna[ r ].ca += 2;
          }
          if( this.rd[ l ].cna[ r ].na < 0 ){
              this.rd[ l ].cna[ r ].na += 2;
          }
        }
      }
    }
  }
};

module.exports = Automata;
