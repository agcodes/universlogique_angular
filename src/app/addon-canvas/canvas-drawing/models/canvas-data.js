export default class CanvasData {
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
  getImageData() {
    return this.imagedata;
  }
  getData() {
    return this.imagedata.data;
  }
  setData(data) {
    this.imagedata.data = data;
  }
  addBackgroundInImageData(color) {
    if (color === null) {
      return false;
    }
    for (let _i = 0; _i < this.imagedata.data.length; _i += 4) {
      this.imagedata.data[_i] = color[0];
      this.imagedata.data[_i + 1] = color[1];
      this.imagedata.data[_i + 2] = color[2];
      this.imagedata.data[_i + 3] = 255;
    }
    return true;
  }
  testImageData() {
    let j = 0;
    for (let _i = 0; _i < this.imagedata.data.length; _i += 4) {
      this.imagedata.data[_i + 1] = Math.round(Math.random() * 255);
      this.imagedata.data[_i + 2] = Math.round(Math.random() * 255);
      this.imagedata.data[_i + 3] = Math.round(Math.random() * 255);
      j++;
      if (j > 255) {
        j = 0;
      }
    }
  }
  addPointsInData(pts, color, size) {
    if (pts === null) {
      return false;
    }
    if (typeof pts !== 'object') {
      return false;
    }
    for (let i = 0; i < pts.length; i++) {
      if (pts[i][3]) {
        // specific color
        this.addOnePointInData(pts[i], pts[i][3], size);
      } else {
        this.addOnePointInData(pts[i], color, size);
      }
    }

    return true;
  }
  addOnePointInData(pt, color, size) {
    let x = Math.floor(pt[0]) + this.offSet[0];
    let y = Math.floor(pt[1]) + this.offSet[1];

    let i = 0;
    let j = 0;
    let k = 0;
    if (size % 2 === 0) {
      x -= size / 2;
      y -= size / 2;
    } else if (size > 1) {
      x -= (size - 1) / 2;
      y -= (size - 1) / 2;
    }

    for (let indexY = 0; indexY < size; indexY++) {
      for (let indexX = 0; indexX < size; indexX++) {
        if (x + 1 > this.imagedata.width) {
          return false;
        }
        if (y + 1 > this.imagedata.height) {
          return false;
        }
        i = Math.floor(x) * 4;
        j = Math.floor(y) * this.w * 4;

        k = i + j;

        if (k >= 0 && this.imagedata.data.length > k + 3) {
          this.imagedata.data[k] = color[0];
          this.imagedata.data[k + 1] = color[1];
          this.imagedata.data[k + 2] = color[2];
          if (typeof color[3] === 'number') {
            this.imagedata.data[k + 3] = color[3];
          } else {
            this.imagedata.data[k + 3] = 255;
          }
        }
        x++;
      }
      y++;
    }
    return true;
  }
}
