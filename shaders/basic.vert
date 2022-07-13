#version 300 es
  
// our vertex data
in vec3 vertPosition;

void main() {

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(vertPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // send the vertex information on to the fragment shader
  gl_Position = vec4(vertPosition, 1.0); //positionVec4;
}