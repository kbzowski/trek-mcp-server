import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, put } from "../client.js";

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

export function registerFileTools(server: McpServer) {
	server.registerTool(
		"trek_list_files",
		{
			title: "List Files",
			description:
				"List all files uploaded to a trip. Set trash=true to see deleted files.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				trash: z
					.boolean()
					.optional()
					.describe("If true, show trashed files instead of active ones"),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, trash }) => {
			try {
				const data = await get(`/api/trips/${trip_id}/files`, {
					trash: trash ? "true" : undefined,
				});
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_update_file",
		{
			title: "Update File",
			description:
				"Update a file's description or its association to a place or reservation.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				file_id: z.number().int().describe("The file ID"),
				description: z.string().optional().describe("File description"),
				place_id: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("Place ID to associate with (null to clear)"),
				reservation_id: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("Reservation ID to associate with (null to clear)"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, file_id, ...body }) => {
			try {
				const data = await put(
					`/api/trips/${trip_id}/files/${file_id}`,
					body,
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
