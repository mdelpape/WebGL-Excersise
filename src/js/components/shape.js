import { Mesh } from 'three'

export default class Shape {
  constructor({geometry, material, parentMesh, position = {x: 0, y: 0, z: 0}}) {
    this.mesh = new Mesh(geometry, material)
    this.mesh.position.copy(position)

    parentMesh.add(this.mesh)
  }
  render(time) {
    this.mesh.position.y = Math.sin(time * 0.001)
  }
}