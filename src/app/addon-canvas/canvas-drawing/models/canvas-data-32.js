export default class CanvasData32 {
  constructor() {
    this.isLittleEndian = false;
    this.buf8 = null;
    this.data = null;
    this.w = 0;
    this.h = 0;
    this.offSet = 0;
  }
  getImageData(imagedata) {
    imagedata.data.set(this.buf8);
  }
  initialize(imagedata, w, h, offSet) {
    this.w = w;
    this.h = h;

    this.offSet = offSet;
    // new buffer
    const buffer = new ArrayBuffer(imagedata.data.length);

    // Uint8ClampedArray (imagedata.data)
    this.buf8 = new Uint8ClampedArray(buffer);
    // writing object
    this.data = new Uint32Array(buffer);

    // Determine whether Uint32 is little- or big-endian.
    this.data[1] = 0x0a0b0c0d;

    this.isLittleEndian = true;
    if (
      buffer[4] === 0x0a &&
      buffer[5] === 0x0b &&
      buffer[6] === 0x0c &&
      buffer[7] === 0x0d
    ) {
      this.isLittleEndian = false;
    }
  }
  addBackgroundInImageData(color) {
    if (color === null) {
      return false;
    }
    this.data.fill(this.getValColor(color));
    return true;
  }
  addPointsInData(pts, color, size) {
    if (pts === null || typeof pts !== 'object') {
      return false;
    }

    for (let i = 0; i < pts.length; i++) {
      if (pts[i]) {
        this.addOnePointInData(pts[i], pts[i][3] ? pts[i][3] : color, size);
      }
    }
    return true;
  }
  addBackgroundInDrawingArea(color, w, h, x1, y1) {
    for (let indexY = y1; indexY < h; indexY++) {
      for (let indexX = x1; indexX < w; indexX++) {
        this.addOnePointInData([indexX, indexY], color, 1);
      }
    }
  }
  addOnePointInData(pt, color, size) {
    if (color === null) {
      return false;
    }

    if (size <= 1) {
      return this.updateData(Math.floor(pt[0]), Math.floor(pt[1]), color);
    }

    if (size % 2 != 0) {
      size++;
    }

    for (let indexY = 0; indexY < size; indexY++) {
      // Center around y0
      const y = Math.floor(pt[1] + indexY - Math.floor(size / 2));
      for (let indexX = 0; indexX < size; indexX++) {
        // Center around x0
        this.updateData(
          Math.floor(pt[0] + indexX - Math.floor(size / 2)),
          y,
          color,
        );
      }
    }

    return true;
  }
  getPoints(ignoreBlackPts) {
    const pts = [];
    for (let i = 0; i < this.data.length; i++) {
      const y = Math.floor(i / this.w);
      if (this.data[i] && (ignoreBlackPts == false || this.data[i] > 0)) {
        pts.push([
          i - y * this.w,
          y,
          null, // z
          this.getRgbColor(this.data[i]),
        ]);
      }
    }
    return pts;
  }
  getRgbColor(value) {
    if (this.isLittleEndian) {
      return [
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff,
      ];
    }

    return [
      (value >> 24) & 0xff,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff,
    ];
  }
  updateData(x, y, color) {
    if (x < 0) {
      return false;
    }
    if (y < 0) {
      return false;
    }
    if (x >= this.w) {
      return false;
    }
    if (y >= this.h) {
      return false;
    }

    const k = y * this.w + x;
    if (k >= 0 && k <= this.data.length) {
      this.data[k] = this.getValColor(color);
      return true;
    }
    return false;
  }
  getValColor(color) {
    if (
      typeof color[3] !== 'number' ||
      color[3] === Infinity ||
      color[3] > 255
    ) {
      color[3] = 255; // default alpha
    }
    return this.isLittleEndian
      ? Math.round(color[3] << 24) | // alpha
          Math.round(color[2] << 16) | // blue
          Math.round(color[1] << 8) | // green
          Math.round(color[0])
      : Math.round(color[0] << 24) | // red
          Math.round(color[1] << 16) | // green
          Math.round(color[2] << 8) | // blue
          Math.round(color[3]); // alpha;
  }
}
