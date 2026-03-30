const TREK_URL = process.env.TREK_URL;
const TREK_EMAIL = process.env.TREK_EMAIL;
const TREK_PASSWORD = process.env.TREK_PASSWORD;

if (!TREK_URL || !TREK_EMAIL || !TREK_PASSWORD) {
	throw new Error(
		"Missing required environment variables. Set TREK_URL, TREK_EMAIL, and TREK_PASSWORD.",
	);
}

const BASE_URL = TREK_URL.replace(/\/+$/, "");

let token: string | null = null;

async function login(): Promise<void> {
	const res = await fetch(`${BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: TREK_EMAIL, password: TREK_PASSWORD }),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Login failed (${res.status}): ${text}`);
	}

	const data = (await res.json()) as { token: string; mfa_required?: boolean };

	if (data.mfa_required) {
		throw new Error(
			"MFA is enabled on this account. The MCP server does not support MFA. " +
				"Please use an account without MFA or disable MFA for this account.",
		);
	}

	token = data.token;
}

export async function request<T = unknown>(
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	if (!token) {
		await login();
	}

	const doRequest = async (): Promise<Response> => {
		const opts: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		};
		if (body !== undefined) {
			opts.body = JSON.stringify(body);
		}
		return fetch(`${BASE_URL}${path}`, opts);
	};

	let res = await doRequest();

	if (res.status === 401) {
		token = null;
		await login();
		res = await doRequest();
	}

	if (!res.ok) {
		const text = await res.text();
		throw new Error(
			`TREK API error (${res.status} ${method} ${path}): ${text}`,
		);
	}

	return res.json() as Promise<T>;
}

export async function get<T = unknown>(
	path: string,
	params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
	let url = path;
	if (params) {
		const entries = Object.entries(params).filter(
			([, v]) => v !== undefined,
		) as [string, string | number | boolean][];
		if (entries.length > 0) {
			const qs = new URLSearchParams(
				entries.map(([k, v]): [string, string] => [k, String(v)]),
			).toString();
			url = `${path}?${qs}`;
		}
	}
	return request<T>("GET", url);
}

export async function post<T = unknown>(
	path: string,
	body?: unknown,
): Promise<T> {
	return request<T>("POST", path, body);
}

export async function put<T = unknown>(
	path: string,
	body?: unknown,
): Promise<T> {
	return request<T>("PUT", path, body);
}

export async function del<T = unknown>(path: string): Promise<T> {
	return request<T>("DELETE", path);
}
