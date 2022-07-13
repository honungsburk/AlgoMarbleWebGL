#version 100
// MUST use version 100 - nothing higher is supported...

precision highp float;

uniform vec2 resolution;
uniform vec2 rand_seed;
uniform sampler2D texture;
varying vec2 vTexCoord;

/////////////////// RANDOMNESS ////////////////////

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


void main() {
  float rndNumber = rand(vec2(rand(vTexCoord.xy), rand(rand_seed)));
  vec2 offSet = vec2(0.0, 0.0);
  
  if(vTexCoord.x < 0.9 && vTexCoord.x > 0.1 && vTexCoord.y < 0.9 && vTexCoord.y > 0.1){
  if (rndNumber < 0.125){
    offSet = vec2(1.0, 0.0);
  } else if (rndNumber < 0.25){
    offSet = vec2(-1.0, 0.0);
  } else if (rndNumber < 0.375){
    offSet = vec2(0.0, 1.0);
  } else if (rndNumber < 0.5){
    offSet = vec2(0.0, -1.0);
  }
  }

  vec2 coordinates = vTexCoord.xy + offSet / resolution;
  gl_FragColor = vec4(texture2D(texture, coordinates).rgb, 1.0);

}