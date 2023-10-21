import { Client, Events } from "discord.js";
import { Event } from "../types.js";
import { loadCommands } from "../handlers/loaders/command.js";

export default class ReadyEvent extends Event {

    constructor() {
        super(Events.ClientReady, true);
    }

    async execute(_: Client) {

        this.client.commands = await loadCommands(this.client);

        console.log(`Logged in as ${this.client.user?.tag}`);

    }

}