
const Audio = {
  create(){
    const audio = Object.create( this );
    Object.assign( audio, {
      atx: new AudioContext(),
      carrier: atx.createOscicllator(),
      envelope: atx.createGain(),
      filter: atx.createBiquadFilter()
    });

    return audio;
  },


};

module.exports = Audio;
