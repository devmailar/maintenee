import { Plus, Power, Construction, ShieldAlert, Trash2 } from "lucide-react";
import React, { type FormEvent, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface WhitelistedIP {
	ip: string;
	created_at: string;
}

function App() {
	const [maintenanceMode, setMaintenanceMode] = useState(false);
	const [whitelistedIPs, setWhitelistedIPs] = useState<WhitelistedIP[]>([]);
	const [newIP, setNewIP] = useState("");
	const [currentIP, setCurrentIP] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initializeData = async () => {
			try {
				setIsLoading(true);
				await Promise.all([fetchStatus(), fetchWhitelistedIPs(), fetchCurrentIP()]);
			} catch (error) {
				toast.error("Failed to load initial data");
			} finally {
				setIsLoading(false);
			}
		};

		initializeData();
	}, []);

	const fetchStatus = async () => {
		const response = await fetch("http://localhost:3000/api/maintenance/status");
		const data = await response.json();
		setMaintenanceMode(data.enabled);
	};

	const fetchWhitelistedIPs = async () => {
		const response = await fetch("http://localhost:3000/api/maintenance/whitelist");
		const data = await response.json();
		setWhitelistedIPs(data);
	};

	const fetchCurrentIP = async () => {
		try {
			const response = await fetch("https://api.ipify.org/?format=json");
			if (!response.ok) throw new Error("Failed to fetch IP");
			const data = await response.json();
			setCurrentIP(data.ip);
		} catch (error) {
			console.error("Error fetching IP:", error);
			setCurrentIP(null);
			toast.error("Failed to fetch your IP address");
		}
	};

	const toggleMaintenanceMode = async () => {
		try {
			const response = await fetch("http://localhost:3000/api/maintenance/toggle", {
				method: "POST",
			});
			const data = await response.json();
			setMaintenanceMode(data.enabled);
			toast.success(`Maintenance mode ${data.enabled ? "enabled" : "disabled"}`);
		} catch (error) {
			toast.error("Failed to toggle maintenance mode");
		}
	};

	const addWhitelistedIP = async (e: FormEvent) => {
		e.preventDefault();
		if (!newIP) return;

		try {
			const response = await fetch("http://localhost:3000/api/maintenance/whitelist", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ip: newIP }),
			});

			if (response.ok) {
				await fetchWhitelistedIPs();
				setNewIP("");
				toast.success("IP added to whitelist");
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to add IP");
			}
		} catch (error) {
			toast.error("Failed to add IP");
		}
	};

	const removeWhitelistedIP = async (ip: string) => {
		try {
			const response = await fetch(`http://localhost:3000/api/maintenance/whitelist/${ip}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchWhitelistedIPs();
				toast.success("IP removed from whitelist");
			} else {
				toast.error("Failed to remove IP");
			}
		} catch (error) {
			toast.error("Failed to remove IP");
		}
	};

	const useCurrentIP = () => {
		if (currentIP) {
			setNewIP(currentIP);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Toaster position="top-right" />
			<div className="max-w-4xl mx-auto p-6">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<Construction className="w-8 h-8 text-indigo-600" />
						<h1 className="text-2xl font-bold text-gray-900">MAINTENEE Control Panel</h1>
					</div>
					<button
						type="button"
						onClick={toggleMaintenanceMode}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
							maintenanceMode
								? "bg-red-100 text-red-700 hover:bg-red-200"
								: "bg-green-100 text-green-700 hover:bg-green-200"
						}`}
					>
						<Power className="w-5 h-5" />
						{maintenanceMode ? "Disable" : "Enable"} Maintenance Mode
					</button>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
					<div className="flex items-center gap-2 mb-4">
						<ShieldAlert className="w-5 h-5 text-indigo-600" />
						<h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
					</div>
					<div className="space-y-2">
						<p className="text-gray-600">
							Maintenance Mode:
							<span className={`ml-2 font-medium ${maintenanceMode ? "text-green-600" : "text-red-600"}`}>
								{maintenanceMode ? "Active" : "Inactive"}
							</span>
						</p>
						<p className="text-gray-600">
							Your IP:{" "}
							{isLoading ? (
								<span className="ml-2 text-gray-400">Loading...</span>
							) : currentIP ? (
								<span className="ml-2 font-medium text-gray-900">{currentIP}</span>
							) : (
								<span className="ml-2 text-red-500">Failed to load IP</span>
							)}
							{!isLoading && !currentIP && (
								<button
									type="button"
									onClick={fetchCurrentIP}
									className="ml-2 text-indigo-600 hover:text-indigo-700 text-sm"
								>
									Retry
								</button>
							)}
						</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">IP Whitelist</h2>

					<div className="space-y-3">
						<form onSubmit={addWhitelistedIP} className="flex gap-3">
							<input
								type="text"
								value={newIP}
								onChange={(e) => setNewIP(e.target.value)}
								placeholder="Enter IP address"
								className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							/>
							<button
								type="submit"
								className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								<Plus className="w-5 h-5" />
								Add IP
							</button>
						</form>

						<button
							type="button"
							onClick={useCurrentIP}
							disabled={!currentIP}
							className="w-full text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed text-left"
						>
							{currentIP ? `Click to use your IP (${currentIP})` : "Loading your IP..."}
						</button>
					</div>

					<div className="mt-6 space-y-3">
						{whitelistedIPs.map((item) => (
							<div key={item.ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<p className="font-medium text-gray-900">{item.ip}</p>
									<p className="text-sm text-gray-500">Added on {new Date(item.created_at).toLocaleDateString()}</p>
								</div>
								<button
									type="button"
									onClick={() => removeWhitelistedIP(item.ip)}
									className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
								>
									<Trash2 className="w-5 h-5" />
								</button>
							</div>
						))}
						{whitelistedIPs.length === 0 && <p className="text-center text-gray-500 py-4">No whitelisted IPs yet</p>}
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
