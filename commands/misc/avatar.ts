import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types.js";

export default class AvatarCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("avatar")
                .setDescription("Responds with the user's avatar.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("The user whos avatar you want to show.")
                        .setRequired(false)
                )
                .setDMPermission(false)
        )
    }

    async execute(interaction: CommandInteraction) {

        const memberFetch = interaction.options.getUser("user", false) || interaction.member?.user;

        const member = await interaction.guild?.members.fetch(memberFetch!.id)

        const avatarEmbed = new EmbedBuilder()
            .setAuthor({ name: "Fleco", iconURL: this.client.user?.displayAvatarURL({ extension: "webp" }) })
            .setTitle(`Profile Picture of ${member?.user.username}`)
            .setDescription(`[Avatar Link](${member?.displayAvatarURL({ extension: "png" })})`)
            .setImage(member!.displayAvatarURL({ extension: "webp", size: 512 }))
            .setFooter({ text: "Looking very good today!" })
            .setTimestamp()
            .setColor("Blue")

        await interaction.reply({ embeds: [ avatarEmbed ] });

    }

}