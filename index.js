'use strict';

// Configure variables
const c_fr = 25; // frame rate, in ms
const c_nnl  = 6; // Number of node layers
const c_lrs = 0.0015; // Layer Rotation Scale
const c_crd = 8;  // Canvas-sacled Radius Divisor
const c_crg = 40; // Canvas-scaled Radius Growth
const c_ifa = [ 2, 3 ]; // Initial Fibbonachi Array

const Render   =    require( './render.js').create( c_crd, c_crg );
const Automata = require( './automata.js' ).create( c_nnl, c_ifa, c_lrs, Render );
