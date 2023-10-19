import { ApplicationCommandData, CommandInteraction } from "discord.js";

export interface Config {
    token: string,
}

export abstract class Command { //Unpopular opinion, I like using classes for commands.

    commandData: ApplicationCommandData

    constructor(appCommandData: ApplicationCommandData) {
        this.commandData = appCommandData;
    }

    abstract execute(interaction: CommandInteraction): Promise<void>;

}