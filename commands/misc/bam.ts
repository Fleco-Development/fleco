import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';

export default class BamCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('bam')
				.setDescription('Bam someone.')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription('User to bam.')
						.setRequired(true),
				)
				.setDMPermission(false),
		);
	}

	async execute(interaction: CommandInteraction) {

		const member = interaction.options.getUser('user', true);

		await interaction.reply({
			content: `Bammed <@${member.id}>`,
			allowedMentions: {
				parse: [],
			},
		});

	}

}