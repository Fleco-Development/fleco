import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../types.js';

export default class UnmuteCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('unmute')
				.setDescription('Unmutes a currently muted user.')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('User to unmute')
						.setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('reason')
						.setDescription('Reason for unmute'),
				)
				.setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const memberFetch = interaction.options.getUser('user', true);
		const member = await interaction.guild?.members.fetch(memberFetch.id);

		const reason = interaction.options.getString('reason', false);

		if (!member?.isCommunicationDisabled()) {

			const notMutedEmbed = new EmbedBuilder()
				.setDescription('User is not muted!')
				.setColor('Red');

			await interaction.reply({ embeds: [ notMutedEmbed ], ephemeral: true });
			return;

		}

		try {

			await member?.disableCommunicationUntil(null, reason ? `${reason} - ${interaction.member?.user.username}` : `Timed out by ${interaction.member?.user.username}`);

		}
		catch {

			const cannotUnmuteEmbed = new EmbedBuilder()
				.setDescription('Cannot unmute user, please check the bot permissions/hierarchy')
				.setColor('Red');

			await interaction.reply({ embeds: [ cannotUnmuteEmbed ], ephemeral: true });
			return;

		}

		const unmuteEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setDescription(`Unmuted <@${member?.user.id}>`)
			.setColor('Blue');

		await interaction.reply({ embeds: [ unmuteEmbed ], ephemeral: true });

	}

}