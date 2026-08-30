import CShape from './CShape';

export default class CText extends CShape {
  constructor(x_, y_, width_, height_, strokeColor_, text_) {
    super(x_, y_, width_, height_, null, strokeColor_, text_);
    this.text = text_;
    this.font = 'Arial';
  }
  setFont(font_) {
    this.font = font_;
  }
  getText() {
    return this.text;
  }
  resizeShape(w, h) {
    if (typeof w === 'number' && typeof h === 'number') {
      this.setXY(this.getX() * w, this.getY() * h);
      this.initialPosition[0] = this.initialPosition[0] * w;
      this.initialPosition[1] = this.initialPosition[1] * h;
    }
  }
  display(context, offSet) {
    context.beginPath();
    context.strokeStyle = null;
    if (this.strokeColor) {
      context.fillStyle = `rgb(${this.strokeColor[0]},${this.strokeColor[1]},${this.strokeColor[2]})`;
    }
    context.font = `${this.height}px ${this.font}`;
    context.fillText(
      this.text,
      this.position[0] + offSet[0],
      this.position[1] + offSet[1],
    );
    context.fill();
    context.stroke();
  }
}
