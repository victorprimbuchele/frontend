export interface GenericListResponse<T> extends GenericResponse<T> {
    meta: Meta;
}

export interface GenericResponse<T> {
    data: T;
    error: string;
}

export type Meta = {
    page: number,
    limit: number,
    total: number,
    totalPages: number
}