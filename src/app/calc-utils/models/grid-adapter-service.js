export default class GridAdapterService {
  sqrtHalf = Math.sqrt(2) / 2;
  grad = null;
  ptMin = null;
  ptMax = null;
  margin = null;
  drPtMin = null;
  drPtMax = null;
  indexes = null;
  indexMin = 0;
  indexMax = 0;
  minCoord = null;
  maxCoord = null;
  arrIndexPts = null;
  missedPts = null;
  hitPts = null;
  width = 0;
  height = 0;
  drWidth = 0;
  drHeight = 0;
  limitWidth = 1000;
  limitHeight = 1000;
  limitX0 = 0;
  limitY0 = 0;
  inverseY = false;
  offSet = null;
  grid = null;
  centerAbs = true;
  nbPts = 0;
  nbHitPts = 0;
  indexPt = 0;
  useImageData = false;
  real3d = false;
  gridChanged = false;
  paramsDefined = false;
  gridElementMax = 0;
  remainingPts = 0;
  indexMissedPt = 0;
  precision = 1;
  rotationY = 0;
  constructor() {
    this.offSet = [0, 0];
    this.initialize();
    this.initVarScan();
  }
  reset() {
    this.grad = [0, 0, 0];
    this.ptMin = [0, 0, 0];
    this.margin = [0, 0, 0];
    this.offSet = [0, 0, 0];
    this.ptMax = [0, 0, 0];
    this.inverseY = false;
    this.useImageData = false;
    this.centerAbs = true;
    this.grid = null;
  }
  getArea() {
    return this.limitHeight * this.limitHeight;
  }
  getCopy() {
    const o = new GridAdapterService();
    o.width = this.width;
    o.height = this.height;
    o.limitWidth = this.limitWidth;
    o.limitHeight = this.limitHeight;
    o.limitX0 = this.limitX0;
    o.limitY0 = this.limitY0;
    o.grad = [this.grad[0], this.grad[1], this.grad[2]];
    o.ptMin = [this.ptMin[0], this.ptMin[1], this.ptMin[2]];
    o.margin = [this.margin[0], this.margin[1], this.margin[2]];
    o.offSet = [this.offSet[0], this.offSet[1], this.offSet[2]];
    o.ptMax = [this.ptMax[0], this.ptMax[1], this.ptMax[2]];
    o.inverseY = this.inverseY;
    o.useImageData = this.useImageData;
    o.centerAbs = this.centerAbs;
    o.paramsDefined = this.paramsDefined;
    o.setCoordLimits();
    return o;
  }
  setCenterAbs(b) {
    this.centerAbs = b;
  }
  setWidth(w) {
    this.width = w;
  }
  setHeight(h) {
    this.height = h;
  }
  getXCenter() {
    return this.width / 2;
  }
  getYCenter() {
    return this.height / 2;
  }
  getDrWidth() {
    return this.drWidth;
  }
  getDrHeight() {
    return this.drHeight;
  }
  getDrX0() {
    if (this.drPtMin === null) {
      return 0;
    }
    return this.drPtMin[0];
  }
  getDrY0() {
    if (this.drPtMin === null) {
      return 0;
    }
    return this.drPtMin[1];
  }
  initialize() {
    this.ptMax = [this.width, this.height, 0];
    this.ptMin = [0, 0, 0];
    this.margin = [0, 0, 0];
    this.grad = [1, 1, 0];
    this.paramsDefined = false;
  }
  initVarScan() {
    this.nbHitPts = 0;
    this.nbPts = 0;
    this.indexPt = 0;
    this.indexMissedPt = 0;
    this.remainingPts = 0;
    this.missedPts = [];
  }
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }
  setLimits(w, h) {
    this.limitWidth = w;
    this.limitHeight = h;
  }
  setCoordLimits() {
    this.minCoord = [0, 0];
    this.maxCoord = [this.limitWidth, this.limitHeight];
  }
  getXSymetricPoint(pt) {
    let x = 0;
    let y = 0;
    if (pt[0] > this.limitWidth / 2) {
      x = Math.abs(this.limitWidth - pt[0]);
      y = pt[1];
      return [x, y, pt[2], pt[3]];
    } else if (pt[0] < this.limitWidth / 2) {
      x = this.limitWidth - pt[0];
      y = pt[1];
      return [x, y, pt[2], pt[3]];
    }
    return null;
  }
  getSymetricPoint(pt) {
    let x = 0;
    let y = 0;
    if (pt[1] > this.limitHeight / 2) {
      x = pt[0];
      y =
        this.limitHeight / 2 -
        (pt[1] - this.limitHeight / 2) +
        this.minCoord[1];
      return [x, y, pt[2], pt[3]];
    } else if (pt[1] < this.limitHeight / 2) {
      x = pt[0];
      y =
        this.limitHeight / 2 +
        (this.limitHeight / 2 - pt[1]) +
        this.minCoord[1];
      return [x, y, pt[2], pt[3]];
    }
    return null;
  }
  isInCoordLimits(pt) {
    return (
      pt[0] >= this.minCoord[0] &&
      pt[0] <= this.maxCoord[0] &&
      pt[1] >= this.minCoord[1] &&
      pt[1] <= this.maxCoord[1]
    );
  }
  initGrid(size) {
    const w = this.limitWidth;
    const h = this.limitHeight;

    if (size === 8) {
      // 1 octet / pixel (0 to 255)
      this.grid = new Uint8Array(w * h);
    }
    else if (size === 16) {
      // 2 octets / pixel (0 to 65535)
      this.grid = new Uint16Array(w * h);
    }
    else if (size === 32) {
      // 4 octets / pixel (0 to 4294967295)
      this.grid = new Uint32Array(w * h);
    }

    this.gridElementMax = Math.pow(2, size);
    return true;
  }
  initPtsMem(size) {
    this.initVarScan();
    this.setCoordLimits();
    this.initGrid(size);
  }
  setValueInGrid(pt, value) {
    const x = Math.floor(pt[0]);
    const y = Math.floor(pt[1]);
    const k = this.getIndexInGrid(pt);

    if (x >= 0 &&
      x < this.limitWidth &&
      y >= 0 &&
      y < this.limitHeight &&
      this.grid[k] < this.gridElementMax
    ) {
      this.grid[k] = value;
    }
  }
  getValueInGrid(pt) {
    return this.grid[this.getIndexInGrid(pt)];
  }
  pushInGrid(pt, value) {
    this.grid[this.getIndexInGrid(pt)] = value;
  }
  getIndexInGrid(pt) {
    return Math.floor(pt[1]) * this.limitWidth + Math.floor(pt[0]);
  }
  getGridLength() {
    return this.grid.length;
  }
  incrementPtsInArrGrid(pts, inc, max) {
    for (let index = 0; index < pts.length; index++) {
      if (pts[index]) {
        this.incrementInGrid(pts[index], inc, max);
      }
    }
  }
  incrementInGrid(pt, inc, max) {
    const x = Math.floor(pt[0]);
    const y = Math.floor(pt[1]);
    const k = this.getIndexInGrid(pt);

    if (x >= 0 &&
      x < this.limitWidth &&
      y >= 0 &&
      y < this.limitHeight &&
      this.grid[k] < this.gridElementMax &&
      (max == -1 || typeof max === "undefined" || this.grid[k] + inc <= max)
    ) {
      this.grid[k] += inc;
    }
    return this.grid[k];
  }
  getGridPoints() {
    const pts = [];
    for (let index = 0; index < this.grid.length; index++) {
      pts.push(this.getGridPoint(index));
    }
    return pts;
  }
  addMissedPts(start, end) {
    for (let j = start; j <= end; j++) {
      this.missedPts.push(j);
    }
    this.remainingPts += end - start + 1;
  }
  addMissedPt(j) {
    this.missedPts.push(j);
    this.remainingPts += 1;
  }
  getNewPoint(skipNb, useRemainingPoints, skipY) {
    // get pt in grid
    if (this.indexPt > this.grid.length) {
      if (useRemainingPoints === false) {
        return null;
      }
      // return remaining point
      return this.getRemainingPoint();
    }

    this.skipPts(skipNb, skipY);
    this.indexPt += 1;
    this.nbHitPts++;
    return this.getGridPoint(this.indexPt);
  }
  getGridPoint(i) {
    const y = Math.floor(i / this.limitWidth);
    return [i - y * this.limitWidth, y, 0, null, 0];
  }
  skipPts(nb, skipY) {
    if (nb > 0) {
      for (let j = 0; j < nb; j++) {
        this.addMissedPt(this.indexPt + 1);
        this.indexPt += 1;
      }
      if (skipY === true) {
        if (this.indexPt % this.limitWidth == 0) {
          for (let j = 0; j < this.limitWidth; j++) {
            this.addMissedPt(this.indexPt + 1);
            this.indexPt += 1;
          }
        }
      }
    }
  }
  getRemainingPoint() {
    if (this.indexMissedPt < this.missedPts.length) {
      const k = this.missedPts[this.indexMissedPt];

      const yR = Math.floor(k / this.limitWidth);
      const xR = k - yR * this.limitWidth;

      this.remainingPts--;
      this.indexMissedPt++;

      return [xR, yR, 0, null, 0];
    }

    return null;
  }
  getOccurrenceInPtsMem(pt) {
    if (this.getOnCanvas(pt) === false) {
      return 1;
    }

    const x = Math.floor(pt[0]);
    const y = Math.floor(pt[1]);
    const k = y * this.limitWidth + x;
    if (k < 0) {
      return 0;
    }
    return typeof this.nbHitPts[k] === 'undefined' ? 0 : this.nbHitPts[k];
  }
  getEndSet(ignoreMissedPoints) {
    return (
      this.indexPt >= this.grid.length &&
      (ignoreMissedPoints || this.remainingPts <= 0)
    );
  }
  getEndGrid() {
    return this.indexPt >= this.grid.length;
  }
  getScanProgress() {
    let nb = (this.indexPt / (this.grid.length + this.remainingPts)) * 100;
    if (nb === 0) {
      nb = 1;
    }
    return nb;
  }
  getOnCanvas(pt) {
    return (
      pt[0] >= 0 && pt[1] >= 0 && pt[0] <= this.width && pt[1] <= this.height
    );
  }
  randomBetween(min, max, d) {
    min -= d;
    max += d;
    return Math.random() * (max - min) + min;
  }
  isSet(v) {
    return typeof v !== 'undefined' && v !== null;
  }
  getMinMax(pts) {
    this.ptMin = this.getMinOfPts(pts);
    this.ptMax = this.getMaxOfPts(pts);

    return [
      this.ptMin,
      this.ptMax
    ];
  }
  getMinOfPts(pts) {
    let ptMin = [0, 0, 0];

    for (let i = 0, n = pts.length; i < n; i++) {
      if (this.isSet(pts[i])) {
        for (let index = 0; index < 3; index++) {
          if (
            this.isSet(pts[i][index]) &&
            (i === 0 || pts[i][index] < ptMin[index]) &&
            isFinite(pts[i][index])
          ) {
            ptMin[index] = pts[i][index];
          }
        }
      }
    }
    return ptMin;
  }
  getMaxOfPts(pts) {
    let ptMax = [0, 0, 0, null];
    for (let i = 0, n = pts.length; i < n; i++) {
      if (this.isSet(pts[i])) {
        for (let index = 0; index < 3; index++) {
          if (
            this.isSet(pts[i][index]) &&
            isFinite(pts[i][index]) &&
            (i === 0 || pts[i][index] > ptMax[index])
          ) {
            ptMax[index] = pts[i][index];
          }
        }
      }
    }
    return ptMax;
  }
  getMinByIndex(pts, index) {
    let ptMin = [-1, -1, -1];

    for (let i = 0, n = pts.length; i < n; i++) {
      if (this.isSet(pts[i])) {
        if (
          this.isSet(pts[i][index]) &&
          (i === 0 || pts[i][index] < ptMin[index]) &&
          isFinite(pts[i][index])
        ) {
          this.indexMin = i;
          ptMin[index] = pts[i][index];
        }
      }
    }
    return ptMin;
  }
  getMaxByIndex(pts, index) {
    let ptMax = [-1, -1, -1];
    for (let i = 0, n = pts.length; i < n; i++) {
      if (this.isSet(pts[i])) {
        if (
          this.isSet(pts[i][index]) &&
          isFinite(pts[i][index]) &&
          (i === 0 || pts[i][index] > ptMax[index])
        ) {
          this.indexMax = i;
          ptMax[index] = pts[i][index];
        }
      }
    }
    return ptMax;
  }
  removeMinMax(pts) {
    for (let index = 0; index < 3; index++) {
      this.indexMin = -1;
      this.indexMax = -1;
      this.getMinByIndex(pts, index);
      if (this.indexMin > 0) {
        pts.splice(this.indexMin, 1);
      }

      this.indexMin = -1;
      this.indexMax = -1;
      this.getMaxByIndex(pts, index);
      if (this.indexMax > 0) {
        pts.splice(this.indexMax, 1);
      }
    }

    return pts;
  }
  defGridLimit(pts) {
    this.drPtMin = this.getMinOfPts(pts);
    this.drPtMax = this.getMaxOfPts(pts, true);

    this.drWidth = Math.floor(this.drPtMax[0] - this.drPtMin[0]) + 1;
    this.drHeight = Math.floor(this.drPtMax[1] - this.drPtMin[1]) + 1;
  }
  copyPts(pts) {
    return pts.map((point) => point.slice());
  }
  defParameters(initialPts, coefMargins, coefZAjust, bSquare, coefAdjusts) {
    if (coefMargins === null || typeof coefMargins !== 'object') {
      coefMargins = [0, 0, 0];
    }

    this.initialize();

    if (initialPts === null || typeof initialPts !== 'object') {
      return false;
    }

    if (initialPts.length === 0) {
      return false;
    }

    let is3D = this.isSet(initialPts[0][2]);

    let pts = initialPts.map((point) => [
      point[0],
      point[1],
      is3D ? point[2] : 0,
    ]);

    if (typeof bSquare !== 'boolean') {
      if (this.useImageData === false) {
        this.setCenterAbs(true);
      }
    }

    const dimensions = [this.limitWidth, this.limitHeight];
    if (this.rotationY > 0) {
      pts = this.rotatePointsY(pts, this.rotationY);
    }

    if (is3D && typeof coefZAjust === 'number' && coefZAjust !== 0) {
      this.ptMax = this.getMaxOfPts(pts);
      this.ptMin = this.getMinOfPts(pts);
      pts = this.adaptPointsOn3DPlan(pts, coefZAjust);
    }

    this.ptMax = this.getMaxOfPts(pts);
    if (coefAdjusts && typeof coefAdjusts === 'object' && coefAdjusts.length > 1) {
      this.ptMax = this.ptMax.map((value, index) => value * coefAdjusts[index]);
    }

    this.ptMin = this.getMinOfPts(pts);
    if (coefAdjusts &&
      typeof coefAdjusts === 'object' &&
      coefAdjusts.length > 1
    ) {
      this.ptMin = this.ptMin.map((value, index) => value * coefAdjusts[index]);
    }

    // x, y
    for (let i = 0; i < 2; i++) {
      this.margin[i] = (dimensions[i] * coefMargins[i]);
      if (this.ptMax[i] - this.ptMin[i] !== 0) {
        this.grad[i] = (dimensions[i] - this.margin[i] * 2) / (this.ptMax[i] - this.ptMin[i]);
      }
    }

    // Z
    this.margin[2] = (dimensions[1] * coefMargins[2]);
    if (is3D && this.ptMax[2] != 0 && this.ptMin[2] != 0) {
      this.grad[2] = (dimensions[1] - this.margin[2] * 2) / (this.ptMax[2] - this.ptMin[2]);
    } else {
      this.grad[2] = 0;
    }

    this.paramsDefined = true;
    return true;
  }
  adaptPointsOn3DPlan(pts, coefZAjust) {
    if (
      pts.length > 0 &&
      this.ptMax[2] - this.ptMin[2] !== 0 &&
      typeof pts[0] === 'object' &&
      this.isSet(pts[0][2])
    ) {
      pts.forEach((point) => this.adaptPointOn3DPlan(point, coefZAjust));
    }
    return pts;
  }
  adaptPointOn3DPlan(pt, coefZAjust) {
    //if ((this.ptMax[2] - this.ptMin[2]) !== 0) {
    // adapt x & y
    for (let i = 0; i < 2; i++) {
      pt[i] -= this.sqrtHalf * pt[2];
    }
    //}
    //pt;
  }
  rotatePointsY(points, angleY) {
    const cosTheta = Math.cos(angleY);
    const sinTheta = Math.sin(angleY);

    return points.map(([x, y, z, c, i]) => [
      x * cosTheta + z * sinTheta,
      y,
      -x * sinTheta + z * cosTheta,
      c,
      i,
    ]);
  }
  getObjectsPointsOnPlan(objects, init, margin, coefZAjust) {
    if (init === true) {
      let pts = [];
      for (let i = 0, n = objects.length; i < n; i++) {
        pts = pts.concat(
          objects[i].getPoints().map((point) => [point[0], point[1]]),
        );
      }
      this.defParameters(pts, margin, coefZAjust, true);
    }

    for (let i = 0, n = objects.length; i < n; i++) {
      const pts1 = this.getPointsOnPlan(objects[i].getPoints());

      pts1.forEach((point, index1) => objects[i].setPointI(point, index1));

      objects[i].setHeight(this.grad[1] * objects[i].getHeight());
      objects[i].setWidth(this.grad[0] * objects[i].getWidth());
    }
    return objects;
  }
  getDistanceOnPlan(d) {
    return d * this.grad[0];
  }
  getObjectsOnPlan(objects, init, margin, coefZAjust, bSquare, coefAdjusts) {
    if (init === true) {
      const pts = [];
      for (let i = 0, n = objects.length; i < n; i++) {
        if (typeof objects[i] === 'object' && objects[i].getType() === 'line') {
          pts.push(objects[i].getPoint1());
          pts.push(objects[i].getPoint2());
        }
        if (typeof objects[i] === 'object' && objects[i].getType() === 'polygon') {
          const polygonPts = objects[i].getPoints();
          for (let j = 0, m = polygonPts.length; j < m; j++) {
            pts.push(polygonPts[j]);
          }
        }
        if (typeof objects[i] === 'object' && objects[i].getType() === 'circle') {
          pts.push(objects[i].getX());
          pts.push(objects[i].getY());
        }
      }
      this.initialize();
      this.defParameters(pts, margin, coefZAjust, bSquare, coefAdjusts);
    }

    const newObjects = [];
    for (let i = 0; i < objects.length; i++) {
      newObjects.push(this.getObjectOnPlan(objects[i]));
    }
    return newObjects;
  }
  getObjectOnPlan(object) {
    if (typeof object === 'object') {
      if (object.getType() === 'line') {
        object.setPoint1(this.getPointOnPlan(object.getPoint1()));
        object.setPoint2(this.getPointOnPlan(object.getPoint2()));

        const pointsC = object.getPointsC();
        if (pointsC !== null) {
          object.setPointsC(pointsC.map((point) => this.getPointOnPlan(point)));
        }
        return object;
      } else if (object.getType() === 'polygon') {
        const p = object.getCopy();
        const polygonPts = p.getPoints();
        const newPts = this.getPointsOnPlan(polygonPts, false);
        p.setPoints(newPts);
        return p;
      } else if (object.getType() === 'circle') {
        object.setPosition(this.getPointOnPlan(object.getPosition()));
        return object;
      }
    }
  }
  getObjectsPoints(objects) {
    const pts = [];
    for (let i = 0; i < objects.length; i++) {
      pts.push(...objects[i]);
    }
  }
  getObjectPoints(object) {
    if (typeof object === 'object') {
      if (object.getType() === 'line') {
        return object.getPointsC();
      } else if (object.getType() === 'polygon') {
        return polygonPts;
      }
    }
  }
  getPointsOnPlan(
    pts,
    init,
    margin,
    coefZAjust,
    removeOutsideMinMax,
    bSquare,
    coefAdjusts,
  ) {
    if (pts === null || typeof pts !== 'object') {
      return null;
    }
    if (init === true) {
      this.initialize();
      this.defParameters(pts, margin, coefZAjust, bSquare, coefAdjusts);
    }

    if (this.rotationY > 0) {
      pts = this.rotatePointsY(pts, this.rotationY);
    }

    pts = pts.map((point) => this.getPointOnPlan(point));

    if (removeOutsideMinMax === true) {
      for (let i = pts.length - 1, n = pts.length; i < n; i++) {
        if (this.isSet(pts[i])) {
          for (let index = 0; index < 3; index++) {
            if (pts[i][index] < 0) {
              pts[i] = [0, 0, 0];
              pts.splice(i, 1);
              break;
            }
            if (
              this.isSet(pts[i][index]) &&
              pts[i][index] > this.ptMax[index]
            ) {
              pts[i] = [0, 0, 0];
              pts.splice(i, 1);
              break;
            }

            if (
              this.isSet(pts[i][index]) &&
              pts[i][index] < this.ptMin[index] &&
              isFinite(pts[i][index])
            ) {
              pts[i] = [0, 0, 0];
              pts.splice(i, 1);
              break;
            }
          }
        }
      }
    }
    return pts;
  }
  getPointOnPlan(pt, addX0) {
    let z = 0;
    let color = null;

    if (this.isSet(pt) === false) {
      return pt;
    }

    if (typeof pt[3] === 'object') {
      color = pt[3];
    }

    if (this.grad[0] === 0 && this.grad[1] === 0) {
      return pt;
    }

    let x = (pt[0] - this.ptMin[0]) * this.grad[0] + this.margin[0];
    let y = (pt[1] - this.ptMin[1]) * this.grad[1] + this.margin[1];

    if (this.real3d === true) {
      if (this.grad[2] !== 0) {
        z = (pt[2] - this.ptMin[2]) * this.grad[2] + this.margin[2];
      }
    } else if (this.isSet(pt[2]) && pt[2] !== 0) {
      // z projection
      x -= this.sqrtHalf * pt[2] * this.grad[2];
      y += this.sqrtHalf * pt[2] * this.grad[2];
    }

    if (addX0 === true) {
      x += this.limitX0;
    }

    if (this.inverseY === true) {
      y = this.height - y;
    }

    x = x + this.offSet[0] * this.grad[0];
    y = y + this.offSet[1] * this.grad[1];

    if (typeof pt[4] !== 'undefined') {
      // add extra information
      return [
        Math.round(x * this.precision) / this.precision,
        Math.round(y * this.precision) / this.precision,
        Math.round(z * this.precision) / this.precision,
        color,
        pt[4]
      ];
    }

    if (this.precision == 0) {
      return [
        x,
        y,
        z,
        color
      ];
    }

    return [
      Math.round(x * this.precision) / this.precision,
      Math.round(y * this.precision) / this.precision,
      Math.round(z * this.precision) / this.precision,
      color
    ];
  }
  getPtMaxOnPlan() {
    return this.getPointOnPlan(this.ptMax);
  }
  addZ(pt, gradZ) {
    if (this.isSet(pt) === false) {
      return pt;
    }

    if (this.isSet(pt[2])) {
      // z
      pt[0] -= this.sqrtHalf * pt[2] * gradZ;
      pt[1] += this.sqrtHalf * pt[2] * gradZ;
    }
    return pt;
  }
  getPointFromPlan(pt, withLimit, decimals) {
    if (typeof decimals !== 'number') {
      decimals = 6;
    }

    if (this.isSet(pt) === false) {
      return pt;
    }

    if (withLimit) {
      pt[0] -= this.limitX0;
    }

    if (this.grad[0] === 0 && this.grad[1] === 0) {
      return pt;
    }

    const xC = this.centerAbs
      ? (pt[0] -
        (this.limitWidth - this.limitHeight) / 2 -
        this.margin[0] +
        this.ptMin[0] * this.grad[0]) /
      this.grad[0] -
      this.offSet[1] * this.grad[1]
      : (pt[0] - this.margin[0] + this.ptMin[0] * this.grad[0]) / this.grad[0] -
      this.offSet[1] * this.grad[1];

    const yC =
      (pt[1] - this.margin[1] + this.ptMin[1] * this.grad[1]) / this.grad[1] -
      this.offSet[0] * this.grad[0];

    const d = Math.pow(10, decimals);

    return [
      Math.round(xC * d) / d,
      Math.round(yC * d) / d,
      0,
      typeof pt[3] !== 'undefined' ? pt[3] : null,
    ];
  }
  bottcherTransformation(x, y, d, ratio, cx, cy, width, height) {
    if (typeof width == "undefined") {
      width = this.width / d;
    }
    if (typeof height == "undefined") {
      height = this.height / d;
    }
    x = x - cx;
    y = y - cy;
    const centerX = cx;
    const centerY = cy;
    const radius = Math.min(width, height) / 2;
    const u = x / (width - Math.sqrt(x * x + y * y) / ratio);
    const v = y / (height - Math.sqrt(x * x + y * y) / ratio);

    const canvasX = centerX + u * radius;
    const canvasY = centerY - v * radius;

    return [
      canvasX,
      canvasY
    ];
  }

  invertPoint(x, y, cx, cy, R) {
    const dx = x - cx;
    const dy = y - cy;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared === 0) {
      return { x: x, y: y };
    }

    const factor = (R * R) / distanceSquared;
    return { x: factor * dx, y: factor * dy };
  }
}
