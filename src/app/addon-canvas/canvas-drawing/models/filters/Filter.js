import EdgeDetect from './EdgeDetect';
import EdgeThinner from './EdgeThinner';
import HoughTransform from './HoughTransform';

export default class Filter {
  constructor(opt) {
    this.options = opt;
    this.edges = null;
    this.directions = null;
  }
  greyScale(canvas) {
    // get image data (gives us pixels)
    const context = canvas.context;
    if (context) {
      const imageData = context.getImageData(
        0,
        0,
        canvas.canvasWidth,
        canvas.canvasHeight,
      );
      const data = imageData.data;

      // loop through each pixel and set it to grey
      for (let i = 0; i < data.length; i += 4) {
        // use luminosity formula to calculate brightness of grey
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        const luminosity = 0.21 * r + 0.72 * g + 0.07 * b;
        data[i] = data[i + 1] = data[i + 2] = luminosity;
      }
      // overwrite image
      context.putImageData(imageData, 0, 0);
    }
  }
  generateGaussianKernel(canvas, n) {
    const k = (n - 1) / 2;
    const kernel = [];
    const rho = 0.7;
    const rhoSq = Math.pow(rho, 2);
    // generate nxn kernel
    for (let i = 0; i < n; i++) {
      const krow = [];
      for (let j = 0; j < n; j++) {
        // Gaussian formula
        krow.push(
          (1 / (2 * Math.PI * rhoSq)) *
            Math.exp(
              (-1 / (2 * rhoSq)) *
                (Math.pow(i - k - 1, 2) + Math.pow(j - k - 1, 2)),
            ),
        );
      }
      kernel.push(krow);
    }
    this.convolve(canvas, kernel);
  }
  edgeThinFilter(canvas, color) {
    this.color = color;
    if (this.edges && this.edges.length > 0) {
      this.edges = new EdgeThinner().doThinning(
        canvas,
        this.edges,
        this.directions,
        color,
      );
    }
  }
  edgeDetect(canvas, threshold) {
    const results = new EdgeDetect({
      kernel: 'sobel',
      threshold: threshold,
    }).execDetect(canvas);

    if (results) {
      this.displayEdgeDetect(canvas, results[0], results[1]);
    }
  }
  houghTransform(canvas) {
    new HoughTransform({
      type: 'lines',
      threshold: 120,
    }).doTransform(canvas, this.edges);
  }
  displayEdgeDetect(canvas, magnitudes, directions) {
    // pad missing edges. edge detected image will be smaller than
    // original because cannot determine edges at image edges
    const dataLength = canvas.canvasWidth * canvas.canvasHeight * 4;

    // keep edge and direction magnitude for each pixel
    this.edges = new Array(dataLength / 4);
    this.directions = new Array(dataLength / 4);

    const edges = new Array(dataLength);

    for (let i = 0; i < dataLength; i++) {
      edges[i] = 0;
      if (!(i % 4)) {
        const m = magnitudes[i / 4];
        this.edges[i / 4] = m;
        this.directions[i / 4] = directions[i / 4];

        if (m !== 0) {
          edges[i - 1] = m / 4;
        }
      }
      i++;
    }

    canvas.context.putImageData(
      new ImageData(
        new Uint8ClampedArray(edges),
        canvas.canvasWidth,
        canvas.canvasHeight,
      ),
      2,
      0,
    );
  }
  performWhiteBalance(imageData, level) {
    let sumR = 0,
      sumG = 0,
      sumB = 0;
    const numPixels = imageData.width * imageData.height;

    for (let i = 0; i < imageData.data.length; i += 4) {
      sumR += imageData.data[i];
      sumG += imageData.data[i + 1];
      sumB += imageData.data[i + 2];
    }

    const avgR = sumR / numPixels;
    const avgG = sumG / numPixels;
    const avgB = sumB / numPixels;

    const avg = [avgR, avgG, avgB];
    const max = Math.max(...avg);
    const white = avg.map((c) => (255 * c) / max);

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = (255 / white[0]) ** level * imageData.data[i]; // red
      imageData.data[i + 1] = (255 / white[1]) ** level * imageData.data[i + 1]; // green
      imageData.data[i + 2] = (255 / white[2]) ** level * imageData.data[i + 2]; // blue
    }
    return imageData;
  }
  changeRgb(canvas, rgb) {
    // ctx.globalCompositeOperation='difference';
    canvas.getImageData();
    const data = canvas.canvasData.getData();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0 && i % 2 === 0) {
        data[i] = rgb[0] !== null ? rgb[0] : data[i]; // RED
        data[i + 1] = rgb[1] !== null ? rgb[1] : data[i + 1]; // GREEN
        data[i + 2] = rgb[2] !== null ? rgb[2] : data[i + 2]; // BLUE
        data[i + 3] = rgb[3] !== null ? rgb[3] : 255; // ALPHA
      }
    }
    canvas.putImageData(false, null, 0, 0);
  }
  monoColorFilter(canvas, color) {
    canvas.getImageData();
    const data = canvas.canvasData.getData();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0 && i % 2 === 0) {
        data[i] = color[0]; // RED
        data[i + 1] = color[1]; // GREEN
        data[i + 2] = color[2]; // BLUE
      }
    }
    canvas.putImageData(false, null, 0, 0);
  }
  invert(canvas) {
    canvas.getImageData();
    const data = canvas.canvasData.getData();

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0 && i % 2 === 0) {
        data[i] = 255 - data[i]; // RED
        data[i + 1] = 255 - data[i + 1]; // GREEN
        data[i + 2] = 255 - data[i + 2]; // BLUE
      }
    }
    canvas.putImageData(false, null, 0, 0);
  }
  convolve(canvas, kernel) {
    // does convolution given a kernel. missing edge pixels because
    // of how kernel works centered on a something

    const data = canvas.getDataArr();
    const maxPixelOffset = canvas.canvasWidth * kernel.length * 2 - 2;
    const newPixels = [];

    for (let i = 0; i < data.length - maxPixelOffset; i++) {
      let sum = 0;
      for (let a = 0; a < kernel.length; a++) {
        for (let b = 0; b < kernel[a].length; b++) {
          // math to get px position in window
          const offset = canvas.canvasWidth * a;
          const px = data[i + offset + b];

          // new value for pixel
          sum += kernel[a][b] * px[0];
        }
      }

      Array.prototype.push.apply(newPixels, [sum, sum, sum, 255]);
    }

    for (let i = 0; i < maxPixelOffset; i++) {
      Array.prototype.push.apply(newPixels, [0, 0, 0, 0]);
    }

    // overwrite image with the edges
    canvas.context.putImageData(
      new ImageData(new Uint8ClampedArray(newPixels), canvas.canvasWidth),
      0,
      0,
    );
  }
}
