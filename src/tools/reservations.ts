import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, post, put, del } from "../client.js";

function ok(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}
function err(error: unknown) {
	const msg = error instanceof Error ? error.message : String(error);
	return {
		content: [{ type: "text" as const, text: `Error: ${msg}` }],
		isError: true,
	};
}

export function registerReservationTools(server: McpServer) {
	server.registerTool(
		"trek_list_reservations",
		{
			title: "List Reservations",
			description:
				"List all reservations/bookings for a trip (flights, hotels, restaurants, activities).",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id }) => {
			try {
				const data = await get(`/api/trips/${trip_id}/reservations`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_manage_reservation",
		{
			title: "Manage Reservation",
			description:
				"Create, update, or delete a reservation. " +
				"To CREATE: provide title (reservation_id omitted). " +
				"To UPDATE: provide reservation_id and fields to change. " +
				"To DELETE: provide reservation_id and set delete=true.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				reservation_id: z
					.number()
					.int()
					.optional()
					.describe("Reservation ID (omit to create new)"),
				title: z.string().optional().describe("Reservation title"),
				reservation_time: z
					.string()
					.optional()
					.describe("Date/time (ISO 8601)"),
				reservation_end_time: z
					.string()
					.optional()
					.describe("End date/time (ISO 8601)"),
				location: z.string().optional().describe("Location/address"),
				confirmation_number: z
					.string()
					.optional()
					.describe("Confirmation/booking number"),
				notes: z.string().optional().describe("Additional notes"),
				type: z
					.enum([
						"hotel",
						"flight",
						"activity",
						"restaurant",
						"transport",
						"other",
					])
					.optional()
					.describe("Reservation type"),
				status: z
					.enum(["pending", "confirmed", "cancelled"])
					.optional()
					.describe("Reservation status"),
				delete: z
					.boolean()
					.optional()
					.describe("Set to true to delete the reservation"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: false,
				openWorldHint: false,
			},
		},
		async ({ trip_id, reservation_id, delete: doDelete, ...body }) => {
			try {
				if (reservation_id && doDelete) {
					const data = await del(
						`/api/trips/${trip_id}/reservations/${reservation_id}`,
					);
					return ok(data);
				}
				if (reservation_id) {
					const data = await put(
						`/api/trips/${trip_id}/reservations/${reservation_id}`,
						body,
					);
					return ok(data);
				}
				const data = await post(`/api/trips/${trip_id}/reservations`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
