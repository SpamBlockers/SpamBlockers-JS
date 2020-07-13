import { URL } from 'url';
import { User, Ban, ErrorResponse, Response, SuccessResponse } from './types';
import fetch from 'node-fetch';

interface RequestData {
    [key: string]: string | number | undefined;
}

interface RequestSearchParams {
    [key: string]: string;
}

export default class Client {
    private _host: URL;

    apiKey: string;

    /**
     * @param {String} apiKey Your SpamBlockers API key
     * @param {String} [host='https://spamblockers.lungers.com'] The host of the SpamBlockers API
     */
    constructor(apiKey: string, host = 'https://spamblockers.lungers.com') {
        this.apiKey = apiKey;
        this._host = new URL('api/v1/', host);
    }

    get host(): string {
        return this._host.toString();
    }

    set host(host: string) {
        this._host = new URL('api/v1/', host);
    }

    private handleResponse<T>(response: Response<T>): SuccessResponse<T>['result'] {
        if (response.ok) {
            return response.result;
        }

        throw new Error(response.message);
    }

    private async makeRequest<T>(
        method: 'GET',
        path: string,
        queryParams?: RequestSearchParams,
    ): Promise<SuccessResponse<T>['result']>;
    private async makeRequest<T>(
        method: 'POST',
        path: string,
        data: RequestData,
    ): Promise<SuccessResponse<T>['result']>;
    private async makeRequest<T>(
        method: 'GET' | 'POST',
        path: string,
        data?: RequestData | RequestSearchParams,
    ): Promise<SuccessResponse<T>['result']> {
        const url = new URL(path, this._host);
        if (method === 'GET' && data) {
            const entries = Object.entries(data as RequestSearchParams);
            url.search = new URLSearchParams(entries).toString();
        }

        const response = await fetch(url.toString(), {
            method,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: method === 'POST' && data ? JSON.stringify(data) : null,
        });

        const json = await response.json();
        return this.handleResponse(json as Response<T>);
    }

    /**
     * Get a ban by ID
     * @param {Number} userID The users Telegram ID
     * @returns {Promise<Ban>} The ban object
     */
    getBan(userID: number): Promise<Ban> {
        return this.makeRequest('GET', `bans/${userID}`);
    }

    /**
     * Get a list of all bans
     * @returns {Promise<number[] | null>} The list of banned IDs
     */
    async getBans(): Promise<number[] | null> {
        const url = new URL('bans', this._host).toString();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                Accept: 'text/plain',
            },
        });

        if (response.status === 200) {
            const text = await response.text();
            return text.split('\n').map(Number);
        }

        const json = await response.json();
        this.handleResponse(json as ErrorResponse);

        return null;
    }

    /**
     * Add or update a ban
     * @param {Number} userID The users Telegram ID
     * @param {String} [reason] The reason the user is being banned
     * @returns {Promise<Ban>} The new ban object
     */
    addBan(userID: number, reason?: string): Promise<Ban> {
        return this.makeRequest('POST', 'bans', {
            userID,
            reason,
        });
    }

    /**
     * Get a list of all users
     * @param {Number} userID The users Telegram ID
     * @returns {Promise<User>} The user object
     */
    getUser(userID: number): Promise<User> {
        return this.makeRequest('GET', `users/${userID}`);
    }

    /**
     * Get a list of all users
     * @param {'admin' | 'user'} [permission] Filter users by admin or user
     * @returns {Promise<User[]>} The list of users
     */
    getUsers(permission?: 'admin' | 'user'): Promise<User[]> {
        return this.makeRequest('GET', 'users', permission ? { permission } : {});
    }

    /**
     * Create a new user
     * @param {Number} userID The users Telegram ID
     * @param {'admin' | 'user'} [permission='user'] The permission level of the user
     * @returns {Promise<User>} The new user object
     */
    createUser(userID: number, permission: 'admin' | 'user' = 'user'): Promise<User> {
        return this.makeRequest('POST', 'users', {
            userID,
            permission,
        });
    }
}
