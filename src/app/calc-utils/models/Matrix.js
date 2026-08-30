export default class Matrix {
	constructor(rows, cols, fillValue) {
		this.data = Array.from({length: rows}, () => new Array(cols).fill(fillValue));
	}
}