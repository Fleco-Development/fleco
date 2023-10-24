import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';

export default class ModlogCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('modlog')
				.setDescription('Manage the modlog for the server')
				.addSubcommand(command =>
					command
						.setName('create')
						.addChannelOption(option =>
							option
								.setName('log_channel')
								.setDescription('Channel to log all mod actions')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildText),
						),
				)
				.addSubcommand(command =>
					command
						.setName('enable')
						.addStringOption(option =>
							option
								.setName('setting')
								.setDescription('Setting to enable modlog categories')
								.addChoices(
									{ name: 'Bans/Unbans', value: 'bans' },
									{ name: 'Kicks/Mutes', value: 'kicks_mutes' },
									{ name: 'Warns', value: 'warns' },
								),
						),
				)
				.addSubcommand(command =>
					command
						.setName('disable')
						.addStringOption(option =>
							option
								.setName('setting')
								.setDescription('Setting to disable modlog categories')
								.addChoices(
									{ name: 'Bans/Unbans', value: 'bans' },
									{ name: 'Kicks/Mutes', value: 'kicks_mutes' },
									{ name: 'Warns', value: 'warns' },
								),
						),
				)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		switch (interaction.options.getSubcommand()) {
		case 'create':
			await this.create(interaction);
			break;
		}

	}

	async create(interaction: ChatInputCommandInteraction) {

		const channel = interaction.options.getChannel('log_channel', true);

		await this.client.db.server.update({
			where: {
				id: interaction.guild?.id,
			},
			data: {
				config: {
					update: {
						modlog_chan: channel.id,
					},
				},
			},
			include: {
				config: true,
			},
		});

		await interaction.reply('OK');

	}

}