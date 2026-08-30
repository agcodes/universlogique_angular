import CShape from './CShape';

export default class CEllipse extends CShape {
  constructor(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth) {
    super(x_, y_, width_, height_, fillColor_, strokeColor_, _lineWidth);
    this.radiusI = 0;
    this.radiusF = 2 * Math.PI;
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

  setRadius(r) {
    this.width = r;
  }
  getRadiusI() {
    return this.radiusI;
  }

  getPointOnCircle(angle) {
    return [
      this.getWidth() * Math.cos(angle) + this.getXCenter(),
      this.getHeight() * Math.sin(angle) + this.getYCenter(),
    ];
  }

  display(context, offSet) {
    context.beginPath();
    context.ellipse(
      this.getXCenter(),
      this.getYCenter(),
      this.getWidth(),
      this.getHeight(),
      0,
      this.radiusI,
      this.radiusF,
      0,
    );

    this.defStyle(context);
    context.fill();
    context.stroke();

    if (this.rotation) {
      context.rotate(this.rotation);
      context.fillRect();
    }
  }
}
