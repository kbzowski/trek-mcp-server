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

const placeFields = {
	name: z.string().optional().describe("Place name"),
	description: z.string().optional().describe("Place description"),
	lat: z.number().optional().describe("Latitude"),
	lng: z.number().optional().describe("Longitude"),
	address: z.string().optional().describe("Street address"),
	category_id: z.number().int().optional().describe("Category ID"),
	price: z.number().optional().describe("Price/cost"),
	currency: z.string().optional().describe("Currency code for price"),
	place_time: z.string().optional().describe("Start time (HH:MM)"),
	end_time: z.string().optional().describe("End time (HH:MM)"),
	duration_minutes: z.number().int().optional().describe("Duration in minutes"),
	website: z.string().optional().describe("Website URL"),
	phone: z.string().optional().describe("Phone number"),
	transport_mode: z
		.string()
		.optional()
		.describe("Transport mode: walking, driving, transit, bicycling"),
};

export function registerPlaceTools(server: McpServer) {
	server.registerTool(
		"trek_list_places",
		{
			title: "List Places",
			description:
				"List all places for a trip. Optionally filter by search text, category, or tag.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				search: z
					.string()
					.optional()
					.describe("Search text to filter places by name"),
				category: z
					.number()
					.int()
					.optional()
					.describe("Category ID to filter by"),
				tag: z.number().int().optional().describe("Tag ID to filter by"),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, search, category, tag }) => {
			try {
				const data = await get(`/api/trips/${trip_id}/places`, {
					search,
					category,
					tag,
				});
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_create_place",
		{
			title: "Create Place",
			description:
				"Add a new place (point of interest) to a trip. Provide at minimum a name. Use trek_search_osm to find coordinates first.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				name: z.string().describe("Place name (required)"),
				description: z.string().optional().describe("Place description"),
				lat: z.number().optional().describe("Latitude"),
				lng: z.number().optional().describe("Longitude"),
				address: z.string().optional().describe("Street address"),
				category_id: z.number().int().optional().describe("Category ID"),
				price: z.number().optional().describe("Price/cost"),
				currency: z.string().optional().describe("Currency code for price"),
				place_time: z.string().optional().describe("Start time (HH:MM)"),
				end_time: z.string().optional().describe("End time (HH:MM)"),
				duration_minutes: z
					.number()
					.int()
					.optional()
					.describe("Duration in minutes"),
				tags: z.array(z.number().int()).optional().describe("Array of tag IDs"),
				website: z.string().optional().describe("Website URL"),
				phone: z.string().optional().describe("Phone number"),
				transport_mode: z
					.string()
					.optional()
					.describe("Transport mode: walking, driving, transit, bicycling"),
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
				const data = await post(`/api/trips/${trip_id}/places`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_update_place",
		{
			title: "Update Place",
			description: "Update an existing place's details.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				place_id: z.number().int().describe("The place ID"),
				...placeFields,
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, place_id, ...body }) => {
			try {
				const data = await put(
					`/api/trips/${trip_id}/places/${place_id}`,
					body,
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_delete_place",
		{
			title: "Delete Place",
			description:
				"Delete a place from a trip. This also removes all assignments of this place to days.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				place_id: z.number().int().describe("The place ID to delete"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: true,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, place_id }) => {
			try {
				const data = await del(`/api/trips/${trip_id}/places/${place_id}`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
