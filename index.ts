import { Client, Events, GatewayIntentBits, Interaction } from "discord.js";
import { Command, Config } from "./types.js";
import { program } from "commander";
import { parse } from "yaml";
import { loadCommands } from "./handlers/loaders/command.js";
import path from "node:path";

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




client.once("ready", async c => {
    console.info(`Logged in as ${c.user.tag}`);

    let commandDir : string;

    if (process.versions.bun) {

        commandDir = path.join(path.dirname(Bun.main), "commands");

    } else {

        const { fileURLToPath } = await import("node:url");
        commandDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "commands");

    }

    let commandMap = await loadCommands(client, commandDir);

    console.log(commandMap);

    client.addListener(Events.InteractionCreate, (e) => interactionCreate(e, commandMap)); //TODO: Remove this when event loader is fully made.


});

async function interactionCreate(i: Interaction, commandMap: Map<string,Command>) {

    if (!i.isCommand()) return;
    
    const command = commandMap.get(i.commandName);

    await command?.execute(i);

}



client.login(config.token);