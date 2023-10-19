import { CommandInteraction, SlashCommandBuilder } from "discord.js";

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