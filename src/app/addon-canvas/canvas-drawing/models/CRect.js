import CShape from './CShape';
import CLine from './CLine';
import CPolygon from './CPolygon';

export default class CRect extends CShape {
  constructor(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth) {
    super(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth);
    this.defPoints();
  }

  display(context, offSet) {
    if (offSet === null || typeof offSet !== 'object') {
      offSet = [0, 0];
    }
    this.roundValues();
    context.beginPath();
    this.defStyle(context);
    context.rect(
      this.position[0] + offSet[0],
      this.position[1] + offSet[1],
      this.width,
      this.height,
    );
    context.fill();
    context.stroke();
    return true;
  }
  displayPoints(context, pts, offSet, color, size, w, h) {
    if (context === null) {
      return false;
    }
    if (pts === null) {
      return false;
    }
    let d = 0;
    let x = 0;
    let y = 0;

    if (size >= 2) {
      d = size / 2;
      if (d % 2 !== 0) {
        d++;
      }
    }
    if (d % 2 !== 0) {
      size++;
    }

    context.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (pts[i]) {
        x = pts[i][0] + offSet[0] - d;
        y = pts[i][1] + offSet[1] - d;
        if (x > 0 && y > 0 && x < w && y < h) {
          if (color === null) {
            context.beginPath();
          }
          context.lineWidth = size; // 2*2

          context.strokeStyle = this.getColor(pts[i][3] ? pts[i][3] : color);
          context.rect(x, y, 1, 1); // 2
          if (color === null) {
            context.stroke();
          }
        }
      }
    }
    context.stroke();
    return true;
  }
  get3DEffectShapes(v, color1, color2) {
    const shapes = [];
    shapes.push(
      new CPolygon(
        [
          [this.getX() + this.getWidth(), this.getY()],
          [this.getX() + this.getWidth() + v[0], this.getY() + v[1]],
          [
            this.getX() + this.getWidth() + v[0],
            this.getY() + this.getHeight() + v[1],
          ],
          [this.getX() + this.getWidth(), this.getY() + this.getHeight()],
        ],
        color1,
        null,
        '',
        0,
      ),
    );

    shapes.push(
      new CPolygon(
        [
          [this.getX(), this.getY() + this.getHeight()],
          [this.getX() + this.getWidth(), this.getY() + this.getHeight()],
          [
            this.getX() + this.getWidth() + v[0],
            this.getY() + this.getHeight() + v[1],
          ],
          [this.getX() + v[0], this.getY() + this.getHeight() + v[1]],
        ],
        color2,
        null,
        '',
        0,
      ),
    );
    return shapes;
  }
  defPoints() {
    this.points = [];
    this.points[0] = [this.getXLeft(), this.getYBottom()];
    this.points[1] = [this.getXRight(), this.getYBottom()];
    this.points[2] = [this.getXRight(), this.getYTop()];
    this.points[3] = [this.getXLeft(), this.getYTop()];
  }
  getLines() {
    return this.lines;
  }
  setPointI(pt, i) {
    if (i === 0) {
      this.position[0] = pt[0];
      this.position[1] = pt[1];
    }
    this.points[i] = pt;
  }
  getPoints() {
    return this.points;
  }
  defLines() {
    this.lines = [];
    if (this.points) {
      for (let i = 0; i < this.points.length; i++) {
        let j = i + 1 === this.points.length ? 0 : i + 1;
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
  }
}
