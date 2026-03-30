# trek-mcp-server

MCP (Model Context Protocol) server for [TREK](https://github.com/Pulkitxm/trek) — a self-hosted collaborative travel planner.

Exposes 25 tools for managing trips, places, itineraries, budgets, packing lists, reservations, and collaboration via AI assistants (Claude Code, Claude Desktop).

## Requirements

- Node.js >= 24
- A running TREK instance

## Installation

### Via npm (recommended)

```bash
npm install -g trek-mcp-server
```

### From source

```bash
git clone https://github.com/kbzowski/trek-mcp-server.git
cd trek-mcp-server
npm install
npm run build
```

## Configuration

Set three environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `TREK_URL` | Base URL of your TREK instance | `http://localhost:3000` |
| `TREK_EMAIL` | Login email | `user@example.com` |
| `TREK_PASSWORD` | Login password | `your-password` |

### Claude Code / Claude Desktop

Add to your MCP settings (`~/.claude/settings.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "trek": {
      "command": "npx",
      "args": ["-y", "trek-mcp-server"],
      "env": {
        "TREK_URL": "http://localhost:3000",
        "TREK_EMAIL": "user@example.com",
        "TREK_PASSWORD": "your-password"
      }
    }
  }
}
```

If installed from source, replace `"command"` and `"args"` with:

```json
{
  "command": "node",
  "args": ["/path/to/trek-mcp-server/dist/index.js"]
}
```

On Windows use backslashes: `"args": ["C:\\path\\to\\trek-mcp-server\\dist\\index.js"]`

## Available Tools

### Trips
- `trek_list_trips` — List all trips
- `trek_get_trip` — Get trip details
- `trek_create_trip` — Create a new trip
- `trek_update_trip` — Update trip details

### Days & Itinerary
- `trek_list_days` — List days with assignments and notes
- `trek_update_day` — Update day title/notes
- `trek_assign_place_to_day` — Assign a place to a day
- `trek_move_assignment` — Move assignment to another day
- `trek_remove_assignment` — Remove assignment from a day

### Places
- `trek_list_places` — List places (with search/filter)
- `trek_create_place` — Add a place to a trip
- `trek_update_place` — Update place details
- `trek_delete_place` — Delete a place

### Budget
- `trek_get_budget` — Get budget items and per-person summary
- `trek_create_budget_item` — Add an expense
- `trek_update_budget_item` — Update an expense

### Packing
- `trek_list_packing` — List packing items
- `trek_manage_packing_item` — Create, update, or delete packing items

### Reservations
- `trek_list_reservations` — List reservations
- `trek_manage_reservation` — Create, update, or delete reservations

### Collaboration
- `trek_list_collab_notes` — List shared notes
- `trek_create_collab_note` — Create a shared note
- `trek_send_message` — Send a chat message

### Discovery
- `trek_search_places` — Search places via map provider
- `trek_get_weather` — Get weather forecast for a location

## Authentication

The server authenticates lazily on first API call using `TREK_EMAIL` and `TREK_PASSWORD`. The JWT token is cached and automatically refreshed on 401 responses. MFA is not supported — use an account without MFA enabled.

## License

MIT
