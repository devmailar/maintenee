import axios, { type AxiosRequestConfig } from "axios";

const localAxios = axios.create({
	headers: {
		"Content-Type": "application/json; charset=UTF-8",
	},
});

export async function localHttp<T>(config: AxiosRequestConfig) {
	try {
		const response = await localAxios<T>(config);
		return { response, error: null };
	} catch (error) {
		return { response: null, error };
	}
}
