export interface SuccessResponse<T> {
    ok: true;
    result: T;
}

export interface ErrorResponse {
    ok: false;
    message: string;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;

export interface Ban {
    userID: number;
    reason: string;
    admin: string;
    createdAt: number;
    updatedAt: number;
}

export interface User {
    userID: string;
    key: string;
    permission: 'admin' | 'user';
    banned: boolean;
    createdAt: number;
    updatedAt: number;
}
