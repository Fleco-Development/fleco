import { ChatInputCommandInteraction, Client, ClientEvents, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Config {
    token: string,
    database: ConfigDatabase,
}

interface ConfigDatabase {
    host: string,
    port: number,
    user: string,
    pass: string,
    name: string,
}

// Unpopular opinion, I like using classes for commands.
export abstract class Command {

	public client!: Client;
	public commandData: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
	public filePath: string | undefined;

	protected constructor(appCommandData: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>) {
		this.commandData = appCommandData;
	}

    abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

}

export abstract class Event {

	public eventName: keyof ClientEvents;
	public filePath: string | undefined;
	public client!: Client;
	public once: boolean;

	protected constructor(eventName: keyof ClientEvents, once: boolean = false) {
		this.eventName = eventName;
		this.once = once;
	}

    abstract execute(...args: unknown[]): Promise<void>

}