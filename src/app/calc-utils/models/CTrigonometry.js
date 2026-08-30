export default class CTrigonometry {
  cos2(t) {
    return (Math.cos(2 * t) + 1) / 2;
  }
  cos3(t) {
    return (Math.cos(3 * t) + 3 * Math.cos(t)) / 4;
	}
	cos4(t) {
		return (Math.cos(4 * t) + 4 * Math.cos(2 * t) + 3) / 8;
	}
	sin2(t) {
		return (1 - Math.cos(2 * t)) / 2;
	}
  sin3(t) {
    return (-Math.sin(3 * t) + 3 * Math.sin(t)) / 4;
  }
  sin4(t) {
    return (Math.cos(4 * t) - 4 * Math.cos(2 * t) + 3) / 4;
  }
  csc(t) {
    return 1 / Math.sin(t);
  }
  sec(t) {
    return 1 / Math.cos(t);
  }
  cot(t) {
		// cos/sin
    return Math.cos(t) / Math.sin(t);
	}
	cos(t) {
		return Math.cos(t);
	}
	sin(t) {
		return Math.sin(t);
	}
  sin3cos3(t) {
    return (-Math.sin(6 * t) + 3 * Math.sin(2 * t)) / 32;
  }
}
