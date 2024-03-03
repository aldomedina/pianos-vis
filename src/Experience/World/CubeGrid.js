import * as THREE from "three";

import Experience from "../Experience.js";
import createExplodingMaterial from "../Shaders/ExplodingMaterial/createExplodingMaterial.js";
import { lerp } from "three/src/math/MathUtils.js";
import palettes from "../Utils/palettes.js";

export default class CubeGrid {
  constructor() {
    this.experience = new Experience();
    this.audio = this.experience.audio;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("CubeGrid");
    }

    // Resource
    this.resource = this.resources.items.cubegrid;

    this.setModel();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.set(0.9, 0.9, 0.9);
    this.scene.add(this.model);

    this.model.children[0].geometry.computeBoundingBox();
    this.model.children[0].geometry.center();
    this.model.children[0].material = createExplodingMaterial(
      this.model.children[0].geometry.boundingBox.max,
      this.model.children[0].geometry.boundingBox.min
    );

    if (this.debug.active) {
      const debugObject = {
        frequency: 1,
        amplitude: 1,
        intensity: 1,
        density: 1,
        strokeWidth: 1,
      };

      this.debugFolder
        .add(debugObject, "frequency")
        .min(0)
        .max(10)
        .step(0.001)
        .onChange(
          (value) =>
            (this.model.children[0].material.uniforms.u_frequency.value = value)
        );
      this.debugFolder
        .add(debugObject, "amplitude")
        .min(0)
        .max(100)
        .step(0.001)
        .onChange(
          (value) =>
            (this.model.children[0].material.uniforms.u_amplitude.value = value)
        );
      this.debugFolder
        .add(debugObject, "intensity")
        .min(0)
        .max(100)
        .step(0.001)
        .onChange(
          (value) =>
            (this.model.children[0].material.uniforms.u_intensity.value = value)
        );
      this.debugFolder
        .add(debugObject, "density")
        .min(0)
        .max(100)
        .step(0.001)
        .onChange(
          (value) =>
            (this.model.children[0].material.uniforms.u_density.value = value)
        );

      this.debugFolder
        .add(debugObject, "strokeWidth")
        .max(0.16)
        .min(0.01)
        .onChange(
          (strokeWidth) =>
            (this.model.children[0].material.uniforms.u_strokeWidth.value =
              strokeWidth)
        );
    }
  }

  update() {
    this.model.children[0].material.uniforms.u_frequency.value = lerp(
      this.model.children[0].material.uniforms.u_frequency.value,
      this.audio.frequency * 10,
      this.time.delta * 0.005
    );

    this.model.children[0].material.uniforms.u_amplitude.value = lerp(
      this.model.children[0].material.uniforms.u_amplitude.value,
      this.audio.amplitude * 100,
      this.time.delta * 0.005
    );

    this.model.children[0].material.uniforms.u_strokeWidth.value = lerp(
      this.model.children[0].material.uniforms.u_strokeWidth.value,
      this.audio.amplitude * 1.6,
      this.time.delta * 0.005
    );

    this.model.children[0].material.uniforms.u_density.value = lerp(
      this.model.children[0].material.uniforms.u_density.value,
      this.audio.amplitude * 5,
      this.time.delta * 0.005
    );

    // ROTATION
    this.model.children[0].rotation.x += 0.005;
  }
}
