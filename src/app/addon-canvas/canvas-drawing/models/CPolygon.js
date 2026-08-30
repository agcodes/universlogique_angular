import CShape from './CShape';
import CLine from './CLine';
import CCircle from './CCircle';

export default class CPolygon extends CShape {
  constructor(pts_, fillColor_, strokeColor_, lineWidth_) {
    super(0, 0, 0, 0, fillColor_, strokeColor_, lineWidth_);
    this.type = 'polygon';
    this.points = null;
    this.lines = null;
    this.angles = null;
    this.lines = [];
    this.points = [];
    this.angles = [];
    this.centerPt = null;
    if (pts_) {
      this.setPoints(pts_);
    }
  }
  getPoint(i) {
    if (this.points.length >= i + 1) {
      return this.points[i];
    }
  }
  setCenterPt(c) {
    this.center = c;
  }
  setPointI(pt, i) {
    if (i === 0) {
      this.position[0] = pt[0];
      this.position[1] = pt[1];
    }
    this.points[i] = pt;
  }
  getCenterPt() {
    return this.center;
  }
  getCopy() {
    const p = new CPolygon();
    p.copySphape(this);
    p.setPoints(this.points);
    return p;
  }
  getNewPoints() {
    const pts = [];
    for (let i = 0; i < this.points.length; i++) {
      pts.push([this.points[i][0], this.points[i][1]]);
    }
    return pts;
  }
  setPoints(pts) {
    if (pts !== null && typeof pts === 'object') {
      if (pts.length > 1 && pts[0]) {
        this.position = [pts[0][0], pts[0][1]];
      }

      this.points = [];
      for (let i = 0, n = pts.length; i < n; i++) {
        if (pts[i]) {
          this.points.push([pts[i][0], pts[i][1]]);
        }
      }

      this.lines = [];
      this.defLines();

      // default
      for (let j = 0, max = this.points.length; j < max; j++) {
        this.angles.push(
          (Math.PI * (this.points.length - 2)) / this.points.length,
        );
      }
    }
  }
  getSectrixes(fract) {
    const sextrixes = [];
    for (let i = 0; i < this.lines.length; i++) {
      const d = this.lines[i].getDistance() / 2;
      const c = new CCircle(0, 0, d, d);
      c.defCenter(this.lines[i].getPoint1());
      const pts = c.getIntersectionWithLine(this.lines[i]);
      for (let j = 0, max = pts.length; j < max; j++) {
        if (this.lines[i].checkIfPointOnSegment(pts[j])) {
          const a = c.getAngleFromPoint(pts[j]) + this.angles[i] * fract;
          const line = new CLine(0, 0, 0, 0, [0, 0, 0]);
          line.setTwoPoints(
            this.lines[i].getPoint1(),
            c.getPointOnCircle(a),
            true,
          );
          sextrixes.push(line);
        }
      }
    }
    return sextrixes;
  }
  getBisectrixesCenter() {
    const bisextrixes = this.getSectrixes(0.5);
    if (bisextrixes.length >= 2) {
      return bisextrixes[0].getLinesIntersection(bisextrixes[1]);
    }
    return [];
  }
  getDiagonal(ind1, ind2) {
    return new CLine(
      this.points[ind1][0],
      this.points[ind1][1],
      this.points[ind2][0],
      this.points[ind2][1],
    );
  }
  getDiagonalsIntersection(ind1, ind2, ind3, ind4) {
    const d1 = this.getDiagonal(ind1, ind2);
    const d2 = this.getDiagonal(ind3, ind4);
    return d1.getLinesIntersection(d2);
  }
  getPoints() {
    return this.points;
  }
  getDiagonals() { }
  /** set lines from points
   *
   */
  defLines() {
    this.lines = [];
    if (this.points) {
      for (let i = 0, n = this.points.length; i < n; i++) {
        const j = i + 1 === this.points.length ? 0 : i + 1;
        this.lines.push(
          new CLine(
            this.points[i][0],
            this.points[i][1],
            this.points[j][0],
            this.points[j][1],
            [0, 0, 0],
          ),
        );
      }
    }
    for (let index = 0; index < this.lines.length; index++) {
      this.lines[index].defEquationFromPts();
    }
  }
  setLines(l) {
    this.lines = l;
  }
  getLines() {
    return this.lines;
  }
  addPoint(point) {
    this.points.push(point);
    if (this.points.length === 1) {
      this.position = point;
    }
  }
  rotation() { }
  translation(v) {
    if (v !== null && typeof v === 'object') {
      if (this.position !== null && typeof this.position === 'object') {
        this.position[0] = this.position[0] + v[0];
        this.position[1] = this.position[1] + v[1];
      }
      if (this.points !== null && typeof this.points === 'object') {
        for (let i = 0, n = this.points.length; i < n; i++) {
          this.points[i][0] = this.points[i][0] + v[0];
          this.points[i][1] = this.points[i][1] + v[1];
        }
      }
      this.defLines();
    }
  }
  getGrid(nbC) {
    const polygons = [];
    // points of first square
    const pt0 = this.points[0];
    const pt1 = this.lines[0].getPointsMoveOnSegment(
      pt0,
      this.points[1],
      this.lines[0].getDistance() / nbC,
    );
    const pt3 = this.lines[3].getPointsMoveOnSegment(
      pt0,
      this.points[3],
      this.lines[3].getDistance() / nbC,
    );

    if (pt1 === null || pt3 === null) {
      return [];
    }
    const v0 = this.defVector(pt0, pt1);
    const v3 = this.defVector(pt0, pt3);
    const pt2 = this.applyVector(pt1, v3);

    let ptsB = [pt0, pt1, pt2, pt3];

    for (let i = 0; i < nbC; i++) {
      const ptsC = [ptsB[0], ptsB[1], ptsB[2], ptsB[3]];
      for (let j = 0; j < nbC; j++) {
        polygons.push(new CPolygon([ptsB[0], ptsB[1], ptsB[2], ptsB[3]], null));
        ptsB[0] = ptsB[3];
        ptsB[1] = ptsB[2];

        ptsB[2] = this.applyVector(ptsB[2], v3);
        ptsB[3] = this.applyVector(ptsB[3], v3);
      }

      ptsB = [ptsC[0], ptsC[1], ptsC[2], ptsC[3]];
      for (let k = 0; k < 4; k++) {
        ptsB[k] = this.applyVector(ptsB[k], v0);
      }
    }
    return polygons;
  }
  roundValues(d) {
    for (let i = 0, n = this.points.length; i < n; i++) {
      this.points[i][0] = this.roundVal(this.points[i][0], d);
      this.points[i][1] = this.roundVal(this.points[i][1], d);
    }
    for (let j = 0, m = this.lines.length; j < m; j++) {
      this.lines[j].roundValues(d);
    }
    this.height = this.roundVal(this.height, d);
    this.width = this.roundVal(this.width, d);
  }
  resizeShape(w, h) {
    if (this.position) {
      this.position[0] = this.position[0] * w;
      this.position[1] = this.position[1] * h;
    }
    if (this.points) {
      for (let i = 0, n = this.points.length; i < n; i++) {
        this.points[i][0] = this.points[i][0] * w;
        this.points[i][1] = this.points[i][1] * h;
      }
    }
    if (this.lines) {
      for (let j = 0, m = this.lines.length; j < m; j++) {
        this.lines[j].resizeShape(w, h);
      }
    }
  }
  /**
   * display polygon
   * @param {type} context
   * @param {type} offSet
   * @returns {boolean}
   */
  display(context, offSet) {
    if (offSet === null || typeof offSet !== 'object') {
      offSet = [0, 0];
    }
    context.beginPath();

    this.defStyle(context);

    if (this.points && this.points.length > 0) {
      // first point
      context.moveTo(
        this.position[0] + offSet[0],
        this.position[1] + offSet[1],
      );
      for (let i = 1, n = this.points.length; i < n; i++) {
        context.lineTo(
          this.points[i][0] + offSet[0],
          this.points[i][1] + offSet[1],
        );
      }
      context.closePath();
    }

    context.stroke();

    context.fill();
    return true;
  }
  /** center polygon on the canvas
   *
   * @param canvasCenter
   */
  center(canvasCenter) {
    let max = [0, 0];

    for (let i = 0, n = this.points.length; i < n; i++) {
      for (let j = 0; j < 2; j++) {
        if (this.points[i][j] >= max[j]) {
          max[j] = this.points[i][j];
        }
      }
    }

    let min = [max[0], max[1]];

    for (let i = 0, n = this.points.length; i < n; i++) {
      for (let j = 0; j < 2; j++) {
        if (this.points[i][j] <= min[j]) {
          min[j] = this.points[i][j];
        }
      }
    }

    const pCenter = [0, 0];
    for (let j = 0; j < 2; j++) {
      pCenter[j] = (max[j] + min[j]) / 2;
    }

    for (let i = 0, n = this.points.length; i < n; i++) {
      this.points[i][0] += canvasCenter[0] - pCenter[0];
      this.points[i][1] += canvasCenter[1] - pCenter[1];
    }

    this.position = [this.points[0][0], this.points[0][1]];

    this.defLines();
  }
  // mini
  getYBottom() {
    let y = 0;
    for (let i = 0, n = this.points.length; i < n; i++) {
      if (i === 0 || y > this.points[i][1]) {
        y = this.points[i][1];
      }
    }
    return y;
  }

