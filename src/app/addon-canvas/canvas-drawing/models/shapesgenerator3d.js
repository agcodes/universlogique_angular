import {
	Group,
	Vector3,
  Euler,
  DoubleSide,
  PlaneGeometry,
	Mesh,
	MeshBasicMaterial
} from 'three';

export default class ShapesGenerator3d {
  width = 0;
  height = 0;

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
  getVector3(x, y, z) {
    return new Vector3(x, y, z);
  }
  getEuler(x, y, z) {
    return new Euler(x, y, z);
  }
  createColorMaterial(color) {
    return new MeshBasicMaterial({ color, side: DoubleSide });
  }
  getGroup() {
    return new Group();
  }
  createSquare(x, y, z, color, rotation) {
    const square = new Mesh(
      new PlaneGeometry(1, 1),
      this.createColorMaterial(color),
    );
    square.position.set(x, y, z);
    square.rotation.set(rotation.x, rotation.y, rotation.z);
    return square;
  }
  createColorMaterial(color) {
    return new MeshBasicMaterial({ color, side: DoubleSide });
  }
  getPoint(pt, colors, size, rel) {
    return null;
  }
  getRandomTriangle(c1, angle, maxRandom, cDeltaAngle) {
    return p;
  }
  getFitCube2() {
    return shapes;
  }
  getFitEllipse(p, q, strokeColor, fillColor) {
    return null;
  }
  getFitCircle(p, strokeColor, fillColor, lineWidth) {
    return null;
  }
  getFitPolygon(nb, size, a, regular) {
    return this.getPolygonFromCircle(c, a, nb, regular);
  }
  getPolygonFromCircle(c, a, nb, regular) {}
  getFitCube(m, size, bHiddenFace) {
    return squares;
  }
}
