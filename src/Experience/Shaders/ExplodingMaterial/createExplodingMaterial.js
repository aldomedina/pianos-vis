import * as THREE from "three";
import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import palette from "../../Utils/palettes";

const density = 1,
  amplitude = 1,
  frequency = 1,
  strokeWidth = 0.08;

const createExplodingMaterial = (max, min) =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,

    uniforms: {
      u_time: { value: 0.0 },
      u_speed: { value: 0.05 },
      u_density: { value: density },
      u_amplitude: { value: amplitude },
      u_frequency: { value: frequency },
      u_intensity: { value: 1 },
      u_period: { value: 0.1 },
      u_bBoxMin: {
        value: min,
      },
      u_bBoxMax: {
        value: max,
      },
      u_col1: {
        value: new THREE.Color(palette[1]),
      },
      u_col2: {
        value: new THREE.Color(palette[2]),
      },
      u_col3: {
        value: new THREE.Color(palette[3]),
      },
      u_col4: {
        value: new THREE.Color(palette[4]),
      },
      u_strokeWidth: { value: strokeWidth },
    },
  });

export default createExplodingMaterial;
