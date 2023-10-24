import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
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
						.setDescription('Setup modlogs for the server')
						.addChannelOption(option =>
							option
								.setName('log_channel')
								.setDescription('Channel to log all mod actions')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildText),
						),
				)
				.addSubcommandGroup(group =>
					group
						.setName('settings')
						.setDescription('Modlog Settings')
						.addSubcommand(command =>
							command
								.setName('edit')
								.setDescription('Edit the modlog settings')
								.addStringOption(option =>
									option
										.setName('setting')
										.setDescription('Setting to enable modlog categories')
										.addChoices(
											{ name: 'Bans/Unbans', value: 'bans' },
											{ name: 'Kicks/Mutes', value: 'kicks_mutes' },
											{ name: 'Warns', value: 'warns' },
										),
								)
								.addBooleanOption(option =>
									option
										.setName('value')
										.setDescription('Sets the value for the modlog setting'),
								),
						),
				)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		if (interaction.options.getSubcommandGroup()) {

			await interaction.reply('hi');

		}
		else {

			switch (interaction.options.getSubcommand(true)) {
			case 'create':
				await this.create(interaction);
				break;
			}

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

		const createModlogEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setTitle('Modlog has been setup!')
			.setDescription(`Modlogs will now be sent in <#${channel.id}>, if you would like to change the logging settings, you can use </modlog enable:${this.client.user?.id}> or </modlog disable:${this.client.user?.id}>`)
			.setTimestamp()
			.setColor('Green');

		await interaction.reply({ embeds: [ createModlogEmbed ] });

	}

	async settings(interaction: ChatInputCommandInteraction) {

		switch (interaction.options.getSubcommand(true)) {
		case 'edit':
			await this.settingsEdit(interaction);
			break;
		}

	}

	async settingsEdit(interaction: ChatInputCommandInteraction) {

		await interaction.reply('To-Do');

	}

	// async enable(interaction: ChatInputCommandInteraction) {

	// 	const setting = interaction.options.getString('setting', false);

	// 	if (!setting) {

	// 		const modlogEnableEmbed = new EmbedBuilder()
	// 			.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
	// 			.setTitle('');

	// 	}


	// }

}