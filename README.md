# Storybook MCP Server

A Model Context Protocol server for interacting with Storybook.

## Usage

```json
{
  "mcpServers": {
    "storybook": {
      "command": "npx",
      "args": ["-y", "mcp-storybook@latest"]
    }
  }
}
```

## Tools

### get-stories

Retrieves a list of stories from a Storybook configuration.

**Parameters:**

- `configDir` (string): Absolute path to directory containing the .storybook config folder

**Returns:**

- List of story ids

## Technical Details

- Built using `@modelcontextprotocol/sdk`
- Uses stdio transport for communication
- Caches data in `./cache` relative to script location

Unfortunately we need to install any framework that might be encountered to this package so that the index building doesn't fail.
