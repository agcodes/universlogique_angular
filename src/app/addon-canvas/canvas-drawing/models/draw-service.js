import CLine from './CLine';
import CPolygon from './CPolygon';
import CRect from './CRect';

export default class DrawService {
  canvasWidth = 0;
  canvasHeight = 0;
  drawingWidth = 0;
  drawingHeight = 0;
  limitWidth = 0;
  limitHeight = 0;
  limitX0 = 0;
  limitY0 = 0;
  context = null;
  applyOffset(pts) {
    for (let i = 0, n = pts.length; i < n; i++) {
      if (pts[i] !== null && typeof pts[i] === 'object') {
        pts[i][0] += this.limitX0;
        pts[i][1] += this.limitY0;
      }
    }
  }
  /**drawings*/
  /**
   *
   * @param {type} objects
   * @returns {boolean}
   */
  drawObjectsWithOffset(objects, rel, context, offSetX, offSetY) {
    if (objects === null) {
      return false;
    }
    for (let i = 0, n = objects.length; i < n; i++) {
      if (context === null || typeof context !== 'object') {
        this.drawOneObject(objects[i], rel, offSetX, offSetY);
      } else {
        this.drawOneObject(objects[i], rel, offSetX, offSetY, context);
      }
    }
    return true;
  }
  drawObjectsOnLimitedCanvas(objects, rel, context) {
    return this.drawObjectsWithOffset(
      objects,
      rel,
      context,
      this.limitX0,
      this.limitY0,
    );
  }
  drawObjects(objects, rel, context) {
    if (objects === null) {
      return false;
    }
    for (let i = 0, n = objects.length; i < n; i++) {
      if (typeof context !== 'object') {
        this.drawOneObject(objects[i], rel);
      } else {
        this.drawOneObject(objects[i], rel, null, null, context);
      }
    }
    return true;
  }
  drawFrame(sizes, color) {
    // top
    if (sizes[0] > 0) {
      this.drawOneObject(
        new CRect(0, 0, this.canvasWidth, sizes[0], color),
        false,
        0,
        0,
      );
    }
    // right
    if (sizes[1] > 0) {
      this.drawOneObject(
        new CRect(
          this.canvasWidth - sizes[1],
          0,
          sizes[1],
          this.canvasHeight,
          color,
        ),
        false,
        0,
        0,
      );
    }
    // bottom
    if (sizes[2] > 0) {
      this.drawOneObject(
        new CRect(
          0,
          this.canvasHeight - sizes[2],
          this.canvasWidth,
          sizes[2],
          color,
        ),
        false,
        0,
        0,
      );
    }
    // left
    if (sizes[3] > 0) {
      this.drawOneObject(
        new CRect(0, 0, sizes[3], this.canvasHeight, color),
        false,
        0,
        0,
      );
    }
    //
  }
  drawImage(
    img,
    callback,
    offsetX,
    offsetY,
    context,
    resizeRatio,
    centerPosition,
    autoResize,
    w,
    h,
  ) {
    if (typeof w !== 'number') {
      w = this.drawingWidth;
    }
    if (typeof h !== 'number') {
      h = this.drawingHeight;
    }
    if (typeof offsetX !== 'number') {
      offsetX = this.offsetX;
    }
    if (typeof offsetY !== 'number') {
      offsetY = this.offsetY;
    }

    if (context) {
      return img.displayWithCallBack(
        context,
        [offsetX, offsetY],
        callback,
        resizeRatio,
        w,
        h,
        centerPosition,
        autoResize,
      );
    }

    return img.displayWithCallBack(
      this.context,
      [offsetX, offsetY],
      callback,
      resizeRatio,
      w,
      h,
      centerPosition,
      autoResize,
    );
  }
  /**
   *
   * @param {type} o
   * @param {type} rel
   * @returns {boolean}
   */
  drawOneObject(o, rel, offsetX, offsetY, context) {
    if (o === null || typeof o !== 'object') {
      return false;
    }
    if (typeof offsetX !== 'number') {
      offsetX = this.limitX0;
    }
    if (typeof offsetY !== 'number') {
      offsetY = this.limitY0;
    }
    if (rel === true) {
      o.resizeShape(this.limitWidth, this.limitHeight);
    }
    o.roundValues(0);
    if (context) {
      o.display(context, [offsetX, offsetY]);
      return true;
    }

    if (!this.context) {
      return false;
    }

    o.display(this.context, [offsetX, offsetY]);
    return true;
  }
  drawPoint(pt, color, size) {
    if (pt === null) {
      return false;
    }
    return new CRect(pt[0], pt[1], size, size, color, color).display(
      this.context,
      [0, 0],
    );
  }
  drawPoints(pts, color, size) {
    if (pts) {
      return new CRect().displayPoints(
        this.context,
        pts,
        [this.limitX0, this.limitY0],
        color,
        size,
        this.canvasWidth,
        this.canvasHeight,
      );
    }
    return false;
  }
  drawRect(pt1, pt2, fillColor, strokeColor, size) {
    if (pt1 !== null) {
      return new CRect(
        pt1[0],
        pt1[1],
        pt2[0] - pt1[0],
        pt2[1] - pt1[1],
        fillColor,
        strokeColor,
        size,
      ).display(this.context, [0, 0]);
    }
    return false;
  }
  drawBackgroundWithGradient(color, gradientType, gradientColors) {
    const r = new CRect(0, 0, this.canvasWidth, this.canvasHeight, color);
    r.setGradientType(gradientType);
    r.setGradientBackground(gradientColors);
    this.drawOneObject(r, false, 0, 0);
  }
  drawBlackBackground() {
    return this.drawOneObject(
      new CRect(0, 0, this.canvasWidth, this.canvasHeight, [0, 0, 0]),
      false,
      0,
      0,
    );
  }
  drawBackground(color, colorB, lineWidth) {
    if (colorB) {
      return this.drawOneObject(
        new CRect(
          0,
          0,
          this.canvasWidth,
          this.canvasHeight,
          color,
          colorB,
          lineWidth,
        ),
        false,
        0,
        0,
      );
    } else if (color) {
      return this.drawOneObject(
        new CRect(0, 0, this.canvasWidth, this.canvasHeight, color),
        false,
        0,
        0,
      );
    }
    return false;
  }
  drawImageBackground(img) {
    if (img && img !== '') {
      const background = new Image();
      background.src = img;
      background.onload = () => {
        const ptrn = this.context.createPattern(background, 'repeat');
        this.context.fillStyle = ptrn;
        this.context.fillRect(0, 0, this.drawingWidth, this.drawingHeight);
      };
    }
  }
  drawLine(pt1, pt2, color, w, lineJoin) {
    if (typeof lineJoin !== 'string') {
      lineJoin = '';
    }
    this.drawOneObject(
      new CLine(pt1[0], pt1[1], pt2[0], pt2[1], color, w).setLineJoin(lineJoin),
    );
  }
  drawPolygon(pts, w, fillColor, strokeColor, p) {
    if (pts === null) {
      return false;
    }
    if (typeof pts !== 'object') {
      return false;
    }
    if (pts.length === 0) {
      return false;
    }
    if (
      fillColor === null &&
      pts[1][3] !== null &&
      typeof pts[1][3] === 'object'
    ) {
      fillColor = pts[1][3];
    }
    if (typeof p !== 'object') {
      p = new CPolygon();
      p.setLineWidth(w);
      p.setFillColor(fillColor);
      if (strokeColor !== null) {
        p.setStrokeColor(strokeColor);
      }
    }
    p.setPoints(pts);
    this.drawOneObject(p);
    return true;
  }
  drawPath(pts, w, color, l) {
    if (pts === null) {
      return false;
    }
    if (typeof pts !== 'object') {
      return false;
    }
    if (pts.length === 0) {
      return false;
    }
    if (color === null && typeof pts[1][3] === 'object' && pts[1][3] !== null) {
      color = pts[1][3];
    }

    if (typeof l !== 'object') {
      l = new CLine(0, 0, 0, 0);
      l.setLineWidth(w);
      l.setStrokeColor(color);
    }
    l.setPts(pts);
    this.drawOneObject(l);
    return true;
  }
  drawMultiColorsPath(pts, w, color, l) {
    if (pts === null || typeof pts !== 'object') {
      return false;
    }

    if (typeof l !== 'object') {
      l = new CLine();
      l.setLineWidth(w);
      l.setStrokeColor(color);
    }

    for (let i = 0, n = pts.length - 1; i < n; i++) {
      if (
        typeof pts[i] === 'object' &&
        typeof pts[i + 1] === 'object' &&
        pts[i] !== null &&
        pts[i + 1] !== null
      ) {
        if (typeof pts[i][3] === 'object') {
          l.setStrokeColor(pts[i][3]);
        }
        l.setTwoPoints(pts[i], pts[i + 1], false);
        this.drawOneObject(l);
      }
    }
    return true;
  }
  rotatePoints(cx, cy, pts, a) {
    if (a === 0 || a % (2 * Math.PI) === 0) {
      return pts;
    }
    if (pts === null) {
      return false;
    }
    for (let i = 0, n = pts.length; i < n; i++) {
      pts[i] = this.rotatePoint(cx, cy, a, pts[i]);
    }
    return pts;
  }
  rotatePoint(cx, cy, angle, pt) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    // translate point back to origin:
    pt[0] -= cx;
    pt[1] -= cy;

    // rotate point
    const xnew = pt[0] * c - pt[1] * s;
    const ynew = pt[0] * s + pt[1] * c;

    // translate point back:
    pt[0] = xnew + cx;
    pt[1] = ynew + cy;
    return pt;
  }
  translatePoints(pts, v) {
    if (pts === null) {
      return false;
    }
    for (let i = 0, n = pts.length; i < n; i++) {
      pts[i] = this.translatePoint(pts[i], v);
    }
    return pts;
  }
  translatePoint(pt, v) {
    pt[0] = pt[0] + v[0];
    pt[1] = pt[1] + v[1];
    return pt;
  }
}
