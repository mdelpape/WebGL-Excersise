import { Mesh } from 'three'

export default class Shape {
  constructor({geometry, material, parentMesh, position = {x: 0, y: 0, z: 0}}) {
    this.originalY = position.y;
    this.mesh = new Mesh(geometry, material)
    this.mesh.position.copy(position)

    parentMesh.add(this.mesh)
  }
  render(time) {
    this.mesh.position.y = Math.sin(time * 0.001) + this.originalY
    this.mesh.rotation.x += 0.005
    this.mesh.rotation.y += 0.005
  }
}