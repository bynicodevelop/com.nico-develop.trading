export const subtractTimeFromDate = (
	date: Date,
	seconds = 0,
	minutes = 0,
	hours = 0,
	days = 0
): Date => {
	const subtractedDate = new Date(date.getTime());
	subtractedDate.setSeconds(subtractedDate.getSeconds() - seconds);
	subtractedDate.setMinutes(subtractedDate.getMinutes() - minutes);
	subtractedDate.setHours(subtractedDate.getHours() - hours);
	subtractedDate.setDate(subtractedDate.getDate() - days);
	subtractedDate.setMilliseconds(0);

	return subtractedDate;
};

export const roundToMinutes = (date: Date): Date => {
	const roundedDate = new Date(date.getTime());
	roundedDate.setSeconds(0);
	roundedDate.setMilliseconds(0);

	return roundedDate;
};
