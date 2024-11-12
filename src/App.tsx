import { Lock, Power, ShieldAlert, Trash2 } from "lucide-react";
import React, { type ChangeEvent, type FormEvent, type ReactNode, useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { IMaintenanceResponseBody, IResponseError, IWhitelist } from "./types";

const App = (): ReactNode => {
	const [underMaintenance, setUnderMaintenance] = useState<boolean>(false);
	const [whitelist, setWhitelist] = useState<IWhitelist[]>([]);
	const [newToWhitelistIP, setNewToWhitelistIP] = useState<string>("");
	const [userIP, setUserIP] = useState<string>("");

	const handleGetIP = useCallback(async (): Promise<void> => {
		try {
			const getIpResponse = await fetch("https://api.ipify.org/?format=json", {
				method: "GET",
			});

			if (!getIpResponse.ok) {
				const getIpResponseError: IResponseError = await getIpResponse.json();

				throw new Error(getIpResponseError.message);
			}

			const getIpResponseBody: { ip: string } = await getIpResponse.json();

			setUserIP(getIpResponseBody.ip);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				throw new Error(error.message);
			}
		}
	}, []);

	const handleGetMaintenance = useCallback(async (): Promise<void> => {
		try {
			const getMaintenanceResponse: Response = await fetch("http://localhost:3000/api/maintenance/status", {
				method: "GET",
			});

			if (!getMaintenanceResponse.ok) {
				const getMaintenanceResponseError: IResponseError = await getMaintenanceResponse.json();

				throw new Error(getMaintenanceResponseError.message);
			}

			const getMaintenanceResponseBody: IMaintenanceResponseBody = await getMaintenanceResponse.json();
			setUnderMaintenance(getMaintenanceResponseBody.enabled);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				throw new Error(error.message);
			}
		}
	}, []);

	const handleGetWhitelist = useCallback(async (): Promise<void> => {
		try {
			const getWhitelistResponse: Response = await fetch("http://localhost:3000/api/maintenance/whitelist", {
				method: "GET",
			});

			if (!getWhitelistResponse.ok) {
				const getWhitelistResponseError: IResponseError = await getWhitelistResponse.json();

				throw new Error(getWhitelistResponseError.message);
			}

			const getWhitelistResponseBody = await getWhitelistResponse.json();
			setWhitelist(getWhitelistResponseBody);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				throw new Error(error.message);
			}
		}
	}, []);

	const handleToggleMaintenance = async (): Promise<void> => {
		try {
			const toggleMaintenanceResponse: Response = await fetch("http://localhost:3000/api/maintenance/toggle", {
				method: "POST",
			});

			if (!toggleMaintenanceResponse.ok) {
				const toggleMaintenanceResponseError: IResponseError = await toggleMaintenanceResponse.json();

				throw new Error(toggleMaintenanceResponseError.message);
			}

			const toggleMaintenanceResponseBody: IMaintenanceResponseBody = await toggleMaintenanceResponse.json();
			setUnderMaintenance(toggleMaintenanceResponseBody.enabled);

			toast.success(`Maintenance ${toggleMaintenanceResponseBody.enabled ? "Enabled" : "Disabled"}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				throw new Error(error.message);
			}
		}
	};

	const handleAddWhitelist = async (): Promise<void> => {
		try {
			const addWhitelistResponse: Response = await fetch("http://localhost:3000/api/maintenance/whitelist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ip: newToWhitelistIP }),
			});

			if (!addWhitelistResponse.ok) {
				const addWhitelistResponseError: IResponseError = await addWhitelistResponse.json();

				throw new Error(addWhitelistResponseError.message);
			}

			handleGetWhitelist();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				throw new Error(error.message);
			}
		}
	};

	const handleRemoveWhitelist = async (ip: string): Promise<void> => {
		try {
			const removeWhitelistResponse: Response = await fetch(`http://localhost:3000/api/maintenance/whitelist/${ip}`, {
				method: "DELETE",
			});

			if (!removeWhitelistResponse.ok) {
				const removeWhitelistResponseError: IResponseError = await removeWhitelistResponse.json();

				throw new Error(removeWhitelistResponseError.message);
			}

			handleGetWhitelist();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				throw new Error(error.message);
			}
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

				<form className="flex gap-3" onSubmit={(e: FormEvent<HTMLFormElement>) => handleAddWhitelist()}>
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
