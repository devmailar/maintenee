export interface IMaintenanceResponseBody {
	enabled: boolean;
}

export interface IResponseError {
	message: string;
	error: string;
	statusCode: number;
}
