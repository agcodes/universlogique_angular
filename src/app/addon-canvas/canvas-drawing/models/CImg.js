import CShape from './CShape';

export default class CImg extends CShape {
  constructor(x_, y_, width_, height_, strokeColor_, name_) {
    super(x_, y_, width_, height_, null, strokeColor_, name_);
    this.url = name_;
    this.resizeRatio = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
  }
  getUrl() {
    return this.url;
  }
  center(w, h) {
    this.position[0] = this.position[0] + (w / 2 - this.width / 2);
    this.position[1] = this.position[1] + (h / 2 - this.height / 2);
  }
  loadImg(
    dImg,
    loaded,
    context,
    offset,
    callback,
    resizeRatio,
    canvasWidth,
    canvasHeight,
    centerPosition,
    autoResize,
  ) {
    if (loaded) {
      return;
    }
    if (this.getWidth() === 0 && resizeRatio) {
      this.naturalHeight = dImg.naturalHeight;
      this.naturalWidth = dImg.naturalWidth;

      this.width = dImg.naturalWidth;
      this.height = dImg.naturalHeight;

      if (autoResize) {
        this.width = canvasWidth;
        this.height = (dImg.naturalHeight * this.width) / this.naturalWidth;
      } else if (resizeRatio !== 1) {
        this.width = this.width * resizeRatio;
        this.height = (dImg.naturalHeight * this.width) / this.naturalWidth;
      }
      if (this.getWidth() > canvasWidth) {
        this.width = canvasWidth;
        this.height = (dImg.naturalHeight * this.width) / this.naturalWidth;
      }
    }

    if (centerPosition) {
      this.center(canvasWidth, canvasHeight);
    }

    context.drawImage(
      dImg,
      this.getX() + offset[0],
      this.getY() + offset[1],
      this.getWidth(),
      this.getHeight(),
    );

    if (callback) {
      callback();
    }
  }
  displayWithCallBack(
    context,
    offset,
    callback,
    resizeRatio,
    canvasWidth,
    canvasHeight,
    centerPosition,
    autoResize,
  ) {
    let loaded = false;
    this.callback = callback;
    this.offset = offset;

    const loadHandler = () => {
      this.loadImg(
        dImg,
        loaded,
        context,
        offset,
        callback,
        resizeRatio,
        canvasWidth,
        canvasHeight,
        centerPosition,
        autoResize,
      );
      loaded = true;
    };

    const dImg = new Image();
    dImg.src = this.getUrl();

    if (dImg.complete) {
      loadHandler();
    }

    dImg.onload = function () {
      loadHandler();
    };
    
    return true;
  }
  display(context, offset) {
    const dImg = new Image();
    dImg.src = this.url;
    dImg.onload = () => {
      context.drawImage(
        dImg,
        this.position[0] + offset[0],
        this.position[1] + offset[1],
        this.getWidth(),
        this.getHeight(),
      );
    };
  }
}
