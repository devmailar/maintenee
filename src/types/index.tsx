export interface IMaintenanceResponseBody {
	enabled: boolean;
}

export interface IWhitelist {
	ip: string;
	created_at: Date;
}

export interface IResponseError {
	message: string;
	error: string;
	statusCode: number;
}
