export default class HoughTransform {
  constructor(options) {
    // given an array edges, use hough transform to detect lines/etc
    this.accumulators = {
      lines: {},
      circles: {},
    };

    this.threshold = options.threshold;
    this.type = options.type;

    // optional, for circle detection
    this.radius = options.radius / 2;

    // precalculate tables for sin, cos and radian values
    this.tables = {
      sin: {},
      cos: {},
    };

    for (let deg = 0; deg < 360; deg++) {
      const rad = (deg * Math.PI) / 180;
      this.tables.sin[rad] = Math.sin(rad);
      this.tables.cos[rad] = Math.cos(rad);
    }

    // get radians from keys
    this.tables.radians = Object.keys(this.tables.sin);
  }
  doTransform(c, edges) {
    switch (this.type) {
      case 'lines':
        this.lines(c, edges);
        this.drawLines(c, edges);
        break;
      case 'circles':
        this.circles(c, edges, this.radius);
        this.drawCircles(c, edges, this.radius);
    }
  }
  lines(c, edges) {
    const width = c.canvasWidth;
    const height = c.canvasHeight;
    const centerX = Math.ceil(width / 2);
    const centerY = Math.ceil(height / 2);

    const acc = this.accumulators['lines'];

    //use precalculated values
    const sin = this.tables.sin;
    const cos = this.tables.cos;
    const radians = this.tables.radians;

    //detects lines and returns array with line locations
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < width; y++) {
        const i = x * width + y;

        // don't calculate for non-edges
        const e = edges[i];
        if (typeof e === 'undefined' || e === 0) {
          continue;
        }

        // calculate r for thetas
        for (let j = 0; j < radians.length; j++) {
          //normalize x and y values with center as origin
          const xnorm = x - centerX;
          const ynorm = y - centerY;
          const rad = radians[j];
          const r = Math.floor(xnorm * cos[rad] + ynorm * sin[rad]);

          // increment accumulator by 1 for every r found
          if ([r, rad] in acc) {
            acc[[r, rad]].x.push(xnorm);
            acc[[r, rad]].y.push(ynorm);
          } else {
            acc[[r, rad]] = {
              x: [xnorm],
              y: [ynorm],
            };
          }
        }
      }
    }

    return acc;
  }

  circles(c, edges, radius) {
    const acc = this.accumulators['circles'];
    const width = c.canvasWidth;
    const height = c.canvasHeight;
    // for each edge pixel
    for (let x = 0; x < height; x++) {
      for (let y = 0; y < width; y++) {
        const e = edges[x * width + y];

        // ignore non-edges
        if (typeof e === 'undefined' || e === 0) {
          continue;
        }

        // find circle points (a, b) where e = (x,y) can be center of circle
        // formula: x = a + r * cos (theta), a = x - r * cos (theta)
        //          y = b + r * sin (theta), b = y - r * sin (theta)

        const sin = this.tables.sin;
        const cos = this.tables.cos;
        const radians = this.tables.radians;
        const R = radius;

        // for each possible angle, find these points
        for (let r = 0; r < radians.length; r++) {
          const rad = radians[r];

          const a = Math.floor(x - R * cos[rad]);
          const b = Math.floor(y - R * sin[rad]);

          // add votes to this points in accumulator
          if ([a, b] in acc) {
            acc[[a, b]]++;
          } else {
            acc[[a, b]] = 1;
          }
        }
      }
    }
  }

  drawCircles(c, edges, radius) {
    const acc = this.accumulators['circles'];
    const context = c.context;

    const threshold = this.threshold;
    const points = Object.keys(acc);
    for (let i = 0; i < points.length; i++) {
      let point = points[i];

      // enough intersections, is probably circle
      if (acc[point] > threshold) {
        // draw circle
        point = point.split(',');
        const x = point[1];
        const y = point[0];
        context.beginPath();
        context.strokeStyle = 'rgba(255,100,0,0.5)';
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  }

  drawLines(c) {
    // clear canvas
    // c.context.clearRect(0,0,c.canvas.width,c.canvas.height);

    // list of all r, deg pairs in accumulator
    const acc = this.accumulators['lines'];
    const rhoRads = Object.keys(acc);
    const width = c.canvasWidth;
    const height = c.canvasHeight;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    //use precalculated values
    const sin = this.tables.sin;
    const cos = this.tables.cos;
    //const radians = this.tables.radians;

    //parameters
    const threshold = this.threshold; //min num of points on line
    const colorG = 0;

    // draw lines detected from accumulator data. takes in original image data
    for (let i = rhoRads.length - 1; i >= 0; i--) {
      // get xCoords associated with rho and radian pair
      let rd = rhoRads[i];
      const xCoords = acc[rd].x;
      const yCoords = acc[rd].y;

      //##TODO: check for local maxima
      rd = rd.split(',');
      const r = rd[0]; //rho val
      const rad = rd[1]; //radian val

      if (xCoords.length > threshold) {
        // all possible xs
        for (let j = 0; j < xCoords.length; j++) {
          const x1 = xCoords[j];
          const y1 = Math.floor((r - x1 * cos[rad]) / sin[rad]);
          c.context.fillStyle = `rgb(255,${colorG},255)`;
          c.context.fillRect(y1 + centerY, x1 + centerX, 1, 1);

          const x2 = yCoords[j];
          const y2 = Math.floor((r - x2 * sin[rad]) / cos[rad]);
          c.context.fillStyle = `rgb(0,${colorG},255)`;
          c.context.fillRect(x2 + centerY, y2 + centerX, 1, 1);
        }
      }
    }
  }
}
