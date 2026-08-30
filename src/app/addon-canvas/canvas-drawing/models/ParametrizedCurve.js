import {
    Curve,
    Vector3
} from 'three';

export class ParametrizedCurve extends Curve {
    constructor(scale, parametrizedFunction, normalizeFunction, args, w, h, px) {
        super();
        this.scale = scale;
        this.parametrizedFunction = parametrizedFunction;
        this.normalizeFunction = normalizeFunction;
        this.args = args;
        this.pX = px;
        this.w = w;
        this.h = h;
        if (typeof this.args == "undefined") {
            this.args = {};
        }
        if (typeof this.args.tMax == "undefined") {
            this.args.tMax = 2 * Math.PI;
        }
    }
    getPoint(t, optionalTarget = new Vector3()) {
        const pt = this.normalizeFunction(this.parametrizedFunction(t * this.args.tMax, this.args));
        return optionalTarget.set(pt[0], pt[1], pt[2]).multiplyScalar(this.scale);
    }
}