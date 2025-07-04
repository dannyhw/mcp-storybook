#!/usr/bin/env node
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const __modelcontextprotocol_sdk_server_mcp_js = __toESM(require("@modelcontextprotocol/sdk/server/mcp.js"));
const __modelcontextprotocol_sdk_server_stdio_js = __toESM(require("@modelcontextprotocol/sdk/server/stdio.js"));
const zod = __toESM(require("zod"));
const path = __toESM(require("path"));
const fs = __toESM(require("fs"));

//#region getStories.ts
async function getIndex({ configDir }) {
	process.env.CACHE_DIR = __dirname + "/cache";
	const { buildIndex } = require("storybook/internal/core-server");
	const index = await buildIndex({ configDir });
	return Object.entries(index.entries).filter(([_, entry]) => entry.type === "story").map(([storyId, _entry]) => storyId).join("\n");
}
async function tryToResolveConfigDir({ configDir }) {
	const mainFiles = [
		"main.js",
		"main.ts",
		"main.mjs",
		"main.cjs"
	];
	const cwd = process.cwd();
	const parentDir = path.dirname(cwd);
	const configDirNoDot = configDir.startsWith("./") ? configDir.slice(2) : configDir;
	const baseDirs = configDir !== configDirNoDot ? [configDir, configDirNoDot] : [configDir];
	let possibleDirs = [];
	for (const base of baseDirs) possibleDirs.push(path.isAbsolute(base) ? base : path.resolve(base), path.resolve(cwd, base), path.join(cwd, ".storybook"), path.join(__dirname, base), path.resolve(parentDir, base), path.join(parentDir, ".storybook"));
	possibleDirs = Array.from(new Set(possibleDirs));
	let resolvedConfigDir = null;
	for (const dir of possibleDirs) {
		for (const mainFile of mainFiles) if (fs.existsSync(path.join(dir, mainFile))) {
			resolvedConfigDir = dir;
			break;
		}
		if (resolvedConfigDir) break;
	}
	if (resolvedConfigDir) try {
		return getIndex({ configDir: resolvedConfigDir });
	} catch (error) {
		return [
			`Error building index with configDir ${resolvedConfigDir}`,
			`${error}`,
			`try again with an absolute path like /the-full-path/to/your/project/.storybook`
		].join("\n\n");
	}
	else return [
		`Error building index with configDir ${resolvedConfigDir}`,
		`make sure you are passing the correct configDir`,
		`Checked: ${possibleDirs.join(", ")}`,
		`try again with an absolute path like /the-full-path/to/your/project/.storybook`
	].join("\n\n");
}
async function getStories({ configDir }) {
	try {
		return getIndex({ configDir });
	} catch (error) {
		return tryToResolveConfigDir({ configDir });
	}
}

//#endregion
//#region index.ts
const server = new __modelcontextprotocol_sdk_server_mcp_js.McpServer({
	name: "storybook",
	version: "1.0.0"
});
server.tool("get-stories", "Get a list of story ids for your storybook project, use this to list stories.", { configDir: zod.z.string().min(1).describe("The absolute path to directory containing the .storybook config folder (/the-full-path/to/your/project/.storybook).").default(`${process.cwd()}/.storybook`) }, async ({ configDir }) => {
	return { content: [{
		type: "text",
		text: await getStories({ configDir })
	}] };
});
server.tool("get-story-url", "Get the URL for a story by its story id.", {
	storyId: zod.z.string().min(1).describe("The story id to get the URL for."),
	baseUrl: zod.z.string().min(1).describe("Base URL of the Storybook instance.").default("http://localhost:6006")
}, async ({ storyId, baseUrl }) => {
	return { content: [{
		type: "text",
		text: `${baseUrl}/?path=/story/${storyId}`
	}] };
});
async function main() {
	const transport = new __modelcontextprotocol_sdk_server_stdio_js.StdioServerTransport();
	console.error("Server starting...");
	await server.connect(transport);
	console.error("Server started successfully");
}
main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});

//#endregion