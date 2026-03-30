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

export function registerAccommodationTools(server: McpServer) {
	server.registerTool(
		"trek_list_accommodations",
		{
			title: "List Accommodations",
			description:
				"List all accommodations (hotel stays) for a trip, including place info, check-in/check-out times, and which days they span.",
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
				const data = await get(`/api/trips/${trip_id}/accommodations`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_create_accommodation",
		{
			title: "Create Accommodation",
			description:
				"Add an accommodation (hotel stay) to a trip. Requires a place_id and start/end day IDs. Also auto-creates a linked hotel reservation.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				place_id: z.number().int().describe("Place ID (the hotel/hostel)"),
				start_day_id: z.number().int().describe("Day ID for check-in"),
				end_day_id: z.number().int().describe("Day ID for check-out"),
				check_in: z.string().optional().describe("Check-in time (HH:MM)"),
				check_out: z.string().optional().describe("Check-out time (HH:MM)"),
				confirmation: z.string().optional().describe("Booking confirmation number"),
				notes: z.string().optional().describe("Additional notes"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: false,
				openWorldHint: false,
			},
		},
		async ({ trip_id, ...body }) => {
			try {
				const data = await post(`/api/trips/${trip_id}/accommodations`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_update_accommodation",
		{
			title: "Update Accommodation",
			description: "Update an existing accommodation's details.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				accommodation_id: z.number().int().describe("The accommodation ID"),
				place_id: z.number().int().optional().describe("New place ID"),
				start_day_id: z.number().int().optional().describe("New check-in day ID"),
				end_day_id: z.number().int().optional().describe("New check-out day ID"),
				check_in: z.string().optional().describe("Check-in time (HH:MM)"),
				check_out: z.string().optional().describe("Check-out time (HH:MM)"),
				confirmation: z.string().optional().describe("Booking confirmation number"),
				notes: z.string().optional().describe("Additional notes"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, accommodation_id, ...body }) => {
			try {
				const data = await put(
					`/api/trips/${trip_id}/accommodations/${accommodation_id}`,
					body,
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_delete_accommodation",
		{
			title: "Delete Accommodation",
			description:
				"Delete an accommodation. Also removes the linked hotel reservation.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				accommodation_id: z.number().int().describe("The accommodation ID to delete"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: true,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, accommodation_id }) => {
			try {
				const data = await del(
					`/api/trips/${trip_id}/accommodations/${accommodation_id}`,
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
