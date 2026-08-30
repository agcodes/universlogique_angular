export default class CanvasBuffer {
  constructor() {
    this.imagedata = null;
    this.w = 0;
    this.h = 0;
    this.offSet = 0;
  }
  initialize(imagedata, w, h, offSet) {
    this.imagedata = imagedata;
    this.w = w;
    this.h = h;
    this.offSet = offSet;
  }
}
