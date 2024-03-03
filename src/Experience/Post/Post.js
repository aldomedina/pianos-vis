import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import Experience from "../Experience.js";
import { lerp } from "three/src/math/MathUtils.js";

export default class Post {
  constructor() {
    this.experience = new Experience();
    this.audio = this.experience.audio;
    this.time = this.experience.time;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;
    this.renderer = this.experience.renderer.instance;
    this.debug = this.experience.debug;

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("post");
    }

    const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      samples: 2,
    });

    this.effectComposer = new EffectComposer(this.renderer, renderTarget);
    this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);

    this.addRenderPass();
    this.addTintPass();
  }

  addRenderPass() {
    const renderPass = new RenderPass(this.scene, this.camera.instance);
    this.effectComposer.addPass(renderPass);
  }

  addTintPass() {
    const TintShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTint: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;

        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;

        varying vec2 vUv;
        
        float random2d(vec2 coord){
          return fract(sin(dot(coord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
      
        vec3 addNoise(vec3 col) {
          float amount = 0.17;
          float noise = (random2d(vUv) - 0.5) * amount;
          return vec3(col.x + noise, col.y + noise, col.z+noise);
        }

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb += uTint;
            color.rgb = addNoise(color.rgb);
            gl_FragColor = color;
        }
    `,
    };

    this.tintPass = new ShaderPass(TintShader);
    this.tintPass.material.uniforms.uTint.value = new THREE.Vector3();
    this.effectComposer.addPass(this.tintPass);

    if (this.debug.active) {
      this.debugFolder
        .add(this.tintPass.material.uniforms.uTint.value, "x")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("red");
      this.debugFolder
        .add(this.tintPass.material.uniforms.uTint.value, "y")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("green");
      this.debugFolder
        .add(this.tintPass.material.uniforms.uTint.value, "z")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("blue");
    }
  }
  update() {
    this.effectComposer.render();

    this.tintPass.material.uniforms.uTint.value.z = lerp(
      this.tintPass.material.uniforms.uTint.value.z,
      this.audio.frequency * 2,
      1
    );
  }
}
