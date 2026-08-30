import CShape from '../CShape';

export default class EdgeThinner {
  constructor() {
    this.type = 'skeleton';
    this.iterations = 1;
    this.color = [0, 50, 50];
    this.kernels = {
      skeleton: [
        [
          [0, 0, 0],
          [null, 1, null],
          [1, 1, 1],
        ],
        [
          [null, 0, 0],
          [1, 1, 0],
          [null, 1, null],
        ],
      ],
      '8-connected': [
        [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ],
        [
          [0, 0, 0],
          [0, 1, 0],
          [0, null, null],
        ],
        [
          [0, 0, 0],
          [0, 1, 0],
          [null, null, 0],
        ],
      ],
      '4-connected': [
        [
          [null, 1, null],
          [1, 1, 1],
          [null, 1, null],
        ],
        [
          [0, 0, 0],
          [0, 1, 0],
          [0, null, null],
        ],
        [
          [0, 0, 0],
          [0, 1, 0],
          [null, null, 0],
        ],
      ],
    };
  }
  doThinning(canvas, edges, directions, color) {
    this.c = canvas;
    this.edges = edges;
    this.directions = directions;
    this.color = color;
    this.createRotations();
    return this.nonMaxSupression();
  }
  createRotations() {
    const kernels = this.kernels[this.type];
    for (let k in kernels) {
      const kern = kernels[k];

      // do 3 times
      let curr = kern;

      for (let rot = 0; rot < 3; rot++) {
        // make new grid
        const newKern = new Array(curr.length);
        for (let i = 0; i < newKern.length; i++) {
          newKern[i] = new Array(curr[i].length);
        }

        // put rotated
        for (let i = 0; i < curr.length; i++) {
          for (let j = 0; j < curr[i].length; j++) {
            newKern[i][j] = curr[j][i];
          }
        }
        kernels.push(newKern);
        curr = newKern;
      }
    }
  }

  thin() {
    const edges = this.edges;
    const kernels = this.kernels[this.type];
    //let iterations = 3;

    const width = this.c.canvasWith;
    const height = this.canvasHeight;
    const newEdges = new Array(edges.length);
    // for each kernel, apply them and rotations (TODO)
    for (let times = 0; times < this.iterations; times++) {
      for (let n = 0; n < kernels.length; n++) {
        // get a kernel
        const kernel = kernels[n];
        //var count = 0;
        let e = null;
        let edgeIdx = 0;
        let centerIdx = 0; // for each pixel
        for (let x = 0; x < height; x++) {
          for (let y = 0; y < width; y++) {
            // 3x3 window of neighbours
            let keepEdge = true;
            for (let k = -1; k <= 1; k++) {
              for (let l = -1; l <= 1; l++) {
                // get kernel value for that pixel
                const kx = k + 1;
                const ky = l + 1;
                const kxy = kernel[kx][ky];

                // pixel index
                edgeIdx = (x + k) * width - 1 + (y + l) - 1;
                centerIdx = x * width - 1 + y - 1;

                if (!(edgeIdx > -1 && edgeIdx < edges.length)) {
                  continue;
                }

                // check if pixels exist in accordance to kernel
                e = edges[edgeIdx];
                if (kxy) {
                  const isOne = kxy === 1 && e;
                  const isZero = kxy === 0 && !e;
                  if (!(isOne || isZero)) {
                    keepEdge = false;
                  }
                }
              }
            }
            if (keepEdge) {
              newEdges[centerIdx] = e;
            }
          }
        }
      }
    }
    this.drawLines(newEdges, width, height);
    return newEdges;
  }
  drawLines(edges, width, height) {
    // draw the thinned edge
    const context = this.c.context;
    context.clearRect(0, 0, width, height);
    context.fillStyle = new CShape().getColor(this.color);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const edgeIdx = y * width + x;
        if (edges[edgeIdx]) {
          context.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  forEachEdge(edges, width, height, func) {
    for (let x = 0; x < height; x++) {
      for (let y = 0; y < width; y++) {
        let i = x * width + y;
        func(x, y, edges[i], i);
      }
    }
  }

  nonMaxSupression() {
    const width = this.c.canvasWidth;
    const height = this.c.canvasHeight;
    const edges = this.edges;
    const directions = this.directions;

    const newEdges = new Array(edges.length);
    this.forEachEdge(edges, width, height, function (x, y, mag, i) {
      if (
        x === 0 ||
        y === 0 ||
        x === edges.length - 1 ||
        y === edges.length - 1
      ) {
        return;
      }

      // simplify directions of tangent
      const dir = directions[i];

      // get rounded down angle
      const which = Math.abs(Math.floor(dir / Math.PI / 4));
      const nidx = [];
      switch (which) {
        case 0: //north-south, check east and west
        case 4:
          nidx.push([x + 1, y], [x - 1, y]);
          break;
        case 1: //northwest-southeast, check northest-southwest
          nidx.push([x - 1, y - 1], [x + 1, y + 1]);
          break;
        case 2: //east west, check north-south
          nidx.push([x, y + 1], [x, y - 1]);
          break;
        case 3: //northest-southwest, check northwest-souteast
          nidx.push([x - 1, y + 1], [x + 1, y - 1]);
          break;
        default:
          // invalid
          return;
      }

      // if neighbours are less, is center of edge
      let isMax = true;
      for (let n of nidx) {
        const idx = n[0] * width + n[1];
        if (mag <= edges[idx]) {
          isMax = false;
        }
      }

      newEdges[i] = isMax === true ? mag : 0;
    });
    this.drawLines(newEdges, width, height);
    return newEdges;
  }
}
