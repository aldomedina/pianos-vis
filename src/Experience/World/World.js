import Experience from "../Experience.js";
import CubeGrid from "./CubeGrid.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      // this.floor = new Floor()
      this.cubeGrid = new CubeGrid();
    });
  }

  update() {
    if (this.cubeGrid) this.cubeGrid.update();
  }
}
