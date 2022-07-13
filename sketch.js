const CANVAS_SIZE_X = 6000 / 6;
const CANVAS_SIZE_Y = 4000 / 6;

let algoMarbleShader;

// Create a random seed - If you want to use this script to regenerate your image
// simply uncomment and write your seed in the string.
const rand = Math.random().toString().substr(2, 8);
// const rand = "MY_SEED"
const random = new RNG(rand);

function getRenderingContext() {
  var canvas = document.getElementById("RenderingCanvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Sorry, your browser doesn't support webgl2");
    return null;
  }
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  return gl;
}

function loadAsString(path) {
  return fetch(path).then((response) => response.text());
}

/**
 *
 * @param {webglContext} gl - the webgl context
 * @param {ShaderKind} shaderKind the type of shader
 * @param {string} path - path to where the shader source code is stores
 * @returns a compiled shader or throws error
 */
async function loadShader(gl, shaderKind, path) {
  const source = await loadAsString(path);
  const shader = gl.createShader(shaderKind);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const error = gl.getShaderInfoLog(shader);
  if (error.length > 0) {
    throw error;
  }

  return shader;
}

function createProgram(gl, shaders) {
  let program = gl.createProgram();

  for (let shader of shaders) {
    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);

  for (let shader of shaders) {
    gl.detachShader(program, shader);
  }

  for (let shader of shaders) {
    gl.deleteShader(shader);
  }

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var linkErrLog = gl.getProgramInfoLog(program);
    cleanup();
    throw linkErrLog;
  }
  return program;
}

function setUniform1f(location, value) {
  let loc = gl.getUniformLocation(program, location);
  gl.uniform1f(loc, value);
}

function setUniform2f(location, value1, value2) {
  let loc = gl.getUniformLocation(program, location);
  gl.uniform2f(loc, value1, value2);
}

function setUniform3f(location, value1, value2, value3) {
  let loc = gl.getUniformLocation(program, location);
  gl.uniform3f(loc, value1, value2, value3);
}

window.addEventListener("load", setupWebGL, false);

let gl;
let program;

async function setupWebGL(evt) {
  window.removeEventListener(evt.type, setupWebGL, false);

  gl = getRenderingContext();

  if (!gl) return;

  let vertexShader = await loadShader(
    gl,
    gl.VERTEX_SHADER,
    "shaders/basic.vert"
  );
  let fragmentShader = await loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    "shaders/AlgoMarble.frag"
  );

  program = createProgram(gl, [vertexShader, fragmentShader]);

  // Remove in final release
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }

  // https://www.tutorialspoint.com/webgl/webgl_drawing_a_quad.htm

  // Drawing a quad
  let vertices = [
    -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,
  ];
  indices = [3, 2, 1, 3, 1, 0];

  let triangleVertexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // Uses the last bound buffer
  // gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Create an empty buffer object to store Index buffer
  var Index_Buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Now we need to inform the vertex shader about the quad we just made.
  var vertPosition = gl.getAttribLocation(program, "vertPosition");
  // 3 <- the number of points in each vertex
  // float <- because they are floating point numbers
  // false <- whether or not to normalize data into a certain range, we will skip that
  // stride <- if zero assumed to be thightly packed (3 * Float32Array.BYTES_PER_ELEMENT)
  // offset <- offset in butes to the first component in the vertez attribute array
  gl.vertexAttribPointer(
    vertPosition,
    3,
    gl.FLOAT,
    false,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  // // Enable the attribute
  gl.enableVertexAttribArray(vertPosition);

  // Unbind the buffer
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // let loop = () => {
  //   render()
  //   if(running){
  //     requestAnimationFrame(loop)
  //   }
  // }
  // requestAnimationFrame(loop)

  gl.useProgram(program);

  // Uniforms

  setUniform2f("u_resolution", 800, 800);
  uniforms();

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  // cleanup();
}

var buffer;
function initializeAttributes() {
  var vertices = [
    -0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0,
  ];

  indices = [3, 2, 1, 3, 1, 0];
  gl.enableVertexAttribArray(0);
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
}

function cleanup() {
  gl.useProgram(null);
  if (buffer) gl.deleteBuffer(buffer);
  if (program) gl.deleteProgram(program);
}

function uniforms() {
  setUniform1f("u_numOctaves", random.uniform(8, 16));
  setUniform1f("u_zoom", random.uniform(0.4, 1.6));
  setUniform3f(
    "u_cc",
    random.uniform(10, 20),
    random.uniform(10, 20),
    random.uniform(10, 20)
  );
  setUniform3f("u_dd", random.random(), random.random(), random.random());
  setUniform2f("u_q_h", random.uniform(0.7, 1.3), random.uniform(0.7, 1.3));
  setUniform2f("u_r_h", random.uniform(0.7, 1.3), random.uniform(0.7, 1.3));
  setUniform1f("u_pattern_h", random.uniform(0.8, 1.2));
  setUniform2f("u_center_point", random.random(), random.random());
  setUniform1f("u_pixel_distance_choice", random.random());
  setUniform1f("u_interpolation_choice", random.uniform(0.0, 3.0));
  setUniform2f(
    "u_q_fbm_displace_1",
    random.uniform(0, 20),
    random.uniform(0, 20)
  );
  setUniform2f(
    "u_q_fbm_displace_2",
    random.uniform(0, 20),
    random.uniform(0, 20)
  );
  setUniform2f(
    "u_r_fbm_displace_1",
    random.uniform(0, 20),
    random.uniform(0, 20)
  );
  setUniform2f(
    "u_r_fbm_displace_2",
    random.uniform(0, 20),
    random.uniform(0, 20)
  );
  setUniform1f("u_color_speed", random.uniform(0.5, 1.0));
}
