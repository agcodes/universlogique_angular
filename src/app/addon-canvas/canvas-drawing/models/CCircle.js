import CShape from './CShape';
import CLine from './CLine';

export default class CCircle extends CShape {
  constructor(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth) {
    super(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth);
    this.wise = false;
    this.scale = null;
    this.radius = 0;
    this.radiusI = 0;
    this.radiusF = 2 * Math.PI;
    this.radius = this.width / 2;
    this.type = 'circle';
  }
  copy(o) {
    this.copySphape(o);
    this.wise = o.wise;
    this.scale = o.scale;
    this.radius = o.radius;
    this.radiusI = o.radiusI;
    this.radiusF = o.radiusF;
  }
  center(canvasCenter) {
    this.position = [
      canvasCenter[0] - this.radius,
      canvasCenter[1] - this.radius,
    ];
  }
  setWise(w) {
    this.wise = w;
  }
  getWise() {
    return this.wise;
  }
  setScale(s) {
    this.scale = s;
  }
  getScale() {
    return this.scale;
  }
  setRadius(r) {
    this.radius = r;
  }
  getRadius() {
    return this.radius;
  }
  setRadiusF(rF) {
    this.radiusF = rF;
  }
  getRadiusF() {
    return this.radiusF;
  }
  setRadiusI(rI) {
    this.radiusI = rI;
  }
  getRadiusI() {
    return this.radiusI;
  }
  defCenter(pt) {
    this.x = pt[0] - this.radius;
    this.y = pt[1] - this.radius;
    this.position = [this.x, this.y];
  }
  setWidthFixCenter(w) {
    const x = this.getXCenter();
    const y = this.getYCenter();
    this.setWidth(w);
    this.setHeight(w);
    this.defCenter([x, y]);
  }
  setWidth(w) {
    this.width = w;
    this.radius = this.width / 2;
  }
  resizeShape(w, h) {
    if (typeof w === 'number' && typeof h === 'number') {
      this.setXY(this.getX() * w, this.getY() * h);
      this.setWidth(this.getWidth() * h);
      this.setHeight(this.getHeight() * h);
      this.initialPosition[0] = this.initialPosition[0] * w;
      this.initialPosition[1] = this.initialPosition[1] * h;
    }
  }
  getInCircle(pt) {
    if (pt[0] > this.getXRight()) {
      return false;
    }
    if (pt[0] < this.getXLeft()) {
      return false;
    }
    if (pt[1] > this.getYTop()) {
      return false;
    }
    return pt[1] >= this.getYBottom();
  }
  display(context, offSet) {
    if (offSet === null || typeof offSet !== 'object') {
      offSet = [0, 0];
    }
    if (this.scale) {
      context.save();
      context.translate(
        this.getXCenter() + offSet[0],
        this.getYCenter() + offSet[1],
      );
      context.scale(this.scale[0], this.scale[1]);
    }
    context.beginPath();

    if (this.getRadius() < 0) {
      return false;
    }
    if (this.scale !== null) {
      // arc(x, y, rayon, angleInitial, angleFinal,  [true | false])
      context.arc(
        0,
        0,
        this.getRadius(),
        this.radiusI,
        this.radiusF,
        this.wise,
      );
      context.restore();
    } else {
      // arc(x, y, rayon, angleInitial, angleFinal,  [true | false])
      context.arc(
        this.getXCenter() + offSet[0],
        this.getYCenter() + offSet[1],
        this.getRadius(),
        this.radiusI,
        this.radiusF,
        this.wise,
      );
    }
    this.defStyle(context);
    context.fill();
    context.stroke();

    if (this.rotation !== null) {
      context.rotate(this.rotation);
      context.fillRect();
      //context.setTransform(1, 0, 0, 1, 0, 0);
    }
    return true;
  }
  defineStep(nbP) {
    return (2 * Math.PI) / nbP;
  }
  getPointOnCircle(angle) {
    return [
      this.getRadius() * Math.cos(angle) + this.getXCenter(),
      this.getRadius() * Math.sin(angle) + this.getYCenter(),
    ];
  }
  getAngleFromPoint(point, c) {
    let a = Math.atan2(
      point[1] - this.getYCenter(),
      point[0] - this.getXCenter(),
    );
    if (c === true && a < 0) {
      a += 2 * Math.PI;
    }
    a = a % (2 * Math.PI);
    return a;
  }
  getTangent(point) {
    // radius
    const line1 = new CLine(
      point[0],
      point[1],
      this.getXCenter(),
      this.getYCenter(),
    );
    return line1.getPerpendicular(point);
  }
  getIntersectionWithSegment(l, bTang) {
    const ptsR = [];
    const pts = this.getIntersectionWithLine(l, bTang);
    if (pts.length > 0) {
      for (let j = 0, n = pts.length; j < n; j++) {
        if (l.checkIfPointOnSegment(pts[j]) === true) {
          ptsR.push(pts[j]);
        }
      }
    }
    return ptsR;
  }

