export default class Vector {
	constructor(size, fillValue) {
		this.size = size;
		this.data = new Array(size).fill(fillValue);
	}
	fill(fillValue) {
		this.data = new Array(this.size).fill(fillValue);
	}
	setElement(index, value) {
		this.data[index] = value;
	}
	getElement(index) {
		return this.data[index];
	}
	copy(){
		const v = new Vector(this.size, 0);
		for (let j = 0; j < this.data.length; j++) {
			v.setElement(j, this.getElement(j));
		}
		return v;
	}
}