import { Client, ClientEvents, CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Config {
    token: string,
}

export abstract class Command { //Unpopular opinion, I like using classes for commands.

    public client!: Client;
    public commandData: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    public filePath: string | undefined;

    constructor(appCommandData: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">) {
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