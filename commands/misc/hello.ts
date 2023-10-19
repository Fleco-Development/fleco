import { Command } from "../../types.js";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default class TestStruct extends Command {

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("hello")
                .setDescription("testing")
        )
    }

    async execute(i: CommandInteraction): Promise<void> {

        await i.reply("Hello, World!");
        
    }

}