  /**
   *
   * @param {type} l
   * @param {type} bTang
   * @returns {Array|CShape.getIntersectionWithLine.points|getIntersectionWithLine.points}
   */
  getIntersectionWithLine(l, bTang) {
    let valC = 0;
    let valB = 0;
    let valA = 0;
    let k = 0;
    const points = [];
    let s1 = 0;
    let s2 = 0;

    if (typeof bTang !== 'boolean') {
      bTang = false;
    }

    // circle (x–a)2+(y–b)2=r2
    // line a1x + a2y + a3 = 0
    // x2 + a2 -2ax + y2 + b2 -2yb = r2
    //

    const r = this.getRadius();
    const alpha = this.getXCenter();
    const beta = this.getYCenter();

    if (l.getPoint1() && l.getPoint2()) {
      l.defEquationFromPts();
    }

    valC = this.roundValPrec(
      Math.pow(alpha, 2) + Math.pow(l.getA3() - beta, 2) - Math.pow(r, 2),
    );
    valB = this.roundValPrec(-2 * alpha + 2 * l.getA1() * (l.getA3() - beta));
    valA = this.roundValPrec(1 + Math.pow(l.getA1(), 2));

    if (l.getA2() === 0) {
      // ligne verticale
      // x contant
      // pts.length > 0
      // circle (x–a)^2+(y–b)^2=r^2
      // equation a1x + a2y + a3 = 0 => a1x + a3 = 0
      // x = -a3/a1
      // x2 + a^2 -2ax + y^2 + b^2 -2yb = r^2
      // (-a3/a1)^2 + a^2 -2a*(-a3/a1) +y^2 +b^2 -2yb = r^2
      // +y^2 -2by + (-a3/a1)^2 + a^2 -2a*(-a3/a1) +b^2 - r^2 = 0

      valA = 1;
      valB = -2 * beta;
      valC =
        Math.pow((l.getA3() * -1) / l.getA1(), 2) +
        Math.pow(alpha, 2) -
        (2 * alpha * (l.getA3() * -1)) / l.getA1() +
        Math.pow(beta, 2) -
        Math.pow(r, 2);
      //k = this.roundValPrec(valB * valB - 4 * valA * valC);
    }

    if (bTang !== true) {
      // b2 - 4ac
      k = this.roundValPrec(valB * valB - 4 * valA * valC);
    } else {
      //k = 0;
    }

    if (k >= 0) {
      // pt 1
      s1 = this.roundValPrec((-valB + Math.sqrt(k)) / (2 * valA));
      // pt 2
      s2 = this.roundValPrec((-valB - Math.sqrt(k)) / (2 * valA));
    } else {
      return [];
    }

    if (l.getA2() === 0) {
      points.push([l.getA3() * -1, s1]);
      points.push([l.getA3() * -1, s2]);
    } else {
      points.push([s1, this.roundValPrec(l.getA1() * s1 + l.getA3())]);
      points.push([s2, this.roundValPrec(l.getA1() * s2 + l.getA3())]);
    }

    return points;
  }
  getPerimeter() {
    // 2 x π x R
    return 2 * Math.PI * this.radius;
  }
  /*
   * a circle is defined by 3 points
   */
  defCircleFromPoints(p) {
    if (p && p.length >= 3) {
      // circle center
      let cx = this.roundVal(
        (Math.pow(p[2][0], 2) - Math.pow(p[1][0], 2)) / (p[2][1] - p[1][1]) -
          (Math.pow(p[0][0], 2) - Math.pow(p[1][0], 2)) / (p[0][1] - p[1][1]) +
          p[2][1] -
          p[0][1],
      );
      cx = this.roundVal(
        cx /
          (2 * ((p[2][0] - p[1][0]) / (p[2][1] - p[1][1])) -
            2 * ((p[0][0] - p[1][0]) / (p[0][1] - p[1][1]))),
      );
      let cy = this.roundVal(
        -2 * cx * ((p[2][0] - p[1][0]) / (p[2][1] - p[1][1])) +
          (Math.pow(p[2][0], 2) - Math.pow(p[1][0], 2)) / (p[2][1] - p[1][1]) +
          p[2][1] +
          p[1][1],
      );
      cy = this.roundVal(cy / 2);

      const r = this.roundVal(
        Math.sqrt(Math.pow(cx - p[0][0], 2) + Math.pow(cy - p[0][1], 2)),
      );
      this.setWidth(r * 2);
      this.height = r * 2;
      this.position = [cx - r, cy - r];
      return [cx, cy];
    }
    return null;
  }