  // maxi
  getYTop() {
    let y = 0;
    for (let i = 0, n = this.points.length; i < n; i++) {
      if (this.points[i][1] > y) {
        y = this.points[i][1];
      }
    }
    return y;
  }
  getXCenter() { }
  getYCenter() { }
  calcWidth() {
    return this.getXRight() - this.getXLeft();
  }
  calcHeight() {
    return this.getYTop() - this.getYBottom();
  }
  // mini
  getXLeft() {
    let x = 0;
    for (let i = 0, n = this.points.length; i < n; i++) {
      if (i === 0 || x > this.points[i][0]) {
        x = this.points[i][0];
      }
    }
    return x;
  }

  // maxi
  getXRight() {
    let x = 0;
    for (let i = 0, n = this.points.length; i < n; i++) {
      if (this.points[i][0] > x) {
        x = this.points[i][0];
      }
    }
    return x;
  }
  checkIfPointIsTop(pt) {
    for (let i = 0, n = this.points.length; i < n; i++) {
      if (this.points[i][0] === pt[0] && this.points[i][1] === pt[1]) {
        return true;
      }
    }
    return false;
  }
  angleCalculation() {
    if (this.lines.length === 3) {
      // Al-Kashi Theorem
      let a = this.lines[0].getDistance();
      let b = this.lines[1].getDistance();
      let c = this.lines[2].getDistance();

      this.angles = new Array();

      //α = arccos[(b² + c² − a²) ÷ 2bc]
      this.angles[2] = Math.acos((b * b + c * c - a * a) / (2 * b * c));
      //β = arccos[(a² + c² − b²) ÷ 2ac]
      this.angles[0] = Math.acos((a * a + c * c - b * b) / (2 * a * c));
      //γ = arccos[(a² + b² − c²) ÷ 2ab]
      this.angles[1] = Math.acos((a * a + b * b - c * c) / (2 * a * b));
    }
  }
}
