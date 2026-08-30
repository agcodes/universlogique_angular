import CCircle from './CCircle';
import CLine from './CLine';
import CPolygon from './CPolygon';
import CRect from './CRect';
import CTriangle from './CTriangle';
import CEllipse from './CEllipse';

export default class ShapesGenerator {
  width = 0;
  height = 0;
  /**
   *
   * @param {type} h height
   * @param {type} w width
   * @returns {ShapesGenerator}
   */
  setDimension(h, w) {
    this.width = w;
    this.height = h;
  }
  getCenter() {
    return [this.getXCenter(), this.getYCenter()];
  }
  getXCenter() {
    return this.width / 2;
  }
  getYCenter() {
    return this.height / 2;
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setWidth(w) {
    this.width = w;
  }
  setHeight(h) {
    this.height = h;
  }
  getPoint(pt, colors, size, rel) {
    if (pt === null || typeof pt !== 'object') {
      return false;
    }
    if ((typeof colors !== 'object' || colors === null) && pt[3]) {
      colors = pt[3];
    }
    if (typeof colors !== 'object') {
      colors = [0, 0, 0];
    }

    if (typeof size !== 'number') {
      size = 2;
    }
    if (rel === true) {
      pt[0] = pt[0] * this.getWidth();
      pt[1] = pt[1] * this.getHeight();
    }

    pt[0] = Math.floor(pt[0]);
    pt[1] = Math.floor(pt[1]);

    return new CRect(
      pt[0] - size / 2,
      pt[1] - size / 2,
      size,
      size,
      colors,
      colors,
      1,
    );
  }
  getRandomTriangle(c1, angle, maxRandom, cDeltaAngle) {
    let step = 0;

    if (typeof maxRandom !== 'number') {
      maxRandom = 1 / 2;
    }
    if (typeof cDeltaAngle !== 'number') {
      cDeltaAngle = 1 / 2;
    }
    if (typeof angle !== 'number') {
      angle = 0;
      angle += Math.random() * Math.PI;
    }

    // first point
    const p1 = c1.getPointOnCircle(angle);

    const p = new CTriangle(null, [255, 255, 204], null, 'p');
    p.addPoint(p1);
    step = Math.random() * (Math.PI * maxRandom) + Math.PI * cDeltaAngle;

    angle += step;
    p.addPoint(c1.getPointOnCircle(angle));
    step = Math.random() * (Math.PI * maxRandom) + Math.PI * cDeltaAngle;
    angle += step;
    p.addPoint(c1.getPointOnCircle(angle));
    p.defLines();
    p.angleCalculation();
    p.roundValues();
    return p;
  }
  getFitCube2() {
    const shapes = [];
    const v = [(1 / 10) * this.getWidth(), (1 / 10) * this.getHeight()];

    const p1 = this.getFitPolygon(4);
    p1.translation([-v[0], -v[1]]);
    p1.setStrokeColor([0, 0, 0]);
    shapes.push(p1);

    const p2 = this.getFitPolygon(4);
    p2.translation([v[0], v[1]]);
    p1.setStrokeColor([0, 0, 0]);
    shapes.push(p2);

    return shapes;
  }
  getFitEllipse(p, q, strokeColor, fillColor) {
    let w = 0;
    let h = 0;
    if (typeof strokeColor !== 'object') {
      strokeColor = [0, 0, 0];
    }
    w = (this.getWidth() * p) / 100;
    h = (this.getHeight() * q) / 100;

    return new CEllipse(
      this.getXCenter() - w / 2,
      this.getYCenter() - h / 2,
      w,
      h,
      fillColor,
      strokeColor,
    );
  }
  getFitCircle(p, strokeColor, fillColor, lineWidth) {
    let diameter = 0;
    if (typeof lineWidth !== 'number') {
      lineWidth = 1;
    }
    if (typeof p !== 'number') {
      p = 80;
    }
    if (typeof strokeColor !== 'object') {
      strokeColor = [0, 0, 0];
    }
    if (typeof p !== 'number') {
      fillColor = null;
    }
    if (this.getHeight() > this.getWidth()) {
      diameter = (this.getWidth() * p) / 100;
    } else {
      diameter = (this.getHeight() * p) / 100;
    }
    return new CCircle(
      this.getXCenter() - diameter / 2,
      this.getYCenter() - diameter / 2,
      diameter,
      diameter,
      fillColor,
      strokeColor,
      lineWidth,
    );
  }
  /**
   *
   * @param {type} nb
   * @param {type} p
   * @param {type} a
   * @param {type} regular
   * @returns {CPolygon}
   */
  getFitPolygon(nb, size, a, regular) {
    const c = this.getFitCircle(size);
    if (typeof a !== 'number') {
      a = 0;
    }
    return this.getPolygonFromCircle(c, a, nb, regular);
  }

  /**
   *
   * @param {type} c
   * @param {type} a
   * @param {type} nb
   * @param {type} regular
   * @returns {CPolygon}
   */
  getPolygonFromCircle(c, a, nb, regular) {
    const pts = [];
    for (let i = 0; i < nb; i++) {
      pts.push(c.getPointOnCircle(a));
      if (regular === false) {
        a += Math.random() * ((2 * Math.PI) / nb - Math.PI / nb) + Math.PI / nb;
      } else {
        a += (2 * Math.PI) / nb;
      }
    }
    return new CPolygon(pts);
  }
  getFitCube(m, size, bHiddenFace) {
    const squares = [];
    const c = this.getFitCircle(size);
    const pts = Array();

    let angle = m * Math.PI;
    for (let i = 0; i < 6; i++) {
      pts.push(c.getPointOnCircle(angle));
      angle += (2 * Math.PI) / 6;
    }

    // points of each face
    const indPts = new Array([0, 1, 6, 5], [1, 2, 3, 6], [6, 3, 4, 5]);
    if (bHiddenFace === true) {
      indPts.push([0, 1, 2, 6]);
      indPts.push([5, 0, 6, 4]);
    }

    pts.push(c.getCenter());
    for (let i = 0; i < indPts.length; i++) {
      const p = new CPolygon(
        [
          pts[indPts[i][0]],
          pts[indPts[i][1]],
          pts[indPts[i][2]],
          pts[indPts[i][3]],
        ],
        [255, 0, 0],
      );
      p.roundValues();
      p.defLines();
      squares.push(p);
    }

    return squares;
  }
  getDividedPolygon(nb, nb2, size) {
    const c = this.getFitCircle(size);
    const p = this.getFitPolygon(nb, size, 0);
    let j = 0;
    const pts = p.getPoints();
    const ptC = c.getCenter();
    const parts = [];
    for (let i = 0; i < nb; i++) {
      const subParts = [];

      j = i < nb - 1 ? i + 1 : i + 1 - nb;
      const l1 = new CLine();
      l1.setTwoPoints(pts[i], ptC, true);

      const l2 = new CLine();
      l2.setTwoPoints(pts[j], ptC, true);
      const d = l1.getDistance();

      let pt1 = pts[i];
      let pt2 = pts[j];

      for (let k = 0; k < nb2 - 1; k++) {
        const pt4 = l1.getPointsMoveOnSegment(pt1, ptC, d / (nb2 - 1));
        const pt3 = l2.getPointsMoveOnSegment(pt2, ptC, d / (nb2 - 1));
        const t = new CPolygon();
        t.setPoints([pt1, pt2, pt3, pt4]);

        pt1 = pt4;
        pt2 = pt3;

        subParts.push(t);
      }

      parts.push(subParts);
    }
    return parts;
  }
  getDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2),
    );
  }
  getClosestPoint(point1, point2, point3) {
    const d1 = Math.sqrt(
      Math.pow(point2[0] - point1[0], 2) +
      Math.pow(point2[1] - point1[1], 2),
    );
    const d2 = Math.sqrt(
      Math.pow(point3[0] - point1[0], 2) +
      Math.pow(point3[1] - point1[1], 2),
    );

    if (d1 > d2) {
      return point3;
    } else {
      return point2;
    }
  }
  mulVector(v1, a, b) {
    return [v1[0] * a, v1[1] * b];
  }
  addVector(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
  }
  getFarthestPoint(point1, point2, point3) {
    const d1 = Math.sqrt(
      Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2),
    );
    const d2 = Math.sqrt(
      Math.pow(point3[0] - point1[0], 2) + Math.pow(point3[1] - point1[1], 2),
    );

    if (d1 > d2) {
      return point2;
    } else {
      return point3;
    }
  }
}
