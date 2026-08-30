import CShape from './CShape';

export default class CLine extends CShape {
  //	pointsC:null,
  //	a:null,
  //	b:null,
  //	bVertical:false,
  //	fillColor: null,
  //	// a1x + a2y + a3 = 0;
  //	a1:0,
  //	a2:-1,
  //    a3:0,
  constructor(x1_, y1_, x2_, y2_, strokeColor_, lineWidth_, pt1_, pt2_) {
    super(x1_, y1_, x2_, y2_, 0, strokeColor_, lineWidth_);
    this.point1 = [];
    this.point2 = [];
    this.pts = null;
    this.pointsC = null;
    this.a = null;
    this.b = null;
    this.bVertical = false;
    this.fillColor = null;
    this.lineCap = '';
    // a1x + a2y + a3 = 0;
    this.a1 = 0;
    this.a2 = -1;
    this.a3 = 0;
    this.type = 'line';

    if (typeof pt1_ === 'object' && typeof pt2_ === 'object') {
      this.setTwoPoints(pt1_, pt2_, true);
    } else {
      this.setTwoPoints([x1_, y1_], [x2_, y2_], true);
    }
    this.roundValues();
  }
  addPoint(pt) {
    if (this.pts === null) {
      this.pts = [];
    }
    this.pts.push(pt);
  }
  setPts(_pts) {
    this.pts = _pts;
  }
  setLineCap(f) {
    this.lineCap = f;
  }
  defEquationFromPts() {
    //console.debug('def eq');
    // a1x + a2y + a3 = 0
    // a2y = a1x + a3
    this.roundValues();
    if (this.point1[0] !== null && this.point2 !== null) {
      if (this.point1[0] === this.point2[0]) {
        // vertical line
        this.a1 = 1;
        this.a2 = 0;
        this.a3 = this.point1[0] * -1;
      } else {
        // other lines
        this.a1 = this.roundValPrec(
          (this.point2[1] - this.point1[1]) / (this.point2[0] - this.point1[0]),
        );
        this.a2 = -1;
        this.a3 = this.roundValPrec(this.point1[1] - this.a1 * this.point1[0]);
      }
    }
  }
  setTwoPoints(pt1, pt2, bDefEquation) {
    if (pt1 === null) {
      return false;
    }
    this.point1 = [pt1[0], pt1[1]];
    this.x = pt1[0];
    this.y = pt1[1];
    this.position = [pt1[0], pt1[1]];
    if (
      pt2 &&
      typeof pt2 === 'object' &&
      pt2.length >= 2 &&
      pt2[0] !== null &&
      pt2[1] !== null
    ) {
      this.point2 = [pt2[0], pt2[1]];
      this.vector = [pt2[0] - pt1[0], pt2[1] - pt1[1]];
      if (bDefEquation === true) {
        this.defEquationFromPts();
      }
      this.width = pt2[0];
      this.height = pt2[1];
    }
    return true;
  }
  resizeShape(w, h) {
    if (typeof this.point1 === 'object' && this.point1 !== null) {
      this.point1[0] = this.point1[0] * w;
      this.point1[1] = this.point1[1] * h;
    }

    if (typeof this.point2 === 'object' && this.point2 !== null) {
      this.point2[0] = this.point2[0] * w;
      this.point2[1] = this.point2[1] * h;
      this.defEquationFromPts();
    }

    this.setWidth(this.getWidth() * w);
    this.setHeight(this.getHeight() * h);
  }
  getPointI(i) {
    if (i === 1) {
      return this.point1;
    } else {
      return this.point2;
    }
  }
  setPointI(pt, i) {
    if (i === 1) {
      this.point1 = pt;
    } else {
      this.point2 = pt;
    }
  }
  getPoints() {
    return [this.point1, this.point2];
  }
  roundValues(d) {
    if (this.point1 && typeof this.point1 === 'object') {
      this.point1[0] = this.roundVal(this.point1[0], d);
      this.point1[1] = this.roundVal(this.point1[1], d);
    }
    if (this.point2 && typeof this.point2 === 'object') {
      this.point2[0] = this.roundVal(this.point2[0], d);
      this.point2[1] = this.roundVal(this.point2[1], d);
    }
    if (this.a !== null) {
      this.a = this.roundVal(this.a, d);
    }
    if (this.b !== null) {
      this.b = this.roundVal(this.b, d);
    }
    if (this.a1 !== null) {
      this.a1 = this.roundVal(this.a1, d);
    }
    if (this.a2 !== null) {
      this.a2 = this.roundVal(this.a2, d);
    }
    if (this.a3 !== null) {
      this.a3 = this.roundVal(this.a3, d);
    }
  }
  setbVertical(b) {
    this.bVertical = b;
  }
  getbVertical() {
    return this.bVertical;
  }
  display(context, offSet) {
    if (offSet === null || typeof offSet !== 'object') {
      offSet = [0, 0];
    }
    context.beginPath();

    this.defStyle(context);
    context.lineWidth = this.lineWidth;

    if (this.lineCap !== '') {
      context.lineCap = this.lineCap;
    }
    if (this.pts !== null) {
      context.moveTo(this.pts[0][0] + offSet[0], this.pts[0][1] + offSet[1]);
      for (let i = 0; i < this.pts.length; i++) {
        context.lineTo(this.pts[i][0] + offSet[0], this.pts[i][1] + offSet[1]);
      }
    } else if (this.point1 !== null && this.point2 !== null) {
      context.moveTo(this.point1[0] + offSet[0], this.point1[1] + offSet[1]);
      if (this.pointsC !== null) {
        if (this.pointsC.length >= 2) {
          // curve
          context.bezierCurveTo(
            this.pointsC[0][0] + offSet[0],
            this.pointsC[0][1] + offSet[1],
            this.pointsC[1][0] + offSet[0],
            this.pointsC[1][1] + offSet[1],
            this.point2[0] + offSet[0],
            this.point2[1] + offSet[1],
          );
        } else if (this.pointsC.length >= 1) {
          context.quadraticCurveTo(
            this.pointsC[0][0] + offSet[0],
            this.pointsC[0][1] + offSet[1],
            this.point2[0] + offSet[0],
            this.point2[1] + offSet[1],
          );
        }
      } else {
        context.lineTo(this.point2[0] + offSet[0], this.point2[1] + offSet[1]);
      }
    }

    context.fill();
    context.stroke();
  }
  checkIfPointOnLine(point) {
    return (
      this.roundVal(this.a1 * point[0] + this.a2 * point[1] + this.a3, 6) === 0
    );
  }
  checkIfPointOnSegment(point) {
    if (this.a1 === 0) {
      // horizontal
      return point[0] >= this.getMinX() && point[0] <= this.getMaxX();
    } else if (this.a2 === 1) {
      // vertical
      return point[1] >= this.getMinX() && point[1] <= this.getMaxX();
    } else {
      return point[1] >= this.getMinY() && point[1] <= this.getMaxY();
    }
  }
  getPointsMoveOnSegment(pt1, pt2, width) {
    const pts = this.getPointsMoveOnLine(pt1, width);
    const v1 = this.defVector(pt1, pt2);
    for (let j = 0; j < pts.length; j++) {
      const v2 = this.defVector(pt1, pts[j]);
      if (this.checkVectorsSameOrientation(v1, v2)) {
        return pts[j];
      }
    }
    return null;
  }
  getMinY() {
    if (this.point1[1] < this.point2[1]) {
      return this.point1[1];
    } else {
      return this.point2[1];
    }
  }
  getMinX() {
    if (this.point1[0] < this.point2[0]) {
      return this.point1[0];
    } else {
      return this.point2[0];
    }
  }
  getMaxY() {
    if (this.point1[1] > this.point2[1]) {
      return this.point1[1];
    } else {
      return this.point2[1];
    }
  }
  getMaxX() {
    if (this.point1[0] > this.point2[0]) {
      return this.point1[0];
    } else {
      return this.point2[0];
    }
  }
  getPerpendicular(pt) {
    const line2 = new CLine(null, null, null, null, null, null, pt, null);
    line2.setPoint2(null);
    if (this.a2 === 0) {
      // vertical line => horizontal line
      line2.defVarEq(0);
    } else if (this.a1 === 0) {
      // horizontal line => vertical line
      line2.defVarEq(1, 0);
    } else {
      line2.defVarEq(-1 / this.a1);
    }
    return line2;
  }
  getParallel(d) {
    const line2 = new CLine(null, null);
    line2.setA1(this.getA1());
    line2.setA2(this.getA2());
    line2.setA3(this.getA3() + d);

    const pt1 = this.getPoint1();
    const pt2 = this.getPoint2();
    line2.setPoint1([pt1[0], line2.getOrd(pt1[0])]);
    line2.setPoint2([pt2[0], line2.getOrd(pt2[0])]);
    return line2;
  }
  getOrd(x0) {
    // a1x + a2y + a3 = 0
    // a1x + a3 = -a2y
    // y = (a1x + a3)/-a2
    if (this.a2 === 0) {
      return null;
    }
    return (this.a1 * x0 + this.a3) / (this.a2 * -1);
  }
  getAbs(y0) {
    // y = ax+b
    // y - b = ax
    // x = (y-b)/a
    if (this.a1 === 0) {
      //console.debug('abs null');
      return null;
    }
    this.roundValues();

    // a1x + a2y + a3 = 0
    // a2y + a3 = -a1x
    // x = (a2y + a3)/-a1

    return this.roundVal((this.a2 * y0 + this.a3) / (this.a1 * -1));
  }
  defA3() {
    // a1x + a2y + a3 = 0
    // a3 = -a1x -a2y

    this.a3 = -this.a1 * this.point1[0] - this.a2 * this.point1[1];
  }
  defVarEq(a1p, a2p) {
    this.a1 = a1p;
    if (this.point1 !== null) {
      if (this.a1 === 1 && a2p === 0) {
        //console.debug('vertical');
        // vertical line
        this.a2 = 0;
        this.a3 = this.point1[0] * -1;
      } else {
        this.a2 = -1;
        this.a3 = this.roundValPrec(
          this.point1[1] - this.a1 * this.point1[0],
          10,
        );
      }
    }
  }
  setA1(a1p) {
    this.a1 = a1p;
  }
  getA1() {
    return this.a1;
  }
  setA2(a2p) {
    this.a2 = a2p;
  }
  getA2() {
    return this.a2;
  }
  setA3(a3p) {
    this.a3 = a3p;
  }
  getA3() {
    return this.a3;
  }
  getDistance() {
    return Math.sqrt(
      Math.pow(this.point1[0] - this.point2[0], 2) +
        Math.pow(this.point1[1] - this.point2[1], 2),
    );
  }
  getX1() {
    return this.point1[0];
  }
  getX2() {
    return this.point2[0];
  }
  getY1() {
    return this.point1[1];
  }
  getY2() {
    return this.point2[1];
  }
  getCenter() {
    return [this.getXCenter(), this.getYCenter()];
  }
  getXCenter() {
    return (this.position[0] + this.width) / 2;
  }
  getYCenter() {
    return (this.position[1] + this.height) / 2;
  }
  setPoint1(point1_) {
    this.point1 = point1_;
  }
  getPoint1() {
    return this.point1;
  }
  setPoint2(point2_) {
    this.point2 = point2_;
  }
  getPoint2() {
    return this.point2;
  }
  /** points of curve */
  setPointsC(pointsC_) {
    this.pointsC = pointsC_;
  }
  getPointsC() {
    return this.pointsC;
  }
  getOppositePoint(point) {
    if (this.point1[0] === point[0] && this.point1[1] === point[1]) {
      return this.point2;
    }
    return this.point1;
  }
  /*perpendicular*/
  getBisector() {
    const l = new CLine(0, 0, 0, 0, [0, 0, 0]);
    l.setPoint1(this.getCenter());
    l.defVarEq(-1 / this.getA1());
    return l;
  }
  getPtWidthDir(pt1, pt2, w, dir) {
    const ptsM = this.getPointsMoveOnLine(pt1, w);
    for (let j = 0; j < ptsM.length; j++) {
      const v1 = this.defVector(pt1, pt2);
      const v2 = this.defVector(pt1, ptsM[j]);

      if (this.checkVectorsSameOrientation(v1, v2) === dir) {
        return ptsM[j];
      }
    }
    return null;
  }
  getAllLinePts(division) {
    const pts = [];
    if (division > 0) {
      const d = this.getDistance();
      if (d > 0) {
        const step = d / division;
        let w = 0;
        const ptRef = this.getLeftPoint();
        for (let i = 0; i < division - 1; i++) {
          w += step;
          pts.push(this.getPtFromPtDir(ptRef, w, true));
        }
      }
    }

    return pts;
  }
  getLeftPoint() {
    return this.point2[1] > this.point1[1] ? this.point1 : this.point2;
  }
  getPtFromPtDir(pt, width, dir) {
    // a1x + a2y + a3 = 0
    const pts = this.getPointsMoveOnLine(pt, width);
    //console.debug(pts);
    for (let i = 0; i < pts.length; i++) {
      if (this.a1 === 0) {
        // horizontal line
        if (dir === true && pts[i][0] > pt[0]) {
          return pts[i];
        } else if (dir === false && pts[i][0] <= pt[0]) {
          return pts[i];
        }
      } else {
        if (dir === true && pts[i][1] > pt[1]) {
          return pts[i];
        } else if (dir === false && pts[i][1] <= pt[1]) {
          return pts[i];
        }
      }
    }
    return null;
  }
  /**
   *
   * @param {type} point
   * @param {type} width
   * @returns {Array|CShape.getPointsMoveOnLine.points|getPointsMoveOnLine.points}
   */
  getPointsMoveOnLine(point, width) {
    const points = [];
    if (point === null) {
      return [];
    }

    if (this.a2 === 0) {
      // vertical line
      points.push([this.point1[0], point[1] + width]);
      points.push([this.point1[0], point[1] - width]);
      return points;
    }

    if (this.a1 === 0) {
      // horizontal line
      points.push([point[0] + width, point[1]]);
      points.push([point[0] - width, point[1]]);
      return points;
    }

    let valA = 1 + Math.pow(this.a1, 2);
    let valB = -2 * Math.pow(this.a1, 2) * point[0] - 2 * point[0];
    let valC =
      Math.pow(this.a1, 2) * Math.pow(point[0], 2) +
      Math.pow(point[0], 2) -
      Math.pow(width, 2);

    let pr = valB * valB - 4 * valA * valC;
    if (pr >= 0) {
      let x1 = (-valB + Math.sqrt(pr)) / (2 * valA);
      let y1 = this.a1 * x1 + this.a3;
      points.push([x1, y1]);
      let x2 = (-valB - Math.sqrt(pr)) / (2 * valA);
      points.push([this.roundVal(x2), this.roundVal(this.a1 * x2 + this.a3)]);
    }

    return points;
  }
  /**
   *
   * @returns {Array}
   */
  getVector() {
    return [this.point2[0] - this.point1[0], this.point2[1] - this.point1[1]];
  }
  /**
   *
   * @param {type} vector1
   * @param {type} vector2
   * @returns {Boolean}
   */
  checkVectorsSameOrientation(vector1, vector2) {
    if (vector1[0] === vector2[0] && vector1[1] === vector2[1]) {
      //return true;
    }

    if (
      ((vector1[0] >= 0 && vector2[0] >= 0) ||
        (vector1[0] <= 0 && vector2[0] <= 0)) &&
      ((vector1[1] >= 0 && vector2[1] >= 0) ||
        (vector1[1] <= 0 && vector2[1] <= 0))
    ) {
      return true;
    } else {
      //		console.debug('orientation différente');
      //		console.debug(vector1);
      //		console.debug(vector2);
    }
    return false;
  }
  /**
   *
   * @param {type} vector1
   * @param {type} vector2
   * @returns {Number}
   */
  getVectorsXMultiple(vector1, vector2) {
    if (vector1[0] === 0) {
      return 0;
    }
    return vector2[0] / vector1[0];
  }
  /**
   *
   * @param {type} vector1
   * @param {type} vector2
   * @returns {Number}
   */
  getVectorsYMultiple(vector1, vector2) {
    if (vector1[1] === 0) {
      return 0;
    }
    return vector2[1] / vector1[1];
  }
  /**
   *
   * @param {type} vector1
   * @param {type} vector2
   * @returns {Number|CShape.getVectorsMultipleCollinearity.k2|CShape.getVectorsMultipleCollinearity.k1}
   */
  getVectorsMultipleCollinearity(vector1, vector2) {
    const k1 = this.getVectorsXMultiple(vector1, vector2);
    const k2 = this.getVectorsYMultiple(vector1, vector2);
    if (vector2[0] === 0 && vector1[0] === 0) {
      return k2;
    }
    if (vector2[1] === 0 && vector1[1] === 0) {
      return k1;
    }
    return k1;
  }
  /**
   *
   * @param {type} line2
   * @returns {Array}
   */
  getLinesIntersection(line2) {
    this.defEquationFromPts();
    if (typeof line2 === 'object') {
      //line2.defEquationFromPts();
      // a1*x + a2*y + a3 = 0
      // b1*x + b2*y + b3 = 0
      // y = (-b1*x -b3)/b2
      // y = -b1x/b2 -b3/b2
      // a1x + a2*(-b1x/b2 -b3/b2) + a3 = 0
      // a1x -b1x*a2/b2 -a2*b3/b2 + a3 = 0
      // x = (+a2*b3/b2 - a3)/(a1-b1*a2/b2)

      if (this.a1 === line2.getA1()) {
        return null;
      } else {
        let x = 0;
        if (line2.getA2() === 0) {
          x = line2.getA3() * -1;
        } else {
          x =
            ((line2.getA3() * this.a2) / line2.getA2() - this.a3) /
            (this.a1 - (line2.getA1() * this.a2) / line2.getA2());
        }
        let y = this.a1 * x + this.a3;
        return [x, y];
      }
    }
    return null;
  }
  getCopy() {
    const line = new CLine(
      this.point1[0],
      this.point1[1],
      this.point2[0],
      this.point2[1],
      this.getStrokeColor(),
      this.getLineWidth(),
    );
    line.setA1(line.getA1());
    line.setA2(line.getA2());
    line.setA3(line.getA3());
    return line;
  }
  translation(v) {
    //console.debug(v);
    if (this.position && typeof this.position === 'object') {
      this.position[0] = this.position[0] + v[0];
      this.position[1] = this.position[1] + v[1];
    }
    if (this.point1 && this.point2) {
      this.point1[0] = this.point1[0] + v[0];
      this.point1[1] = this.point1[1] + v[1];

      this.point2[0] = this.point2[0] + v[0];
      this.point2[1] = this.point2[1] + v[1];
      this.defEquationFromPts();
    }
    if (this.getWidth() !== null && this.getHeight() !== null) {
      this.setWidth(this.getWidth() + v[0]);
      this.setHeight(this.getHeight() + v[1]);
    }
  }
  move(v1, v2) {
    //console.debug(v);
    if (this.position && typeof this.position === 'object') {
      this.position[0] = this.position[0] + v1[0];
      this.position[1] = this.position[1] + v1[1];
    }
    if (this.point1 && this.point2) {
      this.point1[0] = this.point1[0] + v1[0];
      this.point1[1] = this.point1[1] + v1[1];

      this.point2[0] = this.point2[0] + v2[0];
      this.point2[1] = this.point2[1] + v2[1];
      this.defEquationFromPts();
    }

    if (this.getWidth() !== null && this.getHeight() !== null) {
      this.setWidth(this.getWidth() + v1[0]);
      this.setHeight(this.getHeight() + v1[1]);
    }
  }
}
