const _cnv = document.querySelector( 'canvas' );
const _ctx = _cnv.getContext( '2d' );

const Render = {
  // Requires parameters of:
  // p_rd aka: Radius Divisor
  // p_rg aka: Radius Growth
  create( p_rd, p_rg ){
    if( !canvas ){
      console.log( 'Canvas does not exist! Existential Crisis!' );
      return;
    }

    const render = Object.create( this );
    Object.assign( render, {
      cnv: _cnv,
      ctx: _ctx,
      crd: p_rd,
      crg: p_rg,
      cir: 0, // calculated initial radius
      cgr: 0, // calculated growth  radius
        c: {} // reference to center point of canvas
    });

    return render;
  },

  resize(){
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

  drawStraightBridge( p_cs, p_l1, p_l2 ){
    this.ctx.lineWeight = 1;
    this.ctx.strokeStyle = p_cs;
    this.ctx.beginPath();
    this.ctx.moveTo( p_l1.x, p_l1.y );
    this.ctx.lineTo( p_l2.x, p_l2.y );
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
      false
    );

    ctx.lineTo(
      this.c.x + p_sr * Math.cos( p_sa ),
      this.c.y + p_sr * Math.sin( p_sa ),
      this.c.x + p_er * Math.cos( p_sa ),
      this.c.y + p_er * Math.sin( p_sa )
    );
    ctx.closePath();

    if( p_ls ){
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = 'black';
      ctx.fill();
    }
  },

  clear(){
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height );
  }
};
