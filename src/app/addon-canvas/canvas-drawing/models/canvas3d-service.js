import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  MOUSE
} from 'three';

import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';

import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import CanvasService from './canvas-service';
import Draw3dService from './draw-3d-service';

export default class Canvas3dService extends CanvasService {
  renderer = null;
  scene = null;
  camera = null;
  bInitOk = false;
  width = 0;
  height = 0;
  pX = 10;
  idParent = '';
  indexRender = 0;
  autoRotateOn = false;
  zoom = 0;
  canvasParams = [];
  drawService = null;
  clear() {
    this.videoService.clearRecorder();
    this.drawService = new Draw3dService();
    this.camera = null;
    this.controls = null;
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.renderer = null;
    this.urlImgs = [];
    this.zoom = 0;
    this.width = 0;
    this.height = 0;
    this.offSet = [];
    this.limitWidth = 0;
    this.limitHeight = 0;
    this.autoRotate = false;
    this.enable3D = true;

    // remove canvas
    const canvasContainerElement = document.getElementById(
      this.canvasParams.idContainerCanvas3D,
    );
    if (canvasContainerElement) {
      const parent = document.getElementById(this.idParent);
      if (parent) {
        parent.removeChild(canvasContainerElement);
      }
    }
  }
  initComposer() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.drawService.scene, this.camera);
    this.composer.addPass(renderPass);

    const luminosityPass = new ShaderPass(LuminosityShader);
    this.composer.addPass(luminosityPass);

    //const colorCorrectionPass = new ShaderPass(THREE.ColorCorrectionShader);
    //composer.addPass(colorCorrectionPass);
  }
  clearScene(type) {
    if (type == "") {
      this.drawService.scene.clear();
    }

    // Remove all children from the scene
    for (let i = 0; i < this.drawService.scene.children.length; i++) {
      if (type == '' || this.drawService.scene.children[i].type == type) {
        this.drawService.scene.remove(this.drawService.scene.children[i]);
      }
    }
    return this.update();
  }
  render() {
    if (this.renderer && this.drawService.scene && this.drawService.scene.isScene) {
      if (this.composer) {
        this.composer.render();
      }
      this.renderer.render(this.drawService.scene, this.camera);
      return true;
    }
    return false;
  }
  setParams(canvasParams) {
    this.canvasParams = canvasParams;
    this.idElementCanvas = canvasParams.idCanvas3D;
    this.idParent = canvasParams.idParent;
  }
  getNewContext(canvas) {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (gl) {
      return canvas.getContext('webgl2', {
        antialias: false,
      });
    }

    return canvas.getContext('webgl', {
      antialias: false,
    });
  }
  init3d(width, height, limitWidth, limitHeight, offSet, canvasParams) {
    this.drawService = new Draw3dService();
    this.setParams(canvasParams);
    this.clear();

    this.limitWidth = limitWidth;
    this.limitHeight = limitHeight;
    this.offSet = offSet;
    this.width = width;
    this.height = height;

    this.drawService.scene = new Scene();

    this.drawService.setLimits(this.limitWidth, this.limitHeight);
    const canvas = document.createElement('canvas');
    canvas.id = canvasParams.idCanvas3D;

    const newContext = this.getNewContext(canvas);
    if (newContext === null) {
      return false;
    }

    this.renderer = new WebGLRenderer({
      canvas: canvas,
      context: newContext,
      antialias: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
    });

    this.renderer.setSize(width, height);

    const elementParent = document.getElementById(this.idParent);
    if (elementParent) {
      const canvasContainer = document.getElementById(
        this.canvasParams.idContainerCanvas3D,
      );
      if (canvasContainer) {
        elementParent.removeChild(canvasContainer);
      }

      this.camera = new PerspectiveCamera(100, width / height, 0.2, 10000);
      this.camera.updateProjectionMatrix();

      this.camera.rotation.order = 'YXZ';
      this.camera.position.z = this.pX;

      // add canvas container to main container
      const newCanvasContainer = document.createElement('div');
      newCanvasContainer.setAttribute(
        'id',
        this.canvasParams.idContainerCanvas3D,
      );
      newCanvasContainer.appendChild(this.renderer.domElement);
      elementParent.appendChild(newCanvasContainer);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.mouseButtons = {
        LEFT: MOUSE.NONE, // disable
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
      };

      this.controls.object.position.z = this.pX;

      /*
      this.controls.keys = {
        LEFT: 37, // Flèche gauche
        UP: 38, // Flèche haut
        RIGHT: 39, // Flèche droite
        BOTTOM: 40 // Flèche bas
      };*/
      this.controls.enableZoom = true;
      this.controls.autoRotate = false;
    }
    return true;
  }
  setCameraPosition(position) {
    this.camera.position.x = position[0];
    this.camera.position.y = position[1];
    this.camera.position.z = position[2];
    this.update();
    return true;
  }
  setControlsPosition(position) {
    this.controls.object.position.x = position[0];
    this.controls.object.position.y = position[1];
    this.controls.object.position.z = position[2];
    this.controls.update();
    return true;
  }
  toggleZoomIn() {
    this.zoom = this.zoom === 0 ? -0.01 : 0;
    return true;
  }
  toggleAutoRotate() {
    this.autoRotateOn = this.autoRotateOn === false;
    return true;
  }
  setAutoRotate(b) {
    this.autoRotateOn = b;
  }
  setControlsPositionZ(z) {
    this.controls.object.position.z = z;
    this.controls.update();
    return true;
  }
  setControlsPositionY(y) {
    this.controls.object.position.y = y;
    this.controls.update();
    return true;
  }
  setControlsPositionX(x) {
    this.controls.object.position.x = x;
    this.controls.update();
    return true;
  }
  rotateZ(step) {
    this.camera.rotateOnAxis(
      new Vector3(0, 0, 1).normalize(),
      this.degInRad(step),
    );
    return true;
  }
  rotateY(step) {
    this.camera.rotateOnAxis(
      new Vector3(0, 1, 0).normalize(),
      this.degInRad(step),
    );
    return true;
  }
  rotateX(step) {
    this.camera.rotateOnAxis(
      new Vector3(1, 0, 0).normalize(),
      this.degInRad(step),
    );
    return true;
  }
  update() {
    if (this.render()) {
      let bUpdate = false;

      if (this.autoRotateOn === true) {
        this.controls.autoRotate = true;
        bUpdate = true;
      } else {
        this.controls.autoRotate = false;
      }

      if (this.zoom !== 0) {
        if (this.controls.object.position.z > 0) {
          // + zoom
          this.controls.object.position.z += this.zoom;
          bUpdate = true;
        } else {
          // zoom end
          this.controls.object.position.z = this.pX;
          this.controls.update();
          this.zoom = 0;
        }
      }

      if (bUpdate === true) {
        this.controls.update();
        this.drawComplete = true;
      }
      return true;
    }
    return false;
  }
  degInRad(deg) {
    return (deg * Math.PI) / 180;
  }
  getUrlPng() {
    if (this.renderer) {
      this.render();
      return this.renderer.domElement.toDataURL();
    }
    return '';
  }
  getUrlJpeg() {
    if (this.renderer) {
      this.render();
      return this.renderer.domElement.toDataURL('image/jpeg');
    }
    return '';
  }
  addUrlImg(type, quality) {
    if (type === 'png') {
      this.urlImgs.push(this.getUrlPng(quality));
    } else if (type === 'jpg') {
      this.urlImgs.push(this.getUrlJpeg(quality));
    }
  }
  download(type, name, quality) {
    const link = document.createElement('a');
    link.download = `${name}.${type}`;
    if (type === 'png') {
      link.href = this.getUrlPng(quality);
    } else if (type === 'jpg') {
      link.href = this.getUrlJpeg(quality);
    }
    if (link.href !== '') {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return true;
  }
}
