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

export function registerPackingTools(server: McpServer) {
	server.registerTool(
		"trek_list_packing",
		{
			title: "List Packing Items",
			description: "List all packing items for a trip, grouped by category.",
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
				const data = await get(`/api/trips/${trip_id}/packing`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_manage_packing_item",
		{
			title: "Manage Packing Item",
			description:
				"Create, update, or delete a packing item. " +
				"To CREATE: provide name (item_id omitted). " +
				"To UPDATE: provide item_id and fields to change. " +
				"To DELETE: provide item_id and set delete=true.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				item_id: z
					.number()
					.int()
					.optional()
					.describe("Item ID (omit to create new)"),
				name: z.string().optional().describe("Item name"),
				category: z
					.string()
					.optional()
					.describe("Packing category (e.g. clothing, electronics)"),
				checked: z.boolean().optional().describe("Whether the item is packed"),
				weight_grams: z
					.number()
					.int()
					.optional()
					.describe("Item weight in grams"),
				bag_id: z
					.number()
					.int()
					.optional()
					.describe("Bag ID to assign item to"),
				delete: z
					.boolean()
					.optional()
					.describe("Set to true to delete the item"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: false,
				openWorldHint: false,
			},
		},
		async ({ trip_id, item_id, delete: doDelete, ...body }) => {
			try {
				if (item_id && doDelete) {
					const data = await del(`/api/trips/${trip_id}/packing/${item_id}`);
					return ok(data);
				}
				if (item_id) {
					const data = await put(
						`/api/trips/${trip_id}/packing/${item_id}`,
						body,
					);
					return ok(data);
				}
				const data = await post(`/api/trips/${trip_id}/packing`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
