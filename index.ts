import { Client, GatewayIntentBits } from "discord.js";
import { Config } from "./types.js";
import { program } from "commander";
import { parse } from "yaml";
import path from "node:path";
import { loadEvents } from "./handlers/loaders/event.js";

program
    .option("-c, --config <string>", "Path to config file (e.g. /opt/config.yml)")

program.parse(process.argv);

let configPath : string | undefined = program.opts().config;

if (!configPath) {
    configPath = "config.yml"
}

let config : Config;

if (process.versions.bun) { //Try to use bun native things if possible.

    const configFile = Bun.file(configPath);
    config = parse(await configFile.text());

} else {

    const { readFileSync } = await import("node:fs");

    const configFile = readFileSync(configPath, "utf8");
    config = parse(configFile);

}

if (!config.token) {
    throw Error("Please provide a token!"); //throw seems to be the only way to exit in this situation, possibly a function would be better.
}

const client = new Client({ //We probably don't need all of these intents. But for now this is okay.
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences, //PRIVILEGED
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent, //PRIVILEGED
    ],
});

let eventDir : string;

if (process.versions.bun) {

    eventDir = path.join(path.dirname(Bun.main), "events");

} else {

    const { fileURLToPath } = await import("node:url");
    eventDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "events");

}


if (process.versions.bun) {

    client.commandDir = path.join(path.dirname(Bun.main), "commands");

} else {

    const { fileURLToPath } = await import("node:url");
    client.commandDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "commands");

}

await loadEvents(client, eventDir);

client.login(config.token);