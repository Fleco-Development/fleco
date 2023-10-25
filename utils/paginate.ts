export interface PaginatedResult<T> {
    totalPages: number;
    totalItems: number;
    pages: T[][];
}

export function paginateArray<T>(items: T[], itemsPerPage: number): PaginatedResult<T> {
	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const pages: T[][] = [];

	for (let i = 0; i < totalPages; i++) {
		const startIndex = i * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedItems = items.slice(startIndex, endIndex);
		pages.push(paginatedItems);
	}

	return {
		totalPages,
		totalItems,
		pages,
	};
}