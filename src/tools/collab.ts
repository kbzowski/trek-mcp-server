import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, post } from "../client.js";

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

export function registerCollabTools(server: McpServer) {
	server.registerTool(
		"trek_list_collab_notes",
		{
			title: "List Collaborative Notes",
			description:
				"List all collaborative notes for a trip. Notes are shared among trip members.",
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
				const data = await get(`/api/trips/${trip_id}/collab/notes`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_create_collab_note",
		{
			title: "Create Collaborative Note",
			description:
				"Create a new collaborative note visible to all trip members.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				title: z.string().describe("Note title"),
				content: z
					.string()
					.optional()
					.describe("Note content (supports markdown)"),
				category: z.string().optional().describe("Note category"),
				color: z.string().optional().describe("Note color (hex code)"),
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
				const data = await post(`/api/trips/${trip_id}/collab/notes`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_send_message",
		{
			title: "Send Trip Chat Message",
			description: "Send a message in the trip's collaborative chat.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				text: z.string().describe("Message text"),
				reply_to: z
					.number()
					.int()
					.optional()
					.describe("Message ID to reply to"),
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
				const data = await post(`/api/trips/${trip_id}/collab/messages`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
