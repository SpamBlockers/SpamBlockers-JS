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
    /** The users Telegram ID */
    userID: number;
    /** The reason the user was banned */
    reason: string;
    /** The Telegram ID of the admin who banned the user */
    admin: number;
    /** The date the user was first banned */
    createdAt: number;
    /** The date when the users ban was updated */
    updatedAt: number;
}

export interface User {
    /** The users Telegram ID */
    userID: string;
    /** The API key of the user */
    key: string;
    /** The permission level of the user */
    permission: 'admin' | 'user';
    /** Whether the user is banned or not */
    banned: boolean;
    /** The date the user was created */
    createdAt: number;
    /** The date the user ban updated */
    updatedAt: number;
}
