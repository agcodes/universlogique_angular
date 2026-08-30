export default class CShape {
  constructor(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth) {
    this.width = 0;
    this.height = 0;
    this.grdType = 1;
    this.touch = false;
    this.lineJoin = '';
    this.shadowBlur = 0;
    this.shadowColor = null;
    this.grdColors = null;
    this.lineDash = null;
    this.rotation = null;
    this.vector = null;
    this.vitesse = null;
    this.fillColor = null;
    this.strokeColor = null;
    this.setWidth(width_);
    this.setHeight(height_);
    this.setFillColor(fillColor_);
    this.setStrokeColor(strokeColor_);
    this.setLineWidth(_lineWidth);
    this.position = [x_, y_];
    this.x = x_;
    this.y = y_;
    this.initialPosition = [x_, y_];
    this.vector = [0, 0];
    this.vitesse = [1, 1];
    this.lineDash = [0];
    this.type = 'shape';
  }
  getType() {
    return this.type;
  }
  copySphape(o) {
    this.x = o.x;
    this.y = o.y;
    this.width = o.width;
    this.height = o.height;
    this.grdType = o.grdType;
    this.touch = o.touch;
    this.lineJoin = o.lineJoin;
    this.shadowBlur = o.shadowBlur;
    this.shadowColor = o.shadowColor;
    this.grdColors = o.grdColors;
    this.lineDash = o.lineDash;
    this.rotation = o.rotation;
    this.vector = o.vector;
    this.vitesse = o.vitesse;
    this.position = [o.position[0], o.position[1]];
    this.initialPosition = o.initialPosition;
    this.lineWidth = o.lineWidth;
    this.fillColor = o.fillColor;
    this.strokeColor = o.strokeColor;
  }
  setShadow(blur, color) {
    this.shadowBlur = blur;
    this.shadowColor = color;
  }
  setLineWidth(w) {
    this.lineWidth = typeof w === 'number' ? w : 1;
  }
  getLineWidth() {
    return this.lineWidth;
  }
  setRotation(d) {
    this.rotation = typeof d === 'number' ? d : null;
  }
  setStrokeColor(s) {
    this.strokeColor = s ? s : null;
  }
  getStrokeColor() {
    return this.strokeColor;
  }
  setFillColor(f) {
    this.fillColor = f ? f : null;
  }
  getFillColor() {
    return this.fillColor;
  }
  setLineJoin(l) {
    this.lineJoin = l === null ? '' : l;
    return this;
  }
  setLineDash(l) {
    this.lineDash = l === null ? [0] : l;
  }
  getLineDash() {
    return this.lineDash;
  }
  setPosition(p) {
    this.x = p[0];
    this.y = p[1];
    this.position = [p[0], p[1]];
  }
  getPosition() {
    return this.position;
  }
  getInitialPosition() {
    return this.initialPosition;
  }
  setWidth(w) {
    this.width = typeof w === 'number' ? w : 0;
  }
  getWidth() {
    return this.width;
  }
  setHeight(h) {
    this.height = typeof h === 'number' ? h : 0;
  }
  getHeight() {
    return this.height;
  }
  setVector(v) {
    this.vector = v;
  }
  getVector() {
    return this.vector;
  }
  setTouch(t) {
    this.touch = t;
  }
  getTouch() {
    return this.touch;
  }
  getVectorX() {
    return this.vector[0];
  }
  getVectorY() {
    return this.vector[1];
  }
  setGradientType(n) {
    this.grdType = n;
  }
  setGradientBackground(grdColors) {
    this.grdColors = grdColors;
  }
  setX(p) {
    this.x = p;
    this.position[0] = p;
  }
  getX() {
    return this.position[0];
  }
  setY(p) {
    this.y = p;
    this.position[1] = p;
  }
  getY() {
    return this.position[1];
  }
  setXY(x, y) {
    this.position = [x, y];
  }
  getYBottom() {
    return this.position[1];
  }

  getYTop() {
    return this.position[1] + this.height;
  }

  getXCenter() {
    return this.position[0] + this.width / 2;
  }

  getYCenter() {
    return this.position[1] + this.height / 2;
  }

  getXLeft() {
    return this.position[0];
  }
  getXRight() {
    return this.position[0] + this.width;
  }
  getCenter() {
    return [this.getXCenter(), this.getYCenter()];
  }
  resizeShape(w, h) {
    if (typeof w === 'number' && typeof h === 'number') {
      this.setXY(this.getX() * w, this.getY() * h);
      this.setWidth(this.getWidth() * w);
      this.setHeight(this.getHeight() * h);
      this.initialPosition[0] = this.initialPosition[0] * w;
      this.initialPosition[1] = this.initialPosition[1] * h;
    }
  }
  roundVal(v, d) {
    if (typeof d !== 'number') {
      d = 7;
    }
    if (d === 0) {
      return Math.round(v);
    }
    return Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
  }
  roundValPrec(v, d) {
    if (typeof d !== 'number') {
      d = 16;
    }
    return parseFloat(v.toPrecision(d));
  }
  translation(v) {
    if (
      this.position !== null &&
      typeof this.position === 'object' &&
      v &&
      typeof v === 'object'
    ) {
      this.position[0] = this.position[0] + v[0];
      this.position[1] = this.position[1] + v[1];
    }
  }
  roundValues(d) {
    this.height = this.roundVal(this.height, d);
    this.width = this.roundVal(this.width, d);

    this.x = this.roundVal(this.x, d);
    this.y = this.roundVal(this.y, d);

    if (this.position !== null && typeof this.position === 'object') {
      this.position[0] = this.roundVal(this.position[0], d);
      this.position[1] = this.roundVal(this.position[1], d);
    }

    if (
      this.initialPosition !== null &&
      typeof this.initialPosition === 'object'
    ) {
      this.initialPosition[0] = this.roundVal(this.initialPosition[0], d);
      this.initialPosition[1] = this.roundVal(this.initialPosition[1], d);
    }

    if (this.vector !== null && typeof this.vector === 'object') {
      this.vector[0] = this.roundVal(this.vector[0], d);
      this.vector[1] = this.roundVal(this.vector[1], d);
    }
  }
  addVector(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
  }
  defVector(pt1, pt2) {
    return [pt2[0] - pt1[0], pt2[1] - pt1[1]];
  }
  applyVector(pt, v) {
    return [pt[0] + v[0], pt[1] + v[1]];
  }
  getColor(color) {
    if (color) {
      if (color.length === 1) {
        // name
        return color[0];
      }
      if (color.length === 3) {
        // RGB
        for (let index = 0; index < 3; index++) {
          if (color[index] > 255) {
            color[index] = 255;
          }
        }
        return `rgb(${color[0]},${color[1]},${color[2]})`;
      }
      if (color.length === 4) {
        // RGBA
        return (
          `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`
        );
      }
    } else {
      // transparent
      return 'transparent';
    }
  }
  defStyle(context) {
    context.lineWidth = this.lineWidth;

    if (this.lineJoin !== '') {
      // the shape used to join two line segments where they meet.
      context.lineJoin = this.lineJoin;
    }

    if (this.lineDash && typeof context.setLineDash === 'function') {
      context.setLineDash(this.lineDash);
    } else {
      context.setLineDash([]);
    }

    context.strokeStyle = this.getColor(this.strokeColor);
    context.fillStyle = this.getColor(this.fillColor);

    if (this.grdColors) {
      // gradient
      let grd = null;
      if (typeof context.createLinearGradient === 'function') {
        if (this.grdType === 1) {
          grd = context.createLinearGradient(
            this.position[0],
            this.position[1],
            this.position[0] + this.width,
            this.position[1] + this.height,
          );
        } else {
          grd = context.createLinearGradient(
            this.position[0],
            this.position[1],
            this.position[0] + this.width,
            this.position[1],
          );
        }
      } else if (typeof context.createRadialGradient === 'function') {
        grd = context.createRadialGradient(
          this.getXCenter(),
          this.getYCenter(),
          100,
          this.getXCenter(),
          this.getYCenter(),
          0,
        );
      }

      if (grd) {
        for (let j = 0; j < this.grdColors.length; j++) {
          if (this.grdColors[j].length === 3) {
            grd.addColorStop(
              j,
              `rgb(${this.grdColors[j][0]},${this.grdColors[j][1]},${this.grdColors[j][2]})`,
            );
          } else {
            grd.addColorStop(j, this.grdColors[j]);
          }
        }
        context.fillStyle = grd;
      }
    }

    if (this.shadowBlur === 0) {
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
    } else {
      // shadow
      if (this.shadowColor !== null && typeof this.shadowColor === 'object') {
        if (this.shadowColor.length === 3) {
          context.shadowColor =
            `rgb(${this.shadowColor[0]},${this.shadowColor[1]},${this.shadowColor[2]})`;
        }
      } else {
        context.shadowColor = this.shadowColor;
      }

      context.shadowBlur = this.shadowBlur;
    }
    return null;
  }
}
