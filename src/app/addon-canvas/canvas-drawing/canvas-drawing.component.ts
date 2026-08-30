import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasMenuComponent } from '../canvas-menu/canvas-menu.component'; // Chemin relatif
// @ts-ignore
import Canvas2dService from './models/canvas2d-service';
// @ts-ignore
import AnimationService from './models/animation-service';

@Component({
  selector: 'app-canvas-drawing',
  standalone: true,
  imports: [CommonModule, CanvasMenuComponent],
  templateUrl: './canvas-drawing.component.html',
  styleUrls: ['./canvas-drawing.component.css'],
})
export class CanvasDrawingComponent implements OnInit, OnDestroy {
  public canvasService: any;
  @Input() componentID: string = 'componentID-1';
  @Input() modelID: string = '';
  @Input() canvasParams: any = {};
  @Input() triggerCanvas: boolean = false;
  @Output() actionFromCanvas = new EventEmitter<any>();

  @Input() componentData: any;
  @Input() portraitMode: string = 'window';
  @Input() widthLimitMode: string = '';
  @Input() heightResizeMode: string = 'window';
  @Input() marginAutoComponent: boolean = false;
  @Input() width: number = 0;
  @Input() height: number = 0;
  @Input() disableAnimation: boolean = false;
  @Input() animationAuto: boolean = true;
  @Input() animationDisabled: boolean = false;
  @Input() fullscreenEnabled: boolean = true;
  @Input() styleClassCanvas: string = '';
  @Input() styleClassContainer: string = '';
  @Input() enableMenu: boolean = true;

  clickCount: number = 0;
  showMenu: boolean = false;
  videoUrl: string = '';
  recordingInfo: string = '';
  animationService: any;
  colorsService: any;
  isFullScreen: boolean = false;
  recording: boolean = false;

  triggerCanvasInternal: boolean = false;
  localModelID: string = '';
  id: string = '';
  class: string = 'bg-black';
  indice: number = 0;
  intervalID: number = 0;
  responsive: boolean = true;
  animationOn: boolean = false;
  withAnimation: boolean = false;
  offScreen: boolean = false;
  type: number = 0;
  fps: number = 10;
  indexImg: number = 0;
  progress: number = 0;
  urlCanvas: string = '';
  rotationY: number = 0;
  rendering3d: boolean = false;
  newDisplay: string = '';
  dataSet: any = [];
  upParams: any = [];
  params: any = {};
  componentActionHandler: any;
  applyActionHandler: any;
  uniqueID: string = '';
  resizeObserver: any = null;

