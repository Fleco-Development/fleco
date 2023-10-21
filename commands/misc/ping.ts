import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types.js";

export default class PingCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Current latency of bot.")
                .setDMPermission(false)
        )
    }

    async execute(interaction: CommandInteraction) {

        const pingEmbed = new EmbedBuilder()
            .setAuthor({ name: "Fleco", iconURL: this.client.user?.displayAvatarURL({ extension: "webp" }) })
            .addFields(
                {
                    name: "REST Latency:",
                    value: `${Math.round(Date.now() - interaction.createdTimestamp)}ms`,
                    inline: true
                },
                {
                    name: "WS Latency:",
                    value: `${Math.round(this.client.ws.ping)}ms`,
                    inline: true
                },
            )
            .setTimestamp()
            .setColor("Blue")

        await interaction.reply({ embeds: [ pingEmbed ] });

    }

}