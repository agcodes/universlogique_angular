import CImg from './CImg';
import CRect from './CRect';
import CLine from './CLine';
import CanvasData from './canvas-data';
import CanvasData32 from './canvas-data-32';
import Filter from './filters/Filter';
import ShapesGenerator from './shapesgenerator';
import CanvasService from './canvas-service';
import Canvas3dService from './canvas3d-service';
import DrawService from './draw-service';
import GridAdapterService from '@calc-utils/models/grid-adapter-service';
import piexif from 'piexifjs';

export default class Canvas2dService extends CanvasService {
  isFullScreen = false;
  responsive = true;
  offsetX = 0;
  offsetY = 0;
  drawingMargin = null;
  portraitMode = 'square';
  heightResizeMode = 'window';
  widthLimitMode = '';
  canvasWidth = 0;
  canvasHeight = 0;
  drawingWidth = 0;
  drawingHeight = 0;
  limitWidth = 0;
  limitHeight = 0;
  limitX0 = 0;
  limitY0 = 0;
  context = null;
  idParent = 0;
  position = null;
  inverseY = null;
  margin = null;
  portrait = false;
  objects = null;
  data = null;
  canvasData = null;
  imageData = null;
  imageDataType = 32;
  buffer = null;
  imageBuffer = null;
  bufferCanvas = null;
  bufferContext = null;
  callback = null;
  ratioWH = 0;
  drawService = null;
  gridAdapter = null;
  shapesGenerator = null;
  checksum = '';
  urlImg = '';
  urlImgDrawComplete = '';
  offScreenCanvas = null;
  filter = null;
  idElementCanvasOffscreen = '';
  stream = null;
  params = null;
  styleMarginBottom = 0;
  canvas3d = null;
  constructor() {
    super();
    this.drawService = new DrawService();
    this.gridAdapter = new GridAdapterService();
    this.shapesGenerator = new ShapesGenerator();
    this.filter = new Filter();
    this.urlImgs = [];
    this.enable3D = false;
    this.canvas3D = null;
  }
  reset() {
    this.resetCanvas();
    this.clearCanvas3D();
    this.gridAdapter = new GridAdapterService();
  }
  resetCanvas() {
    this.clear();
    this.filter = new Filter();
    this.buffer = null;
    this.imageBuffer = null;
    this.bufferCanvas = null;
    this.bufferContext = null;
    this.canvasData = null;
    this.imageData = null;
    this.urlImgDrawComplete = '';
    this.urlImg = '';
  }
  getPortrait() {
    return this.portrait;
  }
  setOffSetY(y) {
    this.offsetY = y;
  }
  getCenter() {
    return [this.getXCenter(), this.getYCenter()];
  }
  getXCenter() {
    return this.drawingWidth / 2;
  }
  getYCenter() {
    return this.drawingHeight / 2;
  }
  getWidth() {
    return this.drawingWidth;
  }
  getHeight() {
    return this.drawingHeight;
  }
  setWidth(w) {
    this.drawingWidth = w;
  }
  setHeight(h) {
    this.drawingHeight = h;
  }
  setGlobalCompositeOperation(f) {
    this.context.globalCompositeOperation = f;
  }
  setGlobalAlpha(a) {
    this.context.globalAlpha = a;
  }
  hideCanvas() {
    this.clear();
    if (this.canvasElement) {
      this.canvasElement.setAttribute('style', 'display:none;');
    }
  }
  showCanvas() {
    if (this.canvasElement) {
      let value = this.canvasElement.getAttribute('style');
      if (value !== null) {
        value = value.replace('display:none;', '');
        this.canvasElement.setAttribute('style', value);
      }
    }
  }
  setParams(params) {
    this.params = params;
  }
  setCanvasElement(idCanvas) {
    this.canvasElement = document.getElementById(idCanvas);
  }
  initCanvas(idParent, idCanvas) {
    console.log(idParent, idCanvas);
    this.resetCanvas();
    this.gridAdapter.reset();
    this.idParent = idParent;
    const container = document.getElementById(this.idParent);

    if (typeof idCanvas === 'string') {
      this.canvasElement = document.getElementById(idCanvas);
      this.idElementCanvas = idCanvas;
    } else {
      if (container === null) {
        console.error("container null");
        return false;
      }
      const canvasList = container.getElementsByTagName('canvas');
      if (canvasList.length === 0) {
        console.error("canvas list empty");
        return false;
      }

      console.log(canvasList);
      // get first canvas
      this.canvasElement = canvasList[0];
    }

    if (this.canvasElement == null) {
      console.error("canvas element null");
      return false;
    }

    this.setContext();

    if (container) {
      // get initial container dimensions
      this.canvasWidth = container.offsetWidth;
      this.canvasHeight = container.clientHeight;

      // drawing surface (by default)
      this.drawingWidth = this.canvasWidth;
      this.drawingHeight = this.canvasHeight;

      if (
        typeof this.canvasElement.id === 'string' &&
        this.canvasElement.id !== ''
      ) {
        this.position = this.getPos(this.canvasElement.id);
      } else {
        this.position = this.getPos(idParent);
      }
    }

    this.objects = [];

    this.setSizeForServices();
    return true;
  }
  initDimensions(w, h, margins) {
    this.canvasHeight = 0;
    this.drawingWidth = 0;
    this.drawingHeight = 0;
    this.offsetY = 0;

    const d = document;
    const g = d.getElementsByTagName('body')[0];
    const windowWidth = window.innerWidth || g.clientWidth;
    const windowHeight = window.innerHeight || g.clientHeight;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const bodyRect = d.body.getBoundingClientRect();

    if (this.params.marginAutoComponent == true) {
      // apply margin bottom from component
      const elementBottom = document.getElementById(this.params.componentID);
      if (elementBottom) {
        const styles1 = window.getComputedStyle(elementBottom);
        if (styles1) {
          const margin2 = parseInt(styles1.marginBottom);
          margins[2] = margin2;
        }
      }
    }
    const elemRect = this.canvasElement.getBoundingClientRect();
    // hauteur entre le haut du canvas et le haut du body (barre de navigation du site)
    const offsetTop = elemRect.top - bodyRect.top;

    this.portrait = windowHeight > windowWidth;

    this.drawingWidth = this.canvasWidth;

    const heightToWindowBottom = Math.round(windowHeight - offsetTop - margins[2]) + 4;

    if (this.isFullScreen === true) {
      // fullscreen
      this.canvasWidth = screenWidth;
      this.canvasHeight = screenHeight;
      this.drawingWidth = this.canvasWidth;
      this.drawingHeight = this.canvasHeight;
      this.portrait = false;
    } else if (h !== 0 && w === 0) {
      // fixed height
      this.canvasHeight = h;
      this.drawingHeight = this.canvasHeight;
      this.portrait = h > this.canvasWidth;
      if (this.portrait && this.portraitMode === 'square-center') {
        // square in the center of the screen
        this.drawingHeight = this.drawingWidth;
        this.offsetY = Math.round((h - this.canvasWidth) / 2);
      }
      if (this.portrait && this.portraitMode === 'square') {
        // square in the center of the screen
        this.drawingHeight = this.drawingWidth;
        this.offsetY = 0;
      }
    } else if (h !== 0 && w !== 0) {
      console.log("reee");
      if (elemRect && w > windowWidth) {
        //w = windowWidth*0.8;
        //h = w;
      }
      // fixed height and width
      this.canvasHeight = h;
      this.canvasWidth = w;
      this.drawingWidth = this.canvasWidth;
      this.drawingHeight = this.canvasHeight;
      this.portrait = false;
      this.responsive = false;
    } else {
      if (this.portrait === true) {
        if (this.portraitMode === 'square') {
          // height = width
          this.canvasHeight = this.canvasWidth;
          this.drawingHeight = this.canvasWidth;
          this.styleMarginBottom = margins[2];
        } else if (this.portraitMode === 'square-center') {
          // square in the center of the screen
          this.canvasHeight = heightToWindowBottom;
          this.drawingHeight = this.drawingWidth;
          this.offsetY = Math.round(
            (windowHeight - offsetTop - windowWidth) / 2,
          );
        } else if (this.portraitMode === 'window') {
          // full height
          this.canvasHeight = heightToWindowBottom;
          this.drawingHeight = this.canvasHeight;
        }
      } else {
        if (this.heightResizeMode === 'window') {
          this.canvasHeight = heightToWindowBottom;
          this.drawingHeight = this.canvasHeight;
        }
      }
    }

    this.canvasWidth = Math.round(this.canvasWidth);
    this.canvasHeight = Math.round(this.canvasHeight);
    this.drawingWidth = Math.round(this.drawingWidth);
    this.drawingHeight = Math.round(this.drawingHeight);
    this.offsetY = Math.round(this.offsetY);

    this.setLimitDimensions();

    this.setSizeForServices();
    this.setCanvasHTMLSizeAttributes(this.canvasWidth, this.canvasHeight);
  }
  getIsLandscape() {
    return (
      this.isFullScreen ||
      (this.portrait === false &&
        this.responsive === true &&
        this.widthLimitMode === '')
    );
  }
  setLimitDimensions(margin) {
    this.limitWidth = this.drawingWidth;
    this.limitHeight = this.drawingHeight;
    this.limitX0 = 0;
    this.limitY0 = 0;

    if (this.portrait === false && this.widthLimitMode === 'h') {
      this.limitHeight = Math.round(this.drawingHeight);
      this.limitWidth = Math.round(this.drawingHeight);
    }
    else {
      this.limitHeight = Math.round(this.drawingHeight);
      this.limitWidth = Math.round(this.drawingWidth);
    }

    this.ratioWH = this.drawingWidth / this.drawingHeight;

    if (typeof margin !== 'object') {
      margin = [0, 0];
    }

    const marginPx = [
      Math.round(margin[0] * this.limitWidth),
      Math.round(margin[1] * this.limitHeight),
    ];

    this.limitWidth -= marginPx[0];
    this.limitHeight -= marginPx[1];

    if (this.widthLimitMode === 'h') {
      if (this.canvasWidth > this.canvasHeight) {
        this.limitX0 =
          Math.round((this.canvasWidth - this.canvasHeight) / 2) +
          marginPx[0] / 2;
      }
    } else {
      this.limitX0 = marginPx[0] / 2;
    }

    this.limitY0 = Math.round(this.offsetY) + marginPx[1] / 2;

    this.gridAdapter.gridChanged =
      Math.abs(this.limitWidth - this.gridAdapter.limitWidth) > 2 ||
      Math.abs(this.limitHeight - this.gridAdapter.limitHeight) > 2;
  }
  getShapesGenerator(w, h) {
    const shapesGenerator = new ShapesGenerator();
    shapesGenerator.setHeight(h);
    shapesGenerator.setWidth(w);
    return shapesGenerator;
  }
  setSizeForServices() {
    this.shapesGenerator.setHeight(this.drawingHeight);
    this.shapesGenerator.setWidth(this.drawingWidth);

    this.gridAdapter.setHeight(this.drawingHeight);
    this.gridAdapter.setWidth(this.drawingWidth);

    this.drawService.canvasWidth = this.canvasWidth;
    this.drawService.canvasHeight = this.canvasHeight;

    this.drawService.drawingWidth = this.drawingWidth;
    this.drawService.drawingHeight = this.drawingHeight;

    this.drawService.limitWidth = this.limitWidth;
    this.drawService.limitHeight = this.limitHeight;

    this.drawService.limitX0 = this.limitX0;
    this.drawService.limitY0 = this.limitY0;

    this.gridAdapter.limitWidth = this.limitWidth;
    this.gridAdapter.limitHeight = this.limitHeight;

    this.gridAdapter.limitX0 = this.limitX0;
    this.gridAdapter.limitY0 = this.limitY0;
  }
  setContext() {
    this.context = null;
    if (this.canvasElement) {
      this.context = this.canvasElement.getContext('2d');
      this.drawService.context = this.context;
      return !this.context;
    }
    return false;
  }
  clear() {
    if (this.context && this.canvasElement) {
      this.context.clearRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height,
      );
    }
  }
  getLimitWidth() {
    return this.limitWidth;
  }
  getLimitHeight() {
    return this.limitHeight;
  }
  setDimension(w, h) {
    if (w > 0) {
      this.canvasWidth = w;
      this.drawingWidth = w;
      this.limitWidth = w;
    }
    if (h > 0) {
      this.canvasHeight = h;
      this.drawingHeight = h;
      this.limitHeight = h;
    }

    this.setCanvasHTMLSizeAttributes(w, h);

    this.setSizeForServices();
  }
  /**
   *
   * @param {type} event
   * @returns {Array}
   */
  getMousePosOnCanvas(event) {
    const absPos = this.getMousePos(event);
    const canvasPos = this.getPos();
    return [absPos[0] - canvasPos[0], absPos[1] - canvasPos[1]];
  }
  getPos() {
    if (this.canvasElement) {
      const rect = this.canvasElement.getBoundingClientRect();
      return [rect.left, rect.top];
    }
    return [0, 0];
  }
  getMousePos(event) {
    event = event || window.event; // IE-ism
    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX === null && event.clientX !== null) {
      const eventDoc =
        (event.target !== null && event.target.ownerDocument) || document;
      const doc = eventDoc.documentElement;
      const body = eventDoc.body;
      event.pageX =
        event.clientX +
        ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
        ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
      event.pageY =
        event.clientY +
        ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
        ((doc && doc.clientTop) || (body && body.clientTop) || 0);
    }
    return [event.clientX, event.clientY];
  }
  setCanvasHTMLSizeAttributes(w, h) {
    if (this.canvasElement) {
      this.canvasElement.setAttribute('width', w);
      this.canvasElement.setAttribute('height', h);
      if (this.styleMarginBottom > 0) {
        this.canvasElement.style.marginBottom = `${this.styleMarginBottom}px`;
      }

      if (this.isFullScreen == false) {
        this.canvasElement.style.width = `${w}px`;
        this.canvasElement.style.height = `${h}px`;
      }
      return true;
    }
    else {
      console.log("canvas element null");
    }
    return false;
  }
  getWindowWidth() {
    const w = window;
    const d = document;
    const g = d.getElementsByTagName('body')[0];
    return w.innerWidth || g.clientWidth;
  }
  getParentWidth() {
    const container = document.getElementById(this.idParent);
    if (container !== null && typeof container === 'object') {
      return container.offsetWidth;
    }
    return 0;
  }
  defVector(pt1, pt2) {
    return [pt2[0] - pt1[0], pt2[1] - pt1[1]];
  }
  applyVector(pt, v) {
    return [pt[0] + v[0], pt[1] + v[1]];
  }
  setUrlImg(type) {
    this.urlImg = this.getUrlImg(type, 1);
    return this.urlImg;
  }
  setUrlImgDrawComplete(type) {
    this.urlImgDrawComplete = this.getUrlImg(type, 1);
    return this.urlImgDrawComplete;
  }
  // quality 0-1
  getUrlImg(type, quality) {
    if (type === 'jpg') {
      return this.canvasElement.toDataURL('image/jpeg', quality);
    }
    return this.canvasElement.toDataURL('image/png', quality);
  }
  getUrlPng(quality) {
    return this.canvasElement.toDataURL('image/png', quality);
  }
  getUrlJpeg(quality) {
    return this.canvasElement.toDataURL('image/jpeg', quality);
  }
  download(type, name, quality, imgProperties) {
    if (this.enable3D) {
      this.canvas3d.download(type, name, 1);
    } else if (type === 'jpg') {
      this.downloadImgUrl(
        `${name}.${type}`,
        this.getUrlJpeg(quality),
        type,
        imgProperties,
      );
    } else if (type === 'png') {
      this.downloadImgUrl(
        `${name}.${type}`,
        this.getUrlPng(quality),
        type,
        imgProperties,
      );
    }
  }
  downloadUrlImgs(id) {
    let i = 0;

    const intervalId = setInterval(() => {
      if (i < this.urlImgs.length) {
        this.downloadImgUrl(`${id}-${i}`, this.urlImgs[i], 'jpg', null);
        i++;
      } else {
        // Stop the interval when all URLs are processed
        clearInterval(intervalId);
      }
    }, 100);
  }
  downloadImgUrl(name, href, type, imgProperties) {
    if (href) {
      const link = document.createElement('a');
      link.download = name;

      if (type) {
        const zeroth = {};
        const exif = {};
        const gps = {};
        if (imgProperties) {
          zeroth[piexif.ImageIFD.Make] = imgProperties.Make;
          zeroth[piexif.ImageIFD.Software] = imgProperties.Software;
          zeroth[piexif.ImageIFD.ImageDescription] =
            imgProperties.ImageDescription;
          zeroth[piexif.ImageIFD.Artist] = imgProperties.Artist;
        }

        try {
          const exifObj = { '0th': zeroth, Exif: exif, GPS: gps };
          const exifbytes = piexif.dump(exifObj);
          const newData = piexif.insert(exifbytes, href);
          link.href = newData;
        } catch (error) {
          link.href = href;
        }
      } else {
        link.href = href;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  createBuffer() {
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.width = this.canvasWidth;
    this.bufferCanvas.height = this.canvasHeight;
    this.imageBuffer = new Image(this.canvasWidth, this.canvasHeight);
    this.imageBuffer[0] = 155;
    this.bufferContext = this.bufferCanvas.getContext('2d');
  }
  putImageBuffer() {
    this.context.drawImage(this.bufferCanvas, 0, 0);
  }
  saveContext() {
    this.context.save();
  }
  addPointsInBuffer(pts, color, size) {
    const r = new CRect();
    r.displayPoints(
      this.bufferContext,
      pts,
      [this.offsetX, this.offsetY],
      color,
      size,
      this.canvasWidth,
      this.canvasHeight,
    );
  }
  addBackgroundInBuffer(color) {
    if (color !== null && typeof color === 'object') {
      this.drawService.drawOneObject(
        new CRect(0, 0, this.canvasWidth, this.canvasHeight, color),
        false,
        0,
        0,
        this.bufferContext,
      );
    }
  }
  getImageDataFromBuffer() {
    this.imagedata = this.bufferContext.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    );
    this.imageDataType = 1;
    this.setCanvasData();
  }
  getImageData() {
    this.imagedata = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    );
    this.imageDataType = 1;
    this.setCanvasData();
  }
  createImageData(limitDraw, imageDataType) {
    if (typeof imageDataType === 'number') {
      this.imageDataType = imageDataType;
    }
    if (limitDraw === true) {
      this.imagedata = this.context.createImageData(
        this.limitWidth,
        this.limitHeight,
      );
    } else {
      this.imagedata = this.context.createImageData(
        this.canvasWidth,
        this.canvasHeight,
      );
    }
    this.setCanvasData(limitDraw);
  }
  setCanvasData(limitDraw) {
    if (limitDraw === true && this.gridAdapter !== null) {
      this.gridAdapter.useImageData = true;
      this.gridAdapter.setCenterAbs(false);
    }

    let w = this.canvasWidth;
    let h = this.canvasHeight;
    let x = this.offsetX;
    let y = this.offsetY;

    if (limitDraw === true) {
      w = this.limitWidth;
      h = this.limitHeight;
      x = this.limitX0;
      y = this.limitY0;
    }

    if (this.imageDataType === 32) {
      this.canvasData = new CanvasData32();
      this.canvasData.initialize(this.imagedata, w, h, [x, y]);
    } else {
      this.data = this.imagedata.data;
      this.canvasData = new CanvasData();
      this.canvasData.initialize(this.imagedata, w, h, [x, y]);
    }
    this.canvasData.getImageData(this.imagedata);
  }
  addBackgroundInImageData(color) {
    if (color === null) {
      return false;
    }
    return this.canvasData.addBackgroundInImageData(color);
  }
  addBackgroundInDrawingArea(color) {
    if (color === null) {
      return false;
    }
    return this.canvasData.addBackgroundInDrawingArea(
      color,
      this.limitWidth,
      this.limitHeight,
      1,
      1,
    );
  }
  getCanvasPts(ignoreBlackPts) {
    return this.canvasData.getPoints(ignoreBlackPts);
  }
  getPointValueInData(pt) {
    return this.canvasData.getPointValue(pt);
  }
  addPointsInData(pts, color, size) {
    if (pts === null || pts.length === 0) {
      return false;
    }
    if (this.canvasData === null) {
      return false;
    }
    if (typeof size === 'undefined') {
      size = 1;
    }
    return this.canvasData.addPointsInData(pts, color, size);
  }
  updateImageData(pts, color, size) {
    if (pts === null) {
      return false;
    }
    if (this.canvasData === null) {
      return false;
    }
    this.canvasData.addPointsInData(pts, color, size);
    return this.putImageData();
  }
  getDataArr() {
    // return image data as 2D array, one 4 element array per pixel
    // [[r,g,b,a],...[r,g,b,a]] for easier looping
    const imageData = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    );
    const data = imageData.data;
    const length = data.length;
    const arr = new Array(length / 4);
    let i = 0;
    while (i < length) {
      arr[i / 4] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      i += 4;
    }
    return arr;
  }
  putImageData(useGridAdapterLimits, pts, x0, y0, x1, y1, w, h) {
    this.urlImgDrawComplete = '';

    if (typeof x0 !== 'number') {
      x0 = this.limitX0;
    }

    if (typeof y0 !== 'number') {
      y0 = this.limitY0;
    }

    if (this.imageDataType === 32) {
      this.canvasData.getImageData(this.imagedata);
    } else {
      this.imagedata = this.canvasData.getImageData();
    }

    if (pts !== null && typeof pts === 'object') {
      this.gridAdapter.defGridLimit(pts);
    }

    if (useGridAdapterLimits === true) {
      w = this.gridAdapter.getDrWidth() + this.offsetX + 1;
      h = this.gridAdapter.getDrHeight() + this.offsetY + 1;
      x1 = this.gridAdapter.getDrX0() + this.offsetX - 1;
      y1 = this.gridAdapter.getDrY0() + this.offsetY - 1;
      if (x1 < 0) {
        x1 = 0;
      }
      if (y1 < 0) {
        y1 = 0;
      }
      if (w > this.imagedata.width) {
        w = this.imagedata.width;
      }
      if (h > this.imagedata.height) {
        h = this.imagedata.height;
      }
      this.context.putImageData(this.imagedata, x0, y0, x1, y1, w, h);
      return true;
    }

    if (x0 > this.imagedata.width) {
      return false;
    }
    if (y0 > this.imagedata.height) {
      return false;
    }

    if (typeof w !== 'number') {
      this.context.putImageData(this.imagedata, x0, y0);
    } else {
      if (w - x0 > this.imagedata.width) {
        w = this.imagedata.width - x0;
      }

      if (h - y0 > this.imagedata.height) {
        h = this.imagedata.height - y0;
      }
      this.context.putImageData(this.imagedata, x0, y0, x0, y0, w, h);
    }
    return true;
  }
  initCanvas3D(canvasParams) {
    this.setCanvas3D(canvasParams);
    const initResult = this.canvas3d.init3d(
      this.canvasWidth,
      this.canvasHeight,
      this.limitWidth,
      this.limitHeight,
      [this.offsetX, this.offsetY],
      canvasParams,
    );
    this.canvas3d.render();
    if (initResult) {
      // hide canvas2d
      this.hideCanvas();
    }
    return initResult;
  }
  setCanvas3D(canvasParams) {
    this.enable3D = true;
    this.canvas3d = new Canvas3dService();
    this.canvas3d.setParams(canvasParams);
  }
  clearCanvas3D() {
    if (this.is3DInitialized()) {
      this.canvas3d.clear();
    }
  }
  drawYAxis(w, color, marginMin, marginMax, adapt) {
    if (typeof marginMin !== 'number') {
      marginMin = 0;
    }
    if (typeof marginMax !== 'number') {
      marginMax = 0;
    }
    if (adapt === false) {
      return this.drawService.drawPath(
        [
          [this.canvasWidth * 0.5, this.canvasHeight * (1 + marginMin)],
          [this.canvasWidth * 0.5, this.canvasHeight * (1 + marginMax)],
        ],
        w,
        color,
      );
    }

    return this.drawService.drawPath(
      this.gridAdapter.getPointsOnPlan(
        [
          [0, this.gridAdapter.ptMin[1] * (1 + marginMin)],
          [0, 0],
          [0, this.gridAdapter.ptMax[1] * (1 + marginMax)],
        ],
        false,
      ),
      w,
      color,
    );
  }
  drawXAxis(w, color, marginMin, marginMax, adapt) {
    if (typeof marginMin !== 'number') {
      marginMin = 0;
    }
    if (typeof marginMax !== 'number') {
      marginMax = 0;
    }

    if (adapt === false) {
      return this.drawService.drawPath(
        [
          [0, this.canvasHeight * (1 + marginMin)],
          [this.canvasWidth, this.canvasHeight * (1 + marginMax)],
        ],
        w,
        color,
      );
    }

    return this.drawService.drawPath(
      this.gridAdapter.getPointsOnPlan(
        [
          [this.gridAdapter.ptMin[0] * (1 + marginMin), 0],
          [0, 0],
          [this.gridAdapter.ptMax[0] * (1 + marginMax), 0],
        ],
        false,
      ),
      w,
      color,
    );
  }
  rbgFilter(color) {
    if (this.setOffScreenCanvas()) {
      new Filter().changeRgb(this.offScreenCanvas, color);
    }
  }
  invertFilter() {
    if (this.setOffScreenCanvas()) {
      new Filter().invert(this.offScreenCanvas);
    }
  }
  monoColorFilter(color) {
    if (this.setOffScreenCanvas()) {
      new Filter().monoColorFilter(this.offScreenCanvas, color);
    }
  }
  gaussianFilter(a) {
    if (this.setOffScreenCanvas()) {
      new Filter().generateGaussianKernel(this.offScreenCanvas, a);
    }
  }
  grayScaleFilter() {
    if (this.setOffScreenCanvas()) {
      new Filter().greyScale(this.offScreenCanvas);
    }
  }
  edgeDetectFilter(level) {
    if (this.setOffScreenCanvas()) {
      this.filter = new Filter();
      this.filter.edgeDetect(this.offScreenCanvas, level);
    }
  }
  edgeThinningFilter(color, level) {
    if (this.edgeDetectFilter(level)) {
      this.filter.edgeThinFilter(this.offScreenCanvas, color);
    }
  }
  houghTransformFilter(level) {
    if (this.edgeDetectFilter(level)) {
      this.filter.houghTransform(this.offScreenCanvas);
    }
  }
  applyFilter(data, colorsService) {
    switch (data.type) {
      case 'edgeDetectOn':
        this.edgeDetectFilter(data.level);
        return this.displayOffScreenCanvas(false);
      case 'edgeDetect':
        this.edgeDetectFilter(data.level);
        return this.displayOffScreenCanvas(true, [255, 255, 255]);
      case 'edgeDetectInvert':
        this.edgeDetectFilter(data.level);
        return this.displayOffScreenCanvas(true, [0, 0, 0], 'invert', 1);
      case 'invertColors':
        this.invertFilter();
        return this.displayOffScreenCanvas(true);
      case 'monoColor':
        if (typeof data.colorHexa === 'string') {
          this.monoColorFilter(colorsService.hexToRgb(data.colorHexa));
        } else {
          this.monoColorFilter([255, 255, 255]);
        }
        return this.displayOffScreenCanvas(true);
      case 'RG':
        this.rbgFilter([null, null, 0, null]);
        return this.displayOffScreenCanvas(true);
      case 'GB':
        this.rbgFilter([0, null, null, null]);
        return this.displayOffScreenCanvas(true);
      case 'RB':
        this.rbgFilter([null, 0, null, null]);
        return this.displayOffScreenCanvas(true);
      case 'gaussian':
        if (data.filter) {
          this.gaussianFilter(data.level);
        }
        else {
          this.gaussianFilter(4);
        }
        return this.displayOffScreenCanvas(true);
      case 'sepia':
        return this.displayOffScreenCanvas(
          true,
          null,
          'sepia',
          parseInt(data.level) / 100,
        );
      case 'drop-shadow':
        return this.displayOffScreenCanvas(
          true,
          null,
          'drop-shadow',
          parseInt(data.level),
        );
      case 'white-balance':
        return this.displayOffScreenCanvas(
          true,
          null,
          'white-balance',
          parseInt(data.level),
        );
      case 'invert':
        return this.displayOffScreenCanvas(true, null, 'invert', 1);
      case 'hue-rotate':
        return this.displayOffScreenCanvas(
          true,
          null,
          'hue-rotate',
          data.level,
        );
      default:
        return false;
    }
  }
  displayOffScreenCanvas(clear, bgColor, filter, level) {
    if (this.urlImgDrawComplete === '') {
      this.setUrlImgDrawComplete();
    }

    this.setUrlImg();

    if (this.offScreenCanvas === null) {
      this.setOffScreenCanvas();
    }

    if (this.offScreenCanvas !== null) {
      this.offScreenCanvas.setUrlImg();
      if (clear === true) {
        this.clear();
      }

      if (typeof bgColor === 'object' && bgColor !== null) {
        this.drawService.drawOneObject(
          new CRect(
            this.limitX0,
            this.limitY0,
            this.limitWidth,
            this.limitHeight,
            bgColor,
          ),
          false,
          0,
          0,
        );
      }

      switch (filter) {
        case 'sepia':
          this.context.filter = `sepia(${level})`;
          break;
        case 'invert':
          this.context.filter = `invert(${level})`;
          break;
        case 'hue-rotate':
          this.context.filter = `hue-rotate(${level}deg)`;
          break;
        case 'grayscale':
          this.context.filter = `grayscale(${level})`;
          break;
        case 'drop-shadow':
          this.context.filter = `drop-shadow(${level}px ${level}px ${level}px gray)`;
          break;
        case 'contrast':
          this.context.filter = `contrast(${level})`;
          break;
        case 'white-balance':
          this.offScreenCanvas.updateCanvasWhiteBalance(level / 100);
          this.offScreenCanvas.setUrlImg();
          break;
        default:
          this.context.filter = 'none';
          break;
      }

      // copy offscren canvas img to current canvas
      this.drawService.drawImage(
        new CImg(0, 0, 0, 0, null, this.offScreenCanvas.urlImg),
        null,
        0,
        0,
        null,
        1,
        1,
      );
      // reset offscreen canvas
      this.offScreenCanvas.clear();
      this.offScreenCanvas = null;

      return true;
    }

    return false;
  }
  updateCanvasWhiteBalance(level) {
    const imageData = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    );
    this.context.putImageData(
      new Filter().performWhiteBalance(imageData, level),
      0,
      0,
    );
  }
  displaySavedCanvas(autoResize) {
    if (this.urlImg !== '') {
      this.clear();
      this.context.filter = 'none';
      return this.drawService.drawImage(
        new CImg(0, 0, 0, 0, null, this.urlImg),
        null,
        0,
        0,
        null,
        1,
        1,
        autoResize,
      );
    }
    return false;
  }
  displayFirstSavedCanvas() {
    if (this.urlImgDrawComplete !== '') {
      this.clear();
      this.context.filter = 'none';
      return this.drawService.drawImage(
        new CImg(0, 0, 0, 0, null, this.urlImgDrawComplete),
        null,
        0,
        0,
        null,
        1,
        1,
      );
    }
    return false;
  }
  setOffScreenCanvas() {
    if (this.context) {
      if (this.offScreenCanvas) {
        this.offScreenCanvas.clear();
      }
      this.offScreenCanvas = this.getOffScreenCanvas();
      this.offScreenCanvas.context.putImageData(
        this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight),
        0,
        0,
      );
      return true;
    }
    return false;
  }
  getOffScreenCanvas() {
    const offScreenCanvas = this.copyThis();
    offScreenCanvas.canvasElement = document.getElementById(
      this.idElementCanvasOffscreen,
    );
    if (offScreenCanvas.canvasElement !== null) {
      offScreenCanvas.setContext();
      offScreenCanvas.setCanvasHTMLSizeAttributes(
        this.canvasWidth,
        this.canvasHeight,
      );
      offScreenCanvas.setSizeForServices();
      offScreenCanvas.clear();
      offScreenCanvas.idElementCanvas = this.idElementCanvasOffscreen;
    }
    return offScreenCanvas;
  }
  getPointOnProcessCanvas(pt) {
    if (this.processCanvas == null) {
      return pt;
    }
    return [
      (pt[0] * this.processCanvas.width) / this.limitWidth,
      (pt[1] * this.processCanvas.height) / this.limitHeight,
    ];
  }
  setProcessCanvas(w, h) {
    this.processCanvas = new Canvas2dService();
    this.processCanvas.width = w;
    this.processCanvas.height = h;
    this.processCanvas.responsive = false;
    this.processCanvas.setParams(this.params);
    this.processCanvas.initCanvas(
      this.params.idParent,
      this.params.idElementProcessCanvas,
    );
    this.processCanvas.initDimensions(w, h, [0, 0, 0, 0]);
  }
  copyFromProcessCanvas() {
    this.context.drawImage(
      this.processCanvas.canvasElement,
      0,
      0,
      this.processCanvas.width,
      this.processCanvas.height,
      this.limitX0,
      this.limitY0,
      this.limitWidth,
      this.limitHeight,
    );
  }
  copyCanvasToOffScreenCanvas() {
    this.offScreenCanvas.clear();
    this.offScreenCanvas.context.putImageData(
      this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight),
      0,
      0,
    );
    this.setUrlImg();
  }
  addUrlImg() {
    this.urlImgs.push(this.getUrlImg('jpg', 1));
  }
  drawFromImgUrl(index) {
    if (this.urlImgs[index]) {
      return this.drawService.drawImage(
        new CImg(0, 0, 0, 0, null, this.urlImgs[index]),
        null,
        0,
        0,
        null,
        1,
        1,
        false,
        this.drawingWidth,
        this.drawingHeight,
      );
    }
    return false;
  }
  displayGrid(color) {
    const w = Math.floor(this.canvasWidth);
    const h = Math.floor(this.canvasHeight);
    const a = Math.floor(w / 3);
    const b = Math.floor(h / 3);
    const x0 = w / 2;
    const y0 = h / 2;

    this.drawService.drawOneObject(new CLine(0, y0, w, y0, color), false, 0, 0);
    this.drawService.drawOneObject(
      new CLine(0, y0 - b, w, y0 - b, color),
      false,
      0,
      0,
    );
    this.drawService.drawOneObject(
      new CLine(0, y0 + b, w, y0 + b, color),
      false,
      0,
      0,
    );

    this.drawService.drawOneObject(new CLine(x0, 0, x0, h, color), false, 0, 0);
    this.drawService.drawOneObject(
      new CLine(x0 - a, 0, x0 - a, h, color),
      false,
      0,
      0,
    );
    this.drawService.drawOneObject(
      new CLine(x0 + a, 0, x0 + a, h, color),
      false,
      0,
      0,
    );
  }
  copyThis() {
    const copyObject = new Canvas2dService();
    copyObject.canvasWidth = this.canvasWidth;
    copyObject.canvasHeight = this.canvasHeight;
    copyObject.drawingWidth = this.drawingWidth;
    copyObject.drawingHeight = this.drawingHeight;
    copyObject.limitWidth = this.limitWidth;
    copyObject.limitHeight = this.limitHeight;
    copyObject.limitX0 = this.limitX0;
    copyObject.limitY0 = this.limitY0;
    copyObject.portraitMode = this.portraitMode;
    copyObject.ratioWH = this.ratioWH;
    copyObject.heightResizeMode = this.heightResizeMode;
    copyObject.widthLimitMode = this.widthLimitMode;
    copyObject.inverseY = this.inverseY;
    copyObject.margin = this.margin;
    copyObject.portrait = this.portrait;
    copyObject.idParent = this.idParent;
    copyObject.position = this.position;
    return copyObject;
  }
  fillCanvasParams(params) {
    params.canvasWidth = this.canvasWidth;
    params.canvasHeight = this.canvasHeight;
    params.drawingWidth = this.drawingWidth;
    params.drawingHeight = this.drawingHeight;
    params.limitWidth = this.limitWidth;
    params.limitHeight = this.limitHeight;
    params.limitX0 = this.limitX0;
    params.limitY0 = this.limitY0;
    this.canvasParams = params;
  }
}
