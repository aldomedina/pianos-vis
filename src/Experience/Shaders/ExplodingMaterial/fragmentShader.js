const getStaticLines = () => {
  let lines = "";

  const offsets = [-12, -8, -4, 0, 4, 8, 12];
  for (let i = 0; i < offsets.length; i++) {
    lines += `float pct${i} = plot(vUv, sw * ${offsets[i]}., sw);`;
    lines += `fCol = (1.0-pct${i})*fCol+pct${i}*col${i % 2 ? 1 : 2};`;
  }
  return lines;
};

const fragmentShader = /*glsl*/ `
  #define LINEAR_TO_SRGB(c) pow((c), vec3(1.0 / 2.2))

  varying float vDistort;
  varying vec2 vUv;      
  varying vec2 vUvB;      

  uniform vec3 u_col1;
  uniform vec3 u_col2;
  uniform vec3 u_col3;
  uniform vec3 u_col4;
  uniform vec3 u_bg1;
  uniform vec3 u_bg2;
  uniform float u_intensity;
  uniform float u_strokeWidth;


  #define PI 3.1415926535

  vec2 rotateCoord(vec2 uv, float rads) {
    uv *= mat2(cos(rads), sin(rads), -sin(rads), cos(rads));
    return uv;
  }

  float plot(vec2 st, float thresholdX, float strokeW) {    
    return step( abs(st.y - .4 - st.x + thresholdX), strokeW);
  }

  vec3 pal(in float t,in vec3 a,in vec3 b,in vec3 c,in vec3 d){
      return a+b*cos(6.28318*(c*t+d));
  }

  void main() {
    float strokeW = u_strokeWidth;
    float h = 0.33;
    float distort = vDistort * u_intensity;
    float mixInterpolation = step(h*2.0, vUv.y);
        
    vec3 col1 = mix(mix(u_col1, u_col2, vUv.y/h), mix(u_col2, u_col3, (vUv.y - h)/(1.0 - h*2.)), step(h, vUv.y));  
    vec3 col2 = mix(mix(u_col3, u_col4, (vUv.y - h)/(1.0 - h*2.)), mix(u_col3, u_col4, (vUv.y - h*1.)/(1.0-h*2.)), mixInterpolation);
      
    float sw = strokeW / 4.;
    vec3 fCol=pal(vUv.x, col1,u_col2,u_col3,col2);

    ${getStaticLines()}

    float solidLine1 = plot(vUv, 0., sw);
    vec3 solidLineColor1 = solidLine1*u_col1;

    float solidLine2 = plot(vUv, 0.64, sw);
    vec3 solidLineColor2 = solidLine2*u_col2;

    float solidLine3 = plot(vUv, -0.34, sw);
    vec3 solidLineColor3 = solidLine3*u_col3;

    float solidLine4 = plot(vUv, .8, sw);
    vec3 solidLineColor4 = solidLine4*u_col4;
    
    float lineValues = solidLine1 + solidLine2 + solidLine3 + solidLine4;
    vec3 lineColors = solidLineColor1 + solidLineColor2 + solidLineColor3 + solidLineColor4;

    fCol = (1. - lineValues) * fCol + lineColors;
    




   

    gl_FragColor = vec4(LINEAR_TO_SRGB(fCol), 1.0);
  }  
`;

export default fragmentShader;
