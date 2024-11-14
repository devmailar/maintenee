export interface IWhitelist {
	ip: string;
	created_at: Date;
}

export interface IMaintenance {
	enabled: boolean;
}

export interface IResponseError {
	message: string;
	error: string;
	statusCode: number;
}
