import { roundToMinutes, subtractTimeFromDate } from './datetime';

describe('subtractTimeFromDate', () => {
	it('should subtract seconds from a date', () => {
		const date = new Date(2023, 3, 20, 10, 30, 0);
		const subtractedDate = subtractTimeFromDate(date, 30);
		expect(subtractedDate).toEqual(new Date(2023, 3, 20, 10, 29, 30));
	});

	it('should subtract minutes from a date', () => {
		const date = new Date(2023, 3, 20, 10, 30, 0);
		const subtractedDate = subtractTimeFromDate(date, 0, 30);
		expect(subtractedDate).toEqual(new Date(2023, 3, 20, 10, 0, 0));
	});

	it('should subtract hours from a date', () => {
		const date = new Date(2023, 3, 20, 10, 30, 0);
		const subtractedDate = subtractTimeFromDate(date, 0, 0, 2);
		expect(subtractedDate).toEqual(new Date(2023, 3, 20, 8, 30, 0));
	});

	it('should subtract days from a date', () => {
		const date = new Date(2023, 3, 20, 10, 30, 0);
		const subtractedDate = subtractTimeFromDate(date, 0, 0, 0, 2);
		expect(subtractedDate).toEqual(new Date(2023, 3, 18, 10, 30, 0));
	});

	it('should set seconds and milliseconds to 0', () => {
		const date = new Date(2023, 3, 20, 10, 30, 15, 500);
		const subtractedDate = subtractTimeFromDate(date, 15);
		expect(subtractedDate).toEqual(new Date(2023, 3, 20, 10, 30, 0, 0));
	});
});

describe('roundToMinutes', () => {
	it('should round seconds and milliseconds to 0', () => {
		const date = new Date(2023, 3, 20, 10, 30, 15, 500);
		const roundedDate = roundToMinutes(date);
		expect(roundedDate).toEqual(new Date(2023, 3, 20, 10, 30, 0, 0));
	});
});