  defRadiusFromPoint(pt, center) {
    return this.roundVal(
      Math.sqrt(
        Math.pow(center[0] - pt[0], 2) + Math.pow(center[1] - pt[1], 2),
      ),
    );
  }

  getIntersectionWithACircle(c2, color) {
    const objects = [];
    const pts = this.getIntersectionPointsWithACircle(c2);
    const angles = [];
    for (let index = 0; index < pts.length; index++) {
      angles.push(this.getAngleFromPoint(pts[index]));
    }

    const c4 = new CCircle();
    c4.copy(this);
    c4.setPosition(this.getPosition());
    c4.setRadiusF(angles[0]);
    c4.setRadiusI(angles[1]);
    c4.setLineWidth(3);
    c4.setStrokeColor(color);
    c4.setFillColor(color);
    objects.push(c4);

    const angles2 = [];
    for (let index = 0; index < pts.length; index++) {
      angles2.push(c2.getAngleFromPoint(pts[index]));
    }

    const c5 = new CCircle();
    c5.copy(c2);
    c5.setFillColor(color);
    c5.setStrokeColor(color);
    c5.setLineWidth(3);
    c5.setPosition(c2.getPosition());
    c5.setRadiusF(angles2[1]);
    c5.setRadiusI(angles2[0]);

    objects.push(c5);

    if (pts.length > 1) {
      // corriger défaut assemblage demi-cercles
      objects.push(new CLine(0, 0, 0, 0, color, 7, pts[0], pts[1]));
    }

    return objects;
  }
  getIntersectionPointsWithACircle(c2) {
    let alpha = 0;
    let beta = 0;
    let gamma = 0;
    let x = 0;
    let y = 0;
    let n = 0;
    let p = 0;
    const points = [];
    const r0 = this.getRadius();
    const r1 = c2.getRadius();
    const x0 = this.getXCenter();
    const x1 = c2.getXCenter();
    const y0 = this.getYCenter();
    const y1 = c2.getYCenter();

    if (this.roundVal(y0 - y1) === 0) {
      alpha = 1;
      beta = -2 * y1;
      gamma =
        Math.pow(x1, 2) +
        Math.pow(x0, 2) -
        2 * x1 * x0 +
        Math.pow(y1, 2) -
        Math.pow(r0, 2);
    } else {
      p = (x0 - x1) / (y0 - y1);
      n =
        (Math.pow(r1, 2) -
          Math.pow(r0, 2) -
          Math.pow(x1, 2) +
          Math.pow(x0, 2) -
          Math.pow(y1, 2) +
          Math.pow(y0, 2)) /
        (2 * (y0 - y1));
      alpha = this.roundVal(Math.pow(p, 2) + 1);
      beta = 2 * y0 * p - 2 * n * p - 2 * x0;
      gamma =
        Math.pow(x0, 2) +
        Math.pow(y0, 2) +
        Math.pow(n, 2) -
        Math.pow(r0, 2) -
        2 * y0 * n;
    }

    // (x0-x1)/(y0-y1)

    const k = Math.pow(beta, 2) - 4 * alpha * gamma;
    if (this.roundVal(k) < 0) {
      return points;
    }

    const delta = Math.sqrt(k);

    if (this.roundVal(alpha) === 0) {
      return points;
    }

    if (this.roundVal(y0 - y1) === 0) {
      y = (-beta + delta) / (2 * alpha);
      x =
        (Math.pow(r1, 2) -
          Math.pow(r0, 2) -
          Math.pow(x1, 2) +
          Math.pow(x0, 2)) /
        (2 * (x0 - x1));

      points.push([x, y]);

      y = (-beta - delta) / (2 * alpha);

      points.push([x, y]);
    } else {
      x = (-beta + delta) / (2 * alpha);
      y = n - x * p;
      points.push([x, y]);

      x = (-beta - delta) / (2 * alpha);
      y = n - x * p;
      points.push([x, y]);
    }

    //console.debug(points);
    return points;
  }
}
