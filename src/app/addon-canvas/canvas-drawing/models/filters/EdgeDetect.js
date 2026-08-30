// "author": "Sher Minn Chong"
export default class EdgeDetect {
  constructor(opt) {
    this.options = opt;
    this.kernels = {
      sobel: {
        x: [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1],
        ],
        y: [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1],
        ],
      },
      sobel2: {
        x: [
          [null, 0, 1],
          [null, 0, 2],
          [null, 0, 1],
        ],
        y: [
          [null, -2, -1],
          [null, 0, 0],
          [null, 2, 1],
        ],
      },
    };
  }
  execDetect(canvas) {
    return this.execSobelDetect(canvas);
  }
  execSobelDetect(canvas) {
    const res = this.sobel(canvas, this.options.kernel); // return magnitudes only
    const mags = res[0];
    const dirs = res[1];
    return [mags, dirs];
  }
  sobel(c, type) {
    // array of pixel data
    const data = c.getDataArr();

    // convolution kernels
    const kernelX = this.kernels[type].x;
    const kernelY = this.kernels[type].y;

    const kernelSize = kernelX.length;

    // offset value to get window of pixels
    const rowOffset = c.canvasWidth;

    // math to get 3x3 window of pixels because image data given is just a 1D array of pixels
    const maxPixelOffset = c.canvasWidth * 2 + kernelSize - 1;

    // optimizations
    const SQRT = Math.sqrt;
    const ATAN2 = Math.atan2;

    const dataLength = data.length - maxPixelOffset;
    const magnitudes = new Array(dataLength);
    const directions = new Array(dataLength);

    for (let i = 0; i < dataLength; i++) {
      // sum of each pixel * kernel value
      let sumX = 0,
        sumY = 0;
      for (let x = 0; x < kernelSize; x++) {
        if (kernelX[x]) {
          for (let y = 0; y < kernelSize; y++) {
            const px = data[i + rowOffset * y + x];
            const r = px[0];

            // use px[0] (i.e. R value) because grayscale anyway)
            sumX += r * kernelX[y][x];
            sumY += r * kernelY[y][x];
          }
        }
      }

      const mag = SQRT(sumX * sumX + sumY * sumY);
      const direction = ATAN2(sumX, sumY);

      // compare neighbours
      // set magnitude to 0 if doesn't exceed threshold, else set to magnitude
      magnitudes[i] = mag > this.options.threshold ? mag : 0;
      directions[i] = mag > this.options.threshold ? direction : 0;
    }
    return [magnitudes, directions];
  }
}
