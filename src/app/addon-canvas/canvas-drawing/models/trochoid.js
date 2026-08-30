import CLine from './CLine';

export default class Trochoid {
  getObjects(shaphesGenerator, d, angleLim, angle0, r1, r2, out, w) {
    if (typeof w !== 'number') {
      w = 0.025;
    }
    const objects = [];
    const r2a = r2;
    const c2 = shaphesGenerator.getFitCircle(r2 * 2);
    const c1 = shaphesGenerator.getFitCircle(r1 * 2);
    let x = 0;
    let y = 0;

    const c3 = shaphesGenerator.getFitCircle(
      out === true ? (r1 + r2) * 2 : (r1 - r2) * 2,
    );

    // 2*Math.PI => 360
    angle0 = (angle0 * (2 * Math.PI)) / 360;
    angleLim = (angleLim * (2 * Math.PI)) / 360;

    r1 = c1.getWidth() / 2;
    r2 = c2.getWidth() / 2;

    const x0 = c1.getXCenter();
    const y0 = c1.getYCenter();

    d = (d * r2) / r2a;

    let angle = angle0;
    let pt2 = null;

    objects.pts = [];
    objects.ptsC = [];
    objects.lines = [];

    while (angle < angleLim + 0.1 + angle0) {
      if (out === true) {
        x =
          (r1 + r2) * Math.cos(angle) -
          d * Math.cos(((r1 + r2) / r2) * angle) +
          x0;
        y =
          (r1 + r2) * Math.sin(angle) -
          d * Math.sin(((r1 + r2) / r2) * angle) +
          y0;
      } else {
        x =
          (r1 - r2) * Math.cos(angle) +
          d * Math.cos(((r1 - r2) / r2) * angle) +
          x0;
        y =
          (r1 - r2) * Math.sin(angle) -
          d * Math.sin(((r1 - r2) / r2) * angle) +
          y0;
      }

      const pt1 = [x, y];
      if (pt2) {
        objects.lines.push(new CLine(0, 0, 0, 0, null, 1, pt1, pt2));
      }
      pt2 = pt1;
      objects.pts.push([pt2[0], pt2[1]]);

      objects.ptsC.push(c3.getPointOnCircle(angle));
      angle += w;
    }

    objects.c1 = c1;
    objects.c2 = c2;
    objects.c3 = c3;
    return objects;
  }
}
