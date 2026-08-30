import CPolygon from './CPolygon';
import CLine from './CLine';
import CCircle from './CCircle';

export default class CTriangle extends CPolygon {
  constructor(pts_, fillColor_, strokeColor_, lineWidth_) {
    super(pts_, fillColor_, strokeColor_, lineWidth_);
    this.angles = [];
    this.bisextrixes = [];
    this.hauteurs = [];
    this.bisextrixesCenter = [];
    this.debugObjects = [];
  }
  getCircleSide() {
    const a = this.lines[0].getDistance();
    return new CCircle(
      this.points[0][0] - a,
      this.points[0][1] - a,
      a * 2,
      a * 2,
    );
  }
  getPointTest(i) {
    this.angleCalculation();
    const lines = this.getLines();
    const a = lines[i].getDistance();
    const circle = new CCircle(
      this.points[i][0] - a,
      this.points[i][1] - a,
      a * 2,
      a * 2,
    );
    const angle = circle.getAngleFromPoint(this.points[i]);
    return circle.getPointOnCircle(angle);
  }
  /*euler circle passes through the midpoint of each side of the triangle*/
  getNinePointCircle() {
    const pts = this.getLinesCenters();
    const c = new CCircle(0, 0, 0, 0, null, [0, 0, 0]);
    c.defCircleFromPoints(pts);
    return c;
  }
  getOppositePoint(line) {
    this.roundValues();
    line.roundValues();
    for (let j = 0; j < this.points.length; j++) {
      if (
        line.getX1() !== this.points[j][0] &&
        line.getY1() !== this.points[j][1] &&
        line.getX2() !== this.points[j][0] &&
        line.getY2() !== this.points[j][1]
      ) {
        return this.points[j];
      }
    }
  }
  getBisectors(strokeColor) {
    const bisectors = [];
    for (let j = 0; j < this.lines.length; j++) {
      this.lines[j].defEquationFromPts();
      const l = this.lines[j].getPerpendicular(this.lines[j].getCenter());
      l.setStrokeColor(strokeColor);
      l.setLineWidth(2);
      for (let k = 0; k < this.lines.length; k++) {
        if (k !== j && k >= 0) {
          let pt = this.lines[k].getLinesIntersection(l);
          if (pt && this.lines[k].checkIfPointOnSegment(pt)) {
            l.setPoint2(pt);
            bisectors.push(l);
            break;
          }
        }
      }
    }
    return bisectors;
  }
  getAltitudes() {
    this.hauteurs = [];
    for (let j = 0; j < this.lines.length; j++) {
      this.lines[j].defEquationFromPts();
      // perpendicular line
      const l = new CLine(0, 0, 0, 0, [0, 0, 0]);
      l.setPoint1(this.getOppositePoint(this.lines[j]));
      l.defVarEq(-1 / this.lines[j].getA1());
      l.setLineWidth(2);
      const pt2 = this.lines[j].getLinesIntersection(l);
      l.setPoint2(pt2);
      this.hauteurs.push(l);
    }
    return this.hauteurs;
  }
  getLinesCenters() {
    const pts = [];
    for (let j = 0; j < this.lines.length; j++) {
      // center of the ligne
      pts.push([this.lines[j].getXCenter(), this.lines[j].getYCenter()]);
    }
    return pts;
  }
  getMedians() {
    const medians = [];
    this.roundValues();
    for (let j = 0; j < this.lines.length; j++) {
      const middlePt = this.lines[j].getCenter();
      const apex = this.getOppositePoint(this.lines[j]);
      medians.push(
        new CLine(middlePt[0], middlePt[1], apex[0], apex[1], [0, 0, 0], 1),
      );
    }
    return medians;
  }
  getOrthocenter() {
    this.getAltitudes();
    if (this.hauteurs.length <= 1) {
      return [0, 0];
    }
    return this.hauteurs[0].getLinesIntersection(this.hauteurs[1]);
  }
  getCircumscribedCircle() {
    const c = new CCircle(0, 0, 0, 0, null, [0, 0, 0]);
    c.defCircleFromPoints(this.points);
    return c;
  }
  getIncircle() {
    this.getBisectrixes();
    this.getAltitudes();
    const r = (2 * this.getSurface()) / this.getPerimeter();
    const c = new CCircle(0, 0, 0, 0, null, [0, 0, 0]);
    c.setWidth(r * 2);
    c.setHeight(r * 2);
    if (this.bisextrixesCenter) {
      c.setPosition([
        this.bisextrixesCenter[0] - r,
        this.bisextrixesCenter[1] - r,
      ]);
    }
    return c;
  }
  getSurface() {
    //  Math.sqrt(1/2*perimeter * (p − a) (p − b) (p − c))
    const p = this.getPerimeter() / 2;
    return Math.sqrt(
      p *
        (p - this.lines[0].getDistance()) *
        (p - this.lines[1].getDistance()) *
        (p - this.lines[2].getDistance()),
    );
  }
  getPerimeter() {
    let p = 0;
    for (let j = 0; j < this.lines.length; j++) {
      p += this.lines[j].getDistance();
    }
    return p;
  }
  getBisectrixes() {
    this.bisextrixes = this.getSectrixes(0.5);
    if (this.bisextrixes.length > 0) {
      this.bisextrixesCenter = this.bisextrixes[0].getLinesIntersection(
        this.bisextrixes[1],
      );
    }
    return this.bisextrixes;
  }
  getBisectrixesCenter() {
    this.bisextrixes = this.getSectrixes(0.5);
    if (this.bisextrixes.length >= 1) {
      this.bisextrixesCenter = this.bisextrixes[0].getLinesIntersection(
        this.bisextrixes[1],
      );
      return this.bisextrixesCenter;
    }
    return null;
  }
  getHauteursBottoms() {
    this.hauteurs = this.getAltitudes();
    const pts = [];
    for (let j = 0; j < this.hauteurs.length; j++) {
      pts.push(this.lines[j].getLinesIntersection(this.hauteurs[j]));
    }
    return pts;
  }
  getOrthicTriangle(strokeColor) {
    const t = new CTriangle(this.getHauteursBottoms());
    t.setStrokeColor(strokeColor);
    return t;
  }
  getSectrixes(fract) {
    const sextrixes = [];
    for (let i = 0; i < this.points.length; i++) {
      const line = this.getGenericSectrixe(i, fract);
      if (line !== null) {
        sextrixes.push(line);
      }
    }
    return sextrixes;
  }
  getGenericSectrixe(i, fract) {
    let s = i + 1;
    if (s === this.points.length) {
      s = 0;
    }

    let adj = i - 1;
    if (adj < 0) {
      adj = 2;
    }

    this.lines[i].defEquationFromPts();

    const a = this.lines[i].getDistance();
    const c = new CCircle(0, 0, 0);
    c.defCenter(this.points[i]);
    c.setWidthFixCenter(a);

    let aX = 0;
    const ptsAdj = c.getIntersectionWithSegment(this.lines[adj]);
    for (let index = 0; index < ptsAdj.length; index++) {
      aX = c.getAngleFromPoint(ptsAdj[index]);
      break;
    }

    const pts = c.getIntersectionWithSegment(this.lines[i]);
    for (let index = 0; index < pts.length; index++) {
      const ab = c.getAngleFromPoint(pts[index]);
      const a0 = ab + (-ab + aX) * fract;
      const pt2 = c.getPointOnCircle(a0);
      const line = new CLine();
      line.setTwoPoints(this.points[i], pt2, true);
      const pt = this.lines[s].getLinesIntersection(line);
      if (pt) {
        line.setTwoPoints(this.points[i], pt, true);
        line.setLineWidth(2);
        line.setStrokeColor([0, 0, 0]);
        return line;
      }
    }
    return null;
  }
}
