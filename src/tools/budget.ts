import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, post, put } from "../client.js";

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

export function registerBudgetTools(server: McpServer) {
	server.registerTool(
		"trek_get_budget",
		{
			title: "Get Budget",
			description:
				"Get all budget items and per-person spending summary for a trip.",
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
				const [items, summary] = await Promise.all([
					get(`/api/trips/${trip_id}/budget`),
					get(`/api/trips/${trip_id}/budget/summary/per-person`),
				]);
				return ok({ items, summary });
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_create_budget_item",
		{
			title: "Create Budget Item",
			description: "Add a new expense/budget item to a trip.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				category: z
					.string()
					.describe("Expense category (e.g. food, transport, accommodation)"),
				name: z.string().describe("Item name/description"),
				total_price: z.number().optional().describe("Total price"),
				persons: z
					.number()
					.int()
					.optional()
					.describe("Number of persons to split between"),
				days: z
					.number()
					.int()
					.optional()
					.describe("Number of days this expense covers"),
				note: z.string().optional().describe("Additional notes"),
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
				const data = await post(`/api/trips/${trip_id}/budget`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_update_budget_item",
		{
			title: "Update Budget Item",
			description: "Update an existing budget item.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				item_id: z.number().int().describe("The budget item ID"),
				category: z.string().optional().describe("Expense category"),
				name: z.string().optional().describe("Item name/description"),
				total_price: z.number().optional().describe("Total price"),
				persons: z.number().int().optional().describe("Number of persons"),
				days: z.number().int().optional().describe("Number of days"),
				note: z.string().optional().describe("Additional notes"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, item_id, ...body }) => {
			try {
				const data = await put(`/api/trips/${trip_id}/budget/${item_id}`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
