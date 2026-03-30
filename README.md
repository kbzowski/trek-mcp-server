# trek-mcp-server

MCP server for [TREK](https://github.com/mauriceboe/TREK), a self-hosted travel planner. Lets AI assistants (Claude Code, Claude Desktop) manage trips, places, budgets, packing lists, reservations, and more through 31 tools.

## Requirements

- Node.js >= 24
- A running TREK instance

## Installation

### npm

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

Three environment variables are needed:

| Variable | Description | Example |
|----------|-------------|---------|
| `TREK_URL` | Base URL of your TREK instance | `http://localhost:3000` |
| `TREK_EMAIL` | Login email | `user@example.com` |
| `TREK_PASSWORD` | Login password | `your-password` |

### Linux / macOS

Add to `~/.claude/settings.json` or `claude_desktop_config.json`:

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

### Windows

On Windows, `npx` needs `cmd /c`:

```json
{
  "mcpServers": {
    "trek": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "trek-mcp-server"],
      "env": {
        "TREK_URL": "http://localhost:3000",
        "TREK_EMAIL": "user@example.com",
        "TREK_PASSWORD": "your-password"
      }
    }
  }
}
```

### From source

If you built from source, point to the compiled entry directly:

```json
{
  "command": "node",
  "args": ["/path/to/trek-mcp-server/dist/index.js"]
}
```

## Tools

### Trips
- `trek_list_trips` -list all trips
- `trek_get_trip` -get trip details
- `trek_create_trip` -create a trip
- `trek_update_trip` -update a trip

### Days and itinerary
- `trek_list_days` -list days with assignments and notes
- `trek_update_day` -update day title or notes
- `trek_assign_place_to_day` -assign a place to a day
- `trek_move_assignment` -move an assignment to another day
- `trek_remove_assignment` -remove an assignment from a day

### Places
- `trek_list_places` -list places, with optional search/filter
- `trek_create_place` -add a place to a trip
- `trek_update_place` -update place details
- `trek_delete_place` -delete a place

### Budget
- `trek_get_budget` -get budget items and per-person summary
- `trek_create_budget_item` -add an expense
- `trek_update_budget_item` -update an expense

### Packing
- `trek_list_packing` -list packing items
- `trek_manage_packing_item` -create, update, or delete a packing item

### Reservations
- `trek_list_reservations` -list reservations
- `trek_manage_reservation` -create, update, or delete a reservation

### Accommodations
- `trek_list_accommodations` -list hotel stays for a trip
- `trek_create_accommodation` -add a hotel stay (auto-creates linked reservation)
- `trek_update_accommodation` -update a hotel stay
- `trek_delete_accommodation` -delete a hotel stay

### Collaboration
- `trek_list_collab_notes` -list shared notes
- `trek_create_collab_note` -create a shared note
- `trek_send_message` -send a chat message

### Files
- `trek_list_files` -list uploaded files (with optional trash view)
- `trek_update_file` -update file description or place/reservation association

### Discovery
- `trek_search_places` -search places via map provider
- `trek_get_weather` -get weather forecast for a location

## Authentication

The server logs in on first API call using `TREK_EMAIL` and `TREK_PASSWORD`, caches the JWT token, and re-authenticates automatically when it expires. MFA is not supported -use an account without MFA.

## License

MIT
