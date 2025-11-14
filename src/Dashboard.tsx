import * as React from "react";

type LookupResult = {
	// adjust these fields to match your API's response
	id?: string;
	phone?: string;
	message?: string;
	[key: string]: any;
};

/**
 * Format a MySQL DATETIME (e.g. "2025-10-11 16:30:00") into a human readable
 * string like "October 11, 2025 at 04:30 PM".
 */
function formatMySQLDatetime(input?: string | null): string {
	if (!input) return "";
	// Normalize input: replace T, strip fractional seconds and trailing timezone offsets (Z or +00:00)
	let cleaned = input.trim().replace(/T/, " ").replace(/\..+$/, "").replace(/([+-]\d{2}:?\d{2}|Z)$/, "").trim();
	const m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
	if (!m) return input; // fallback to original if it doesn't match expected pattern

	const [, y, mo, d, hh, mm, ss] = m;
	// Construct a UTC timestamp from the parsed parts
	const utcMillis = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss || "0"));
	const utcDate = new Date(utcMillis);

	// Format in Eastern Time (handles EST/EDT automatically)
	const datePart = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" }).format(utcDate);
	const timePart = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: true }).format(utcDate);

	return `${datePart} at ${timePart}`;
}

export default function Dashboard(): React.ReactElement {
	// Read master password from Vite env. If you want to set this, add
	// VITE_MASTER_PASSWORD=yourpassword to your environment at build time or
	// create a .env(.local) file with that variable. Vite exposes variables
	// prefixed with VITE_ via import.meta.env.
	const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD ?? "";
	const [authorized, setAuthorized] = React.useState<boolean>(false);
	const [passwordAttempt, setPasswordAttempt] = React.useState("");
	const [authError, setAuthError] = React.useState<string | null>(null);

	// On mount, if no master password is configured, allow access.
	React.useEffect(() => {
		if (!MASTER_PASSWORD) {
			setAuthorized(true);
			return;
		}
		// Otherwise check sessionStorage for a previous successful login
		try {
			const saved = sessionStorage.getItem("dashboard_auth_v1");
			if (saved === "1") setAuthorized(true);
		} catch (e) {
			// ignore
		}
	}, []);

	function handleAuthSubmit(e?: React.FormEvent) {
		if (e) e.preventDefault();
		setAuthError(null);
		if (passwordAttempt === MASTER_PASSWORD) {
			try {
				sessionStorage.setItem("dashboard_auth_v1", "1");
			} catch (err) {
				// ignore storage errors
			}
			setAuthorized(true);
		} else {
			setAuthError("Incorrect password");
		}
	}

	const [phone, setPhone] = React.useState("");
	const [result, setResult] = React.useState<LookupResult | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	// Shipment file lookup states
	const [shipmentEmail, setShipmentEmail] = React.useState("");
	const [shipmentResult, setShipmentResult] = React.useState<any | null>(null);
	const [shipmentLoading, setShipmentLoading] = React.useState(false);
	const [shipmentError, setShipmentError] = React.useState<string | null>(null);

	async function handleSubmit(e?: React.FormEvent) {
		if (e) e.preventDefault();
		setError(null);
		setResult(null);
		if (!phone) {
			setError("Please enter a phone number");
			return;
		}

		setLoading(true);
		try {
			const encoded = encodeURIComponent(phone);
			const res = await fetch(`https://offline-dc-twilio-5f937b734ab9.herokuapp.com/users/+1${encoded}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log(res);
			const data: LookupResult = await res.json();
			setResult(data);
		} catch (err: any) {
			setError(err?.message || "Unknown error");
		} finally {
			setLoading(false);
		}
	}

	async function handleShipmentSubmit(e?: React.FormEvent) {
		if (e) e.preventDefault();
		setShipmentError(null);
		setShipmentResult(null);
		if (!shipmentEmail) {
			setShipmentError("Please enter an email address");
			return;
		}

		setShipmentLoading(true);
		try {
			const encoded = encodeURIComponent(shipmentEmail);
			const res = await fetch(`https://offline-dc-twilio-5f937b734ab9.herokuapp.com/shipment-file/${encoded}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			// try json, fallback to text
			let data: any;
			const ct = res.headers.get("content-type") || "";
			if (ct.includes("application/json")) {
				data = await res.json();
			} else {
				data = await res.text();
			}
			setShipmentResult(data);
		} catch (err: any) {
			setShipmentError(err?.message || "Unknown error");
		} finally {
			setShipmentLoading(false);
		}
	}

	if (!authorized) {
		// render password prompt
		return (
			<div style={{ padding: "1rem", maxWidth: 640 }}>
				<h2 style={{color:"white"}}>Enter password to view Dashboard</h2>
				<form onSubmit={handleAuthSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
					<input
						type="password"
						value={passwordAttempt}
						onChange={(e) => setPasswordAttempt(e.target.value)}
						placeholder="Password"
						style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
					/>
					<button type="submit" style={{ padding: "0.5rem 1rem" }}>Enter</button>
				</form>
				{authError && <div style={{ color: "#c0392b", marginTop: "0.5rem" }}>{authError}</div>}
			</div>
		);
	}

	return (
		<div style={{ padding: "1rem", maxWidth: 640 }}>
			<form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
				<input
					type="text"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder="Enter phone number"
					style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
				/>
				<button type="submit" style={{ padding: "0.5rem 1rem" }} disabled={loading}>
					{loading ? "Loading..." : "Lookup"}
				</button>
			</form>

			{/* Shipment file lookup form */}
			<form onSubmit={handleShipmentSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "1rem" }}>
				<input
					type="email"
					value={shipmentEmail}
					onChange={(e) => setShipmentEmail(e.target.value)}
					placeholder="Shipment file (email)"
					style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
				/>
				<button type="submit" style={{ padding: "0.5rem 1rem" }} disabled={shipmentLoading}>
					{shipmentLoading ? "Loading..." : "Get Shipment File"}
				</button>
			</form>


			<div style={{ marginTop: "1rem" }}>
				{error && <div style={{ color: "#c0392b" }}>Error: {error}</div>}
				{result && (
					<div style={{ marginTop: "0.5rem", background: "#f6f6f6", padding: "0.75rem", borderRadius: 6 }}>
						<div><strong>{result.application_date ? `Applied on ${formatMySQLDatetime(String(result.application_date))}` : "Did not apply."}</strong></div>
						<div><strong>{result.invitation_sent_on ? `Invitation sent on ${formatMySQLDatetime(String(result.invitation_sent_on))}` : "Invitation not sent."}</strong></div>
					</div>
				)}

				{/* Shipment response area */}
				{shipmentError && <div style={{ color: "#c0392b", marginTop: "0.5rem" }}>Shipment error: {shipmentError}</div>}
				{shipmentResult && (
					<div style={{ marginTop: "0.5rem", background: "#eef6ff", padding: "0.75rem", borderRadius: 6 }}>
						<strong>Shipment response</strong>
						<div style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.9rem" }}>
							{typeof shipmentResult === "string" ? shipmentResult : JSON.stringify(shipmentResult, null, 2)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

