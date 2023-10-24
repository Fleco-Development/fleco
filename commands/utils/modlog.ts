import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, MessageComponentInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';
import { Prisma } from '@prisma/client';

type ConfigFields = keyof Omit<Prisma.ConfigFieldRefs, 'id' | 'server' | 'serverID' | 'modlog_chan'>;

const categoryInfo = {
	bans: {
		title: 'Ban/Unban Logs',
		desc: 'Logs any time a user is banned/unbanned on the server, if the person is banned with the bot and a duration has been set, it will also display the date of when they will be unbanned.',
	},
	kicks_mutes: {
		title: 'Kick/Mute Logs',
		desc: 'Logs any time someone is kicked from the server or has been put in a timeout. This uses the built-in Timeout feature in Discord.  **It cannot log when a user has been unmuted automatically due to how the Discord API works.**',
	},
	warns: {
		title: 'Warning Logs',
		desc: 'Logs any time the warn command is used to warn another user.',
	},
};

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
						.setName('logging')
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

	async logging(interaction: ChatInputCommandInteraction) {

		switch (interaction.options.getSubcommand(true)) {
		case 'edit':
			await this.loggingEdit(interaction);
			break;
		}

	}

	async loggingEdit(interaction: ChatInputCommandInteraction) {

		const setting = interaction.options.getString('setting', false);
		const value = interaction.options.getBoolean('value', false);

		const server = await this.client.db.server.findUnique({
			where: {
				id: interaction.guild?.id,
			},
			include: {
				config: true,
			},
		});

		if (!server || !server.config) {
			await interaction.reply('to-do');
			return;
		}

		let currentSetting: boolean | null = null;

		if (setting) {

			currentSetting = server.config[setting as ConfigFields];

		}

		const exitButton = new ButtonBuilder()
			.setCustomId('edit_exit')
			.setLabel('Exit')
			.setStyle(ButtonStyle.Danger);

		const collectorFilter = (i: MessageComponentInteraction) => {
			i.deferUpdate();
			return i.user.id === interaction.user.id;
		};

		if (!setting && !value) {
			await interaction.reply('yo');
		}
		else if (setting && !value) {

			const toggleButton = new ButtonBuilder()
				.setCustomId('edit_toggle')
				.setLabel('Toggle Setting')
				.setStyle(currentSetting ? ButtonStyle.Success : ButtonStyle.Secondary);

			const actionRow = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(toggleButton, exitButton);

			const embedInfo = categoryInfo[setting as keyof typeof categoryInfo];

			const changeSettingValue = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Setting', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setTitle(embedInfo.title)
				.setDescription(`${embedInfo.desc}\n\n**Current Status** ${currentSetting ? 'Enabled' : 'Disabled'}`)
				.setColor(currentSetting ? 'Green' : 'Red');

			const msg = await interaction.reply({
				embeds: [ changeSettingValue ],
				components: [ actionRow ],
				ephemeral: true,
			});


			const userInteraction = await msg.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 60_000 });

			await userInteraction.reply('hi');

		}
		else if (!setting && value) {
			await interaction.reply('heh');
		}


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