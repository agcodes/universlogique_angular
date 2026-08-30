export default class BitSet {
	constructor(size) {
		this.size = size;
		this.bits = new Array(Math.ceil(size / 32)).fill(0);
	}
	set(bit) {
		const index = Math.floor(bit / 32);
		const offset = bit % 32;
		this.bits[index] |= 1 << offset;
	}
	clear(bit) {
		const index = Math.floor(bit / 32);
		const offset = bit % 32;
		this.bits[index] &= ~(1 << offset);
	}
	get(bit) {
		const index = Math.floor(bit / 32);
		const offset = bit % 32;
		return (this.bits[index] & (1 << offset)) !== 0;
	}
}