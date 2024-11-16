import { Lock, Power, ShieldAlert, Trash2 } from "lucide-react";
import React, { type ChangeEvent, type FormEvent, type ReactNode, useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { IMaintenance, IWhitelist } from "./types";
import { localHttp } from "./utils";

const App = (): ReactNode => {
	const [underMaintenance, setUnderMaintenance] = useState<boolean>(false);
	const [userIP, setUserIP] = useState<string>("");
	const [whitelist, setWhitelist] = useState<IWhitelist[]>([]);
	const [newToWhitelistIP, setNewToWhitelistIP] = useState<string>("");

	const handleGetIP = useCallback(async (): Promise<void> => {
		const { response, error } = await localHttp<{ ip: string }>({
			url: "https://api.ipify.org/?format=json",
			method: "GET",
		});

		if (error != null || !response) {
			toast.error(error.response.data.message);
		} else {
			setUserIP(response.data.ip);
		}
	}, []);

	const handleGetMaintenance = useCallback(async (): Promise<void> => {
		const { response, error } = await localHttp<IMaintenance>({
			url: "http://localhost:8080/maintenance/get",
			method: "GET",
		});
		if (error != null || !response) {
			toast.error(error.response.data.message);
		} else {
			setUnderMaintenance(response.data.enabled);
		}
	}, []);

	const handleGetWhitelist = useCallback(async (): Promise<void> => {
		const { response, error } = await localHttp<IWhitelist[]>({
			url: "http://localhost:8080/maintenance/whitelist/get",
			method: "GET",
		});
		if (error != null || !response) {
			toast.error(error.response.data.message);
		} else {
			setWhitelist(response.data);
		}
	}, []);

	const handleToggleMaintenance = async (): Promise<void> => {
		const { response, error } = await localHttp<IMaintenance>({
			url: "http://localhost:8080/maintenance/toggle",
			method: "POST",
		});
		if (error != null || !response) {
			toast.error(error.response.data.message);
		} else {
			setUnderMaintenance(response.data.enabled);
			toast.success(`Maintenance ${response.data.enabled ? "Enabled" : "Disabled"}`);
		}
	};

	const handleAddWhitelist = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		const { response, error } = await localHttp<IMaintenance>({
			url: "http://localhost:8080/maintenance/whitelist/create",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: { ip: newToWhitelistIP },
		});
		if (error != null || !response) {
			toast.error(error.response.data.message);
		} else {
			setNewToWhitelistIP("");
			handleGetWhitelist();
		}
	};

	const handleRemoveWhitelist = async (ip: string): Promise<void> => {
		const { response, error } = await localHttp<IMaintenance>({
			url: `http://localhost:8080/maintenance/whitelist/del/${ip}`,
			method: "DELETE",
		});
		if (error != null || !response) {
			toast.error(error.response.data.message);
		} else {
			handleGetWhitelist();
		}
	};

	useEffect((): void => {
		handleGetIP();
		handleGetMaintenance();
		handleGetWhitelist();
	}, [handleGetIP, handleGetMaintenance, handleGetWhitelist]);

	return (
		<div className="flex flex-col container max-w-6xl mx-auto px-6 py-6">
			<Toaster position="top-center" />

			<div className="flex items-center justify-between px-6 py-4 bg-slate-600">
				<h1 className="text-xl font-bold text-white">Maintenee Control Panel</h1>

				<button
					type="button"
					className={`flex items-center gap-2 btn ${underMaintenance ? "btn-outline-danger" : "btn-google"}`}
					onClick={(): Promise<void> => handleToggleMaintenance()}
				>
					<Power className="w-5 h-5" />
					<span className="text-base font-medium">{underMaintenance ? "Disable" : "Enable"} Maintenance</span>
				</button>
			</div>

			<div className="flex flex-col gap-y-3 px-6 py-6 border shadow-sm rounded-sm">
				<div className="flex gap-x-1 items-center">
					<ShieldAlert className="w-5 h-5" />
					<h2 className="text-base text-black font-bold">Current Status</h2>
				</div>

				<div className="flex gap-x-1 items-center">
					<span className="text-base text-black font-normal">Your IP:</span>
					{userIP ? (
						<span className="text-base text-black font-medium">{userIP}</span>
					) : (
						<span className="text-base text-red-500">Failed to load IP</span>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-y-3 px-6 py-6 border shadow-sm rounded-sm">
				<div className="flex gap-x-1 items-center">
					<Lock className="w-5 h-5" />
					<h2 className="text-base text-black font-bold">IP Whitelist</h2>
				</div>

				<form className="flex gap-3" onSubmit={handleAddWhitelist}>
					<input
						type="text"
						className="text-base text-black font-normal flex-1"
						value={newToWhitelistIP}
						placeholder="Enter IP address"
						onChange={(e: ChangeEvent<HTMLInputElement>) => setNewToWhitelistIP(e.target.value)}
					/>
				</form>

				<button
					type="button"
					className="btn btn-google text-sm text-white"
					disabled={!userIP}
					onClick={(): void => setNewToWhitelistIP(userIP)}
				>
					{userIP ? `Click to use your IP (${userIP})` : "Loading your IP..."}
				</button>

				{whitelist.map((whitelist: IWhitelist) => (
					<div key={whitelist.ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div>
							<p className="font-medium text-gray-900">{whitelist.ip}</p>
							<p className="text-sm text-gray-500">Added on {new Date(whitelist.created_at).toLocaleDateString()}</p>
						</div>
						<button
							type="button"
							className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
							onClick={(): Promise<void> => handleRemoveWhitelist(whitelist.ip)}
						>
							<Trash2 className="w-5 h-5" />
						</button>
					</div>
				))}
				{whitelist.length === 0 && <p className="text-center text-gray-500 py-4">No whitelisted IPs yet</p>}
			</div>
		</div>
	);
};

export default App;
