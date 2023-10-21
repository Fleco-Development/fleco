import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types.js";

export default class RandomCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("random")
                .setDescription("Generate a random number between the 2 provided numbers.")
                .addIntegerOption((option) => 
                    option 
                        .setName("min")
                        .setDescription("Minimum number")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("max")
                        .setDescription("Max number")
                        .setRequired(true)
                )
                .setDMPermission(false)
        )
    }

    async execute(interaction: CommandInteraction) {

        const min = interaction.options.get("min", true).value as number;
        const max = interaction.options.get("max", true).value as number;

        const randomEmbed = new EmbedBuilder()
            .setAuthor({ name: "Fleco", iconURL: this.client.user?.displayAvatarURL({ extension: "webp" }) })
            .addFields(
                {
                    name: "Min Number:",
                    value: `${min}`,
                    inline: true,
                },
                {
                    name: "Max Number:",
                    value: `${max}`,
                    inline: true,
                },
                {
                    name: "Output:",
                    value: `${Math.floor(Math.random() * (max - min + 1)) + min}`
                }
            )
            .setTimestamp()
            .setColor("Blue")

        await interaction.reply({ embeds : [ randomEmbed ] });

    }

}