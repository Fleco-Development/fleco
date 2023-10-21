import { Client, ClientEvents, CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Config {
    token: string,
}

export abstract class Command { //Unpopular opinion, I like using classes for commands.

    public commandData: SlashCommandBuilder;
    public filePath: string | undefined;

    constructor(appCommandData: SlashCommandBuilder) {
        this.commandData = appCommandData;
    }

    abstract execute(interaction: CommandInteraction): Promise<void>;

}

export abstract class Event {

    public eventName: keyof ClientEvents;
    public filePath: string | undefined;
    public client!: Client;
    public once: boolean;

    constructor(eventName: keyof ClientEvents, once: boolean = false) {
        this.eventName = eventName;
        this.once = once;
    }

    abstract execute(...args: unknown[]): Promise<void>

}