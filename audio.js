const repipe = function( obj ){
    // Setting pipe, filter signal first, then change its ADSR
    obj.carrier.connect( obj.filter );
    obj.filter.connect( obj.envelope );
    obj.envelope.connect( obj.atx.destination );
    obj.carrier.start();
}

// Be aware that this module contains the tools to play one oscillator
// Multiple Audio modules are used to play multiple oscillator at once.
const Audio = {
  create( p_base ){
    let audio = Object.create( this );

    Object.assign( audio, {
      base: p_base,  // int in hertz
      step: Math.pow( 2, ( 1 / 12 ) ), // To depict the twelve steps of pitch between each octave
      mute: true,
      data: []
    });

    return audio;
  },

  // p_time: duration of note
  // p_ea: Attack duration, fraction of 1
  // p_ed: Deacy duration, fraction of 1
  // p_es: Sustain duration, fraction of 1
  // p_er: Release duration, fraction of 1
  // p_ev: Sustain volume level
  setup( p_nl, p_time, p_ea, p_ed, p_es, p_er, p_ev ){
    const attack  = p_time * p_ea;
    const decay   = p_time * p_ed;
    const sustain = p_time * p_es;
    const release = p_time * p_er;

    const ctx = this;

    const node = {
      base: ctx.base * Math.pow( 2, p_nl ),
      note: p_time,
      atk: attack,
      dcy: decay,
      stn: sustain,
      rls: release,
      sdr: p_ev,
      atx: new AudioContext()
    };

    return node;
  },

  switchMute(){
    if( this.mute ){
      this.mute = false;
    } else {
      this.mute = true;
    }
  },

  // p_nl: index of node layer
  // p_fl: fibb array length
  // p_ns: pitch steps from base pitch
  play( p_nl, p_fl, p_ns, p_v ){
    if( !this.mute ){
      const node = this.data[ p_nl ];
      const osc = node.atx.createOscillator();
      const ftr = node.atx.createBiquadFilter();
      const env = node.atx.createGain();

      osc.connect( ftr );
      ftr.connect( env );
      env.connect( node.atx.destination );

      // Formula from http://www.phy.mtu.edu/~suits/NoteFreqCalcs.html
      osc.frequency.value = node.base * Math.pow( this.step, p_ns );

      //osc.frequency.value = node.base;
      //osc.detune.value = p_ns * 12.5;

      ftr.type = "lowpass";
      ftr.frequency.value = node.base; // To this value's next octave

      if( p_v < 0 ){
        p_v = 1;
      }

      let maxGain = p_v * 5 * ( 1 / ( p_fl ) );

      env.gain.value = 0;
      env.gain.linearRampToValueAtTime( maxGain,            node.atx.currentTime + node.atk );
      env.gain.linearRampToValueAtTime( maxGain * node.sdr, node.atx.currentTime + node.atk + node.dcy );
      env.gain.linearRampToValueAtTime( 0,                  node.atx.currentTime + node.atk + node.dcy + node.stn + node.rls );

      osc.start();
      osc.stop( node.atx.currentTime + node.note );
    }
  }
};

module.exports = Audio;
