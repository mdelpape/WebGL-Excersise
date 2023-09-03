import {
  Color,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  SphereGeometry,
  // MeshMatcapMaterial,
  AxesHelper,
  Object3D,
  Vector3,
  TorusGeometry,
  BoxGeometry,
  MeshLambertMaterial,
  DirectionalLight,
  AmbientLight,
  CircleGeometry,
  CylinderGeometry,
} from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats-js'
import LoaderManager from '@/js/managers/LoaderManager'
import GUI from 'lil-gui'
import Shape from './shape'

export default class MainScene {
  #canvas
  #renderer
  #scene
  #camera
  #controls
  #stats
  #width
  #height
  #mesh
  #guiObj = {
    y: 0,
    showTitle: true,
  }

  constructor() {
    this.#canvas = document.querySelector('.scene')

    this.init()
  }

  init = async () => {
    // Preload assets before initiating the scene
    const assets = [
      {
        name: 'matcap',
        texture: './img/matcap.png',
      },
    ]

    await LoaderManager.load(assets)

    this.containerMesh = new Object3D()
    this.shapes = []

    this.setStats()
    this.setGUI()
    this.setScene()
    this.setRender()
    this.setCamera()
    this.setControls()
    // this.setAxesHelper()
    this.setLights()
    this.setReflector()
    this.setText()

    this.setShapes()

    this.handleResize()

    // start RAF
    this.events()
  }

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    this.#renderer = new WebGLRenderer({
      canvas: this.#canvas,
      antialias: true,
    })
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.#scene = new Scene()
    this.#scene.background = new Color(0x000424)
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    const aspectRatio = this.#width / this.#height
    const fieldOfView = 60
    const nearPlane = 0.1
    const farPlane = 10000

    this.#camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.#camera.position.y = 2
    this.#camera.position.x = 0
    this.#camera.position.z = 10
    this.#camera.lookAt(0, 0, 0)

    this.#scene.add(this.#camera)
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement)
    this.#controls.enableDamping = true
    // this.#controls.dampingFactor = 0.04
  }

  /**
   * Axes Helper
   * https://threejs.org/docs/?q=Axesh#api/en/helpers/AxesHelper
   */
  setAxesHelper() {
    const axesHelper = new AxesHelper(3)
    this.#scene.add(axesHelper)
  }

  /**
   * Create a SphereGeometry
   * https://threejs.org/docs/?q=box#api/en/geometries/SphereGeometry
   * with a Basic material
   * https://threejs.org/docs/?q=mesh#api/en/materials/MeshBasicMaterial
   */
  setShapes() {
    const material = new MeshLambertMaterial({ color: 0xffffff })
    const geometry1 = new SphereGeometry(.7, 32, 32)

    const geometry2 = new TorusGeometry(1, .5, 16, 100)

    const geometry3 = new BoxGeometry(1, 1, 1)

    const geometry4 = new CylinderGeometry(0, 1, 3)


    const shape1 = new Shape({
      geometry: geometry1,
      material: material,
      parentMesh: this.containerMesh,
      position: new Vector3(3, 2, -3)
    })

    const shape2 = new Shape({
      geometry: geometry2,
      material: material,
      parentMesh: this.containerMesh,
      position: new Vector3(-5, 3, -6)
    })

    const shape3 = new Shape({
      geometry: geometry3,
      material: material,
      parentMesh: this.containerMesh,
      position: new Vector3(-1, 5, -10)
    })

    const shape4 = new Shape({
      geometry: geometry4,
      material: material,
      parentMesh: this.containerMesh,
      position: new Vector3(9, 5, -10)
    })

    this.shapes = [shape1, shape2, shape3, shape4]

    this.#scene.add(this.containerMesh)
  }

  setLights() {
    const directionalLight = new DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 1, 1)
    this.#scene.add(directionalLight)
    const ambientLight = new AmbientLight(0xaaaaaa, .8)
    this.#scene.add(ambientLight)
  }

  setReflector() {
    let geometry
    geometry = new CircleGeometry(40, 64);
    this.groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x1D0340
    });
    this.groundMirror.position.y = 0;
    this.groundMirror.rotateX(- Math.PI / 2);
    this.#scene.add(this.groundMirror);
  }

  setText() {

    const loader = new FontLoader();

    // Load the font
    loader.load('../../public/fonts/optimer_bold.typeface.json', (font) => {
      // Font loaded successfully
      const textGeometry = new TextGeometry('Michael Del Pape', {
        font: font, // Use the loaded font
        size: 1,
        height: .5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: .1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 1,
      });

      const textMaterial = new MeshLambertMaterial({ color: 0xffffff });
      const textMesh = new Mesh(textGeometry, textMaterial);
      textMesh.position.y = .5;
      textMesh.position.x = -4.8;
      textMesh.position.z = 0;
      this.#scene.add(textMesh);
    }, (err) => console.log(err));

  }
  /**
   * Build stats to display fps
   */
  setStats() {
    this.#stats = new Stats()
    this.#stats.showPanel(0)
    document.body.appendChild(this.#stats.dom)
  }

  setGUI() {
    const titleEl = document.querySelector('.main-title')

    const handleChange = () => {
      this.#mesh.position.y = this.#guiObj.y
      titleEl.style.display = this.#guiObj.showTitle ? 'block' : 'none'
    }

    const gui = new GUI()
    gui.add(this.#guiObj, 'y', -3, 3).onChange(handleChange)
    gui.add(this.#guiObj, 'showTitle').name('show title').onChange(handleChange)
  }
  /**
   * List of events
   */
  events() {
    window.addEventListener('resize', this.handleResize, { passive: true })
    this.draw(0)
  }

  // EVENTS

  /**
   * Request animation frame function
   * This function is called 60/time per seconds with no performance issue
   * Everything that happens in the scene is drawed here
   * @param {Number} now
   */
  draw = (time) => {
    // now: time in ms
    this.#stats.begin()

    if (this.#controls) this.#controls.update() // for damping
    this.#renderer.render(this.#scene, this.#camera)

    this.shapes.forEach(shape => {
      shape.render(time,)
    })

    this.#stats.end()
    this.raf = window.requestAnimationFrame(this.draw)
  }

  /**
   * On resize, we need to adapt our camera based
   * on the new window width and height and the renderer
   */
  handleResize = () => {
    this.#width = window.innerWidth
    this.#height = window.innerHeight

    // Update camera
    this.#camera.aspect = this.#width / this.#height
    this.#camera.updateProjectionMatrix()

    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1

    this.#renderer.setPixelRatio(DPR)
    this.#renderer.setSize(this.#width, this.#height)
  }
}