  constructor(private cdr: ChangeDetectorRef) {
    this.animationService = new AnimationService();
  }
  ngOnInit() {
    setTimeout(() => {
      this.initComponent();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.clear();
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function (c) {
        const d = new Date().getTime();
        const r = (d + Math.random() * 16) % 16 | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      })
      .substring(0, 8);
  }
  cleanId(id: string) {
    return id.replace(/[^\w-]/g, '').toLowerCase();
  }

  initComponent() {
    console.log('init');
    // Initialisation des services et paramètres
    this.canvasService = new Canvas2dService();
    this.colorsService = {}; // Remplace par ton service ColorsService

    this.dataSet = [];
    this.upParams = [];
    this.params = {};

    if (this.componentData) {
      this.dataSet = this.componentData;
    }

    if (typeof this.componentID === 'string' && this.componentID !== 'componentID-1') {
      this.componentID = this.componentID;
    } else {
      this.componentID = `componentID-${this.generateUUID()}`;
    }

    this.id = `${this.id}-${this.generateUUID()}`;

    if (this.dataSet.longId) {
      this.params.longId = this.dataSet.longId;
    }

    if (this.params.longId) {
      this.uniqueID = this.cleanId(`${this.params.longId}-${new Date().toISOString()}`);
    } else {
      this.uniqueID = this.cleanId(new Date().toISOString());
    }

    this.canvasParams = {
      id: this.id,
      checksum: this.id,
      idElementCanvas: `${this.generateUUID()}-${this.id}-${this.uniqueID}`,
      idElementMenu: `${this.generateUUID()}-${this.id}-${this.uniqueID}`,
      idContainerCanvas3D: this.id + this.generateUUID(),
      componentID: this.componentID,
      formId: `${this.componentID}-form-component`,
      idCanvas3D: `${this.id + this.generateUUID()}-${this.uniqueID}`,
      idParent: this.id,
      portraitMode: this.portraitMode,
      widthLimitMode: this.widthLimitMode,
      heightResizeMode: this.heightResizeMode,
      width: this.width,
      height: this.height,
      responsive: this.responsive,
      nodeName: 'CANVAS',
      marginAutoComponent: this.marginAutoComponent,
      idElementCanvasOffscreen: `${this.generateUUID()}-${this.id}-offscreen`,
      idElementProcessCanvas: `${this.generateUUID()}-${this.id}-process`,
      enable3D: false,
      menuPosition: [],
      instanceId: this.generateUUID(),
      videoUrl: 'toto',
      enableMenu: this.enableMenu,
      styleClassCanvas: `canvas-2d ${this.styleClassCanvas}`,
      styleClassContainer: `canvas-container ${this.styleClassContainer}`,
    };
    console.log(this.canvasParams);

    /*
    this.componentActionHandler = (event: any) => {
      this.componentAction(event.detail.actionName, event.detail);
    };

    this.applyActionHandler = (event: any) => {
      this.applyAction(event.detail.actionName, event.detail);
    };

    this.handleKeys();*/
    this.initRender();
  }

  initRender() {
    this.clear();
    if (this.canvasParams && document.getElementById(this.canvasParams.id)) {
      this.newDisplay = '';
      this.indice = 0;

      if (this.fullscreenEnabled) {
        //this.initFullScreen();
      }

      //this.setImgProperties();

      if (this.dataSet.longId) {
        this.uniqueID = this.cleanId(`${this.dataSet.longId}-${new Date().toISOString()}`);
      }

      //this.handleKeys();
      this.intervalID = 0;
      return true;
    }
    return false;
  }

  setInstance() {
    this.canvasParams.instanceId = this.generateUUID();
  }
  initCanvas(bStopAnimations: any, b3D: any) {
    if (typeof bStopAnimations !== 'boolean' || bStopAnimations === true) {
      //this.setAnimationEnd();
    }

    this.canvasService.setParams(this.canvasParams);
    this.canvasService.clearCanvas3D();
    this.canvasService.showCanvas();
    this.setInstance();

    if (this.canvasService.initCanvas(this.id, this.canvasParams.idElementCanvas)) {
      console.log('init canvas ok');
      this.canvasService.clear();
      this.canvasService.responsive = this.responsive;
      this.canvasService.isFullScreen = this.isFullScreen;
      this.canvasService.portraitMode = this.portraitMode;
      this.canvasService.heightResizeMode = this.heightResizeMode;
      this.canvasService.widthLimitMode = this.widthLimitMode;
      this.canvasService.checksum = this.canvasParams.checksum;
      this.canvasService.idElementCanvasOffscreen = this.canvasParams.idElementCanvasOffscreen;

      console.log(this.canvasService);
      this.canvasService.initDimensions(this.width, this.height, [0, 0, 0, 0]);
      this.canvasService.fillCanvasParams(this.canvasParams);

      //this.toggleCanvas3D(b3D === true);

      //if (this.initCanvas3D()) {}
      /*
      if (this.fullscreenEnabled === true) {
        this.initFullScreen();
      } else {
        this.disableFullScreen();
      }*/
      return true;
    }
    return false;
  }

  /*
  @Input()
  set triggerCanvas(value: boolean) {
    this._triggerCanvas = value;
    if (value) {
      this.handleTriggerCanvas();
    }
  }
  get triggerCanvas(): boolean {
    return this._triggerCanvas;
  }*/
  private _triggerCanvas: boolean = false;

  handleTriggerCanvas() {
    if (this.canvasParams.action === 'init_record') {
      this.startVideo();
    } else if (this.canvasParams.action === 'start_video') {
      this.startVideo();
    } else if (this.canvasParams.action === 'add_img') {
      this.addImgForVideo();
    }
  }

  startVideo() {
    if (this.canvasService.isRecorderActive()) {
      this.recordingInfo = '[...]';
    } else {
      this.recordingInfo = '[REC]';
    }
  }

  addImgForVideo() {
    // Logique pour ajouter une image à la vidéo
  }

  handleClick(event: MouseEvent) {
    if ((event.target as HTMLElement).nodeName === 'CANVAS' && !this.isFullScreen) {
      this.clickCount++;
      if (this.clickCount === 1) {
        this.showMenu = false;
      } else if (this.clickCount === 2) {
        this.clickCount = 0;
        this.showMenu = true;
        this.canvasParams.menuPosition = [event.offsetX - 20, event.offsetY - 50];
        console.log(this.canvasParams.menuPosition);
      }
    }
  }

  clear() {
    // Nettoyage des ressources
  }

  startComponentAnimation() {
    return this.startMainAnimation(this.fps, true, []);
  }

  setAnimationService() {
    if (this.animationService === null) {
      this.animationService = new AnimationService();
    }
  }
  startMainAnimation(fps_: number, bFirstDraw: boolean, params: any) {
    if (typeof fps_ !== 'number') {
      fps_ = this.fps;
    }
    if (typeof bFirstDraw !== 'boolean') {
      bFirstDraw = true;
    }

    this.setAnimationService();
    //this.actionsHandler.toggleAnimationButton(true, this.componentID);
    return this.startAnimation(fps_, 'animation', bFirstDraw, params);
  }
  startAnimation(fps_: number, f: any, bFirstDraw: boolean, params: any) {
    this.animationOn = true;
    return this.animationService.startAnimation(fps_, f, bFirstDraw, params);
  }
  setAnimationEnd() {
    if (this.animationService !== null) {
      this.animationService.setAnimationEnd(true);
      //this.actionsHandler.toggleAnimationButton(false, this.componentID);
      this.animationOn = false;
    }
  }

  addMainAnimation(f: any, fps: number) {
    if (this.params.disableAnimation === true) {
      return false;
    }
    this.withAnimation = true;
    this.setAnimationService();
    this.animationService.functions.animation = f;
    if (typeof fps === 'number') {
      this.fps = fps;
    }
    return true;
  }
  resumeAnimation() {
    if (
      this.animationService != null &&
      this.disableAnimation === false &&
      this.animationService.getAnimationRunning() === false
    ) {
      this.animationOn = true;
      //this.actionsHandler.toggleAnimationButton(true, this.componentID);
      if (this.animationService.getAnimationEnd() === true) {
        // init animation
        return this.startComponentAnimation();
      } else {
        // resume animation
        this.canvasService.urlImgDrawComplete = '';
        this.animationService.setAnimationRunning(true);
        return true;
      }
    }
    return false;
  }
}
