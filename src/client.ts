import { URL } from 'url';
import { User, Ban, ErrorResponse, Response, SuccessResponse } from './types';
import fetch from 'node-fetch';

interface RequestData {
    [key: string]: string | number | undefined;
}

export default class Client {
    private _host: URL;

    apiKey: string;

    /**
     * @param apiKey Your SpamBlockers API key
     * @param host The host of the SpamBlockers API
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

    private async makeRequest<T>(method: 'GET', path: string): Promise<SuccessResponse<T>['result']>;
    private async makeRequest<T>(
        method: 'POST',
        path: string,
        data: RequestData,
    ): Promise<SuccessResponse<T>['result']>;
    private async makeRequest<T>(
        method: 'GET' | 'POST',
        path: string,
        data?: RequestData,
    ): Promise<SuccessResponse<T>['result']> {
        const url = new URL(path, this._host).toString();
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: data ? JSON.stringify(data) : null,
        });

        const json = await response.json();
        return this.handleResponse(json as Response<T>);
    }

    /**
     * Get a ban by ID
     * @param userID The users Telegram ID
     */
    getBan(userID: number): Promise<Ban> {
        return this.makeRequest('GET', `bans/${userID}`);
    }

    /**
     * Get a list of all bans
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
     * @param userID The users Telegram ID
     * @param reason The reason the user is being banned
     */
    addBan(userID: number, reason?: string): Promise<Ban> {
        return this.makeRequest('POST', 'bans', {
            userID,
            reason,
        });
    }

    /**
     * Get a list of all users
     * @param userID The users Telegram ID
     */
    getUser(userID: number): Promise<User> {
        return this.makeRequest('GET', `users/${userID}`);
    }

    /**
     * Get a list of all users
     */
    getUsers(): Promise<User[]> {
        return this.makeRequest('GET', 'users');
    }

    /**
     * Create a new user
     * @param userID The users Telegram ID
     * @param permission The permission level of the user
     */
    createUser(userID: number, permission: 'admin' | 'user' = 'user'): Promise<User> {
        return this.makeRequest('POST', 'users', {
            userID,
            permission,
        });
    }
}
