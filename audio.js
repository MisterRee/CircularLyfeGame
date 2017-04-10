
const repipe = function( obj ){
    // Setting pipe, filter signal first, then change its ADSR
    obj.carrier.connect( obj.filter );
    obj.filter.connect( obj.envelope );
    obj.envelope.connect( obj.atx.destination );

    obj.carrier.start();
}

const Audio = {
  create( p_base, p_time ){
    let audio = Object.create( this );
    let t_a = new AudioContext();

    Object.assign( audio, {
      base: 55 * Math.pow( 2 , p_base ),  // hertz starting at 55 hertz
      step: Math.pow( 2, ( 1 / 12 ) ), // To depict the twelve steps of pitch between each octave
      note: p_time, // Time in milliseconds
      atx: t_a,
      carrier: t_a.createOscillator(),
      envelope: t_a.createGain(),
      filter: t_a.createBiquadFilter()
    });

    audio.filter.type = "lowpass";

    return audio;
  },

  // Envelope Setup
  // p_ea: Attack duration, fraction of 1
  // p_ed: Deacy duration, fraction of 1
  // p_es: Sustain duration, fraction of 1
  // p_er: Release duration, fraction of 1
  // p_ev: Sustain volume level
  setup( p_ea, p_ed, p_es, p_er, p_ev ){
    const attack  = this.note * p_ea;
    const decay   = this.note * p_ed;
    const sustain = this.note * p_es;
    const release = this.note * p_er;

    this.envelope.gain.linearRampToValueAtTime( 1,     this.atx.currentTime + attack );
    this.envelope.gain.linearRampToValueAtTime( p_ev, this.atx.currentTime + attack + decay );
    this.envelope.gain.linearRampToValueAtTime( 0,     this.atx.currentTime + attack + decay + sustain + release );
  },

  play( p_ns ){
    // http://www.phy.mtu.edu/~suits/NoteFreqCalcs.html
    this.carrier.frequency.value = this.base * Math.pow( this.step, p_ns );
    this.filter.frequency.value = this.carrier.frequency.value * 2; // To this value's next octave

    repipe( this );
    const ctx = this;

    window.setTimeout( function(){
      ctx.carrier.stop();
      ctx.carrier.disconnect( ctx.filter );
      ctx.filter.disconnect( ctx.envelope );
      ctx.envelope.disconnect( ctx.atx.destination );
    }, ctx.note );
  }
};

module.exports = Audio;
