export default class Variations {
	static sinusoidal(x) {
		const ret = new Vector(x.data.length + 1);
		for (let i = 0; i < x.data.length; i++) {
			ret.data[i] = Math.sin(x.data[i]);
		}
		ret.data[x.data.length] = 1;
		return ret;
	}

	static spherical(x) {
		const ret = new Vector(x.data.length + 1);
		let rSq = 0;
		for (let i = 0; i < x.data.length; i++) {
			rSq += x.data[i] * x.data[i];
		}

		if (rSq === 0) {
			for (let i = 0; i < x.data.length; i++) {
				ret.data[i] = x.data[i];
			}
			return ret;
		}

		for (let i = 0; i < x.data.length; i++) {
			ret.data[i] = x.data[i] / rSq;
		}
		ret.data[x.data.length] = 1;

		return ret;
	}

	static fishEye(x) {
		const ret = new Vector(x.data.length + 1);
		let r = 0;
		for (let i = 0; i < x.data.length; i++) {
			r += (x.data[i] - 0.5) * (x.data[i] - 0.5);
		}
		r = Math.sqrt(r);

		const multiplier = (2 * r) / (r + 1);
		for (let i = 0; i < x.data.length; i++) {
			ret.data[i] *= multiplier;
		}

		ret.data[x.data.length] = 1;

		return ret;
	}

	static swirl(x) {
		const ret = new Vector(3);
		const r = Math.sqrt(x.data[0] * x.data[0] + x.data[1] * x.data[1]);
		const theta = Math.atan(x.data[1] / x.data[0]);
		ret.data[0] = r * Math.cos(theta + r);
		ret.data[1] = r * Math.sin(theta + r);
		ret.data[2] = 1;
		return ret;
	}
}