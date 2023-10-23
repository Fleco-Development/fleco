import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types.js";

export default class InitCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("init")
                .setDescription("dev_test_3")
                .setDMPermission(false)
        )
    }

    async execute(interaction: CommandInteraction) {

        const result = await this.client.db.server.findFirst({
            where: {
                id: interaction.guild?.id!
            },
            include: {
                config: true
            }
        });

        if (result) {

            await interaction.reply(`GuildID_DB - ${result.id}\nGuildConfigID_DB - ${result.config?.id}`)

        } else {

            await this.client.db.server.create({
                data: {
                    id: interaction.guild?.id!,
                    config: {
                        create: { 
                            id: interaction.guild?.id!,
                        }
                    }
                },
                include: {
                    config: true
                }
            });
    
            await interaction.reply("OK");

        }



    }

}