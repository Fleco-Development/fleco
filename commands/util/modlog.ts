import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, MessageComponentInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';
import { Prisma } from '@prisma/client';
import { Temporal } from '@js-temporal/polyfill';
import { paginateArray } from '../../utils/paginate.js';

type ConfigFields = keyof Omit<Prisma.ConfigFieldRefs, 'id' | 'server' | 'serverID' | 'modlog_chan'>;

const categoryInfo = {
	modlog_ban: {
		title: 'Ban/Unban Logs',
		desc: 'Logs any time a user is banned/unbanned on the server, if the person is banned with the bot and a duration has been set, it will also display the date of when they will be unbanned.',
	},
	modlog_kick: {
		title: 'Kick/Mute Logs',
		desc: 'Logs any time someone is kicked from the server or when a user is put in timeout. This uses the built-in timeout feature in Discord. **It cannot log when a user has been unmuted automatically due to how the Discord API works.**',
	},
	modlog_warn_mute: {
		title: 'Warn/Mute Logs',
		desc: 'Logs any time a user has been warned.',
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
											{ name: 'Bans/Unbans', value: 'modlog_ban' },
											{ name: 'Kicks', value: 'modlog_kick' },
											{ name: 'Warns/Mutes', value: 'modlog_warn_mute' },
										),
								)
								.addBooleanOption(option =>
									option
										.setName('value')
										.setDescription('Sets the value for the modlog setting'),
								),
						)
						.addSubcommand(command =>
							command
								.setName('show')
								.setDescription('Displays all of the logging settings.'),
						),

				)
				.addSubcommandGroup(group =>
					group
						.setName('user')
						.setDescription('Show/Delete user modlogs')
						.addSubcommand(command =>
							command
								.setName('get')
								.setDescription('Get the modlogs for a certain member.')
								.addUserOption(option =>
									option
										.setName('user')
										.setDescription('Guild member')
										.setRequired(true),
								),
						),
				)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		if (interaction.options.getSubcommandGroup()) {

			switch (interaction.options.getSubcommandGroup(true)) {
			case 'logging':
				await this.logging(interaction);
				break;
			case 'user':
				await this.user(interaction);
				break;
			}

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

	async user(interaction: ChatInputCommandInteraction) {

		switch (interaction.options.getSubcommand(true)) {
		case 'get':
			await this.userGet(interaction);
			break;
		}

	}

	async userGet(interaction: ChatInputCommandInteraction) {

		const testEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco Modlogs', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setColor('Blue');

		const user = interaction.options.getUser('user', true);

		testEmbed.setTitle(`Modlogs for ${user.username}`);

		const userModlogs = await this.client.db.modlog.findMany({
			where: {
				userID: user.id,
				serverID: interaction.guild?.id,
			},
		});

		testEmbed.setFooter({ text: `Total Logs: ${userModlogs.length}` });

		if (userModlogs.length == 0) {

			testEmbed.setDescription('User has no logs!');

			await interaction.reply({ embeds: [ testEmbed ] });
			return;

		}

		const paginatedLogs = paginateArray(userModlogs, 6);

		const firstPageButton = new ButtonBuilder()
			.setCustomId('first_page')
			.setEmoji('⏪')
			.setStyle(ButtonStyle.Secondary);

		const lastPageButton = new ButtonBuilder()
			.setCustomId('last_page')
			.setEmoji('⏩')
			.setStyle(ButtonStyle.Secondary);

		const nextPageButton = new ButtonBuilder()
			.setCustomId('next_page')
			.setEmoji('▶️')
			.setStyle(ButtonStyle.Secondary);

		const backPageButton = new ButtonBuilder()
			.setCustomId('back_page')
			.setEmoji('◀️')
			.setStyle(ButtonStyle.Secondary);

		const exitPageButton = new ButtonBuilder()
			.setCustomId('exit')
			// If someone can find a better emoji for this that would be greatly appreciated.
			.setEmoji('✖')
			.setStyle(ButtonStyle.Danger);

		if (paginatedLogs.totalPages == 1) {

			testEmbed.addFields(this.generateFields(paginatedLogs.pages[0]));

			await interaction.reply({ embeds: [ testEmbed ], ephemeral: true });
			return;

		}

		const mainRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(firstPageButton.setDisabled(true), backPageButton.setDisabled(true), nextPageButton, lastPageButton.setDisabled(true), exitPageButton);

		testEmbed.addFields(this.generateFields(paginatedLogs.pages[0]));
		testEmbed.setFooter({ text: `Page: 1/${paginatedLogs.totalPages} | Total Logs: ${paginatedLogs.totalItems}` });

		const interactionMsg = await interaction.reply({ embeds: [ testEmbed ], components: [ mainRow ], ephemeral: true });

		const collectorFilter = (i: MessageComponentInteraction) => {
			return i.user.id === interaction.user.id;
		};

		let currentPage = 0;

		const collector = interactionMsg.createMessageComponentCollector({ componentType: ComponentType.Button, filter: collectorFilter, time: 60_000 });
		const row = new ActionRowBuilder<ButtonBuilder>();

		collector.on('end', async () => {

			await interactionMsg.edit({ components: [] });

		});

		collector.on('collect', async i => {

			await i.deferUpdate();

			row.setComponents([]);

			testEmbed.spliceFields(0, testEmbed.data.fields!.length);

			switch (i.customId) {

			case 'next_page':
				currentPage++;
				break;
			case 'back_page':
				currentPage--;
				break;
			case 'first_page':
				currentPage = 0;
				break;
			case 'last_page':
				currentPage = paginatedLogs.totalPages - 1;
				break;

			case 'exit':
				collector.stop('graceful');
				return;

			default:
				return;

			}

			testEmbed.setFooter({ text: `Page: ${currentPage + 1}/${paginatedLogs.totalPages} | Total Logs: ${paginatedLogs.totalItems}` });
			testEmbed.addFields(this.generateFields(paginatedLogs.pages[currentPage]));

			firstPageButton.setDisabled(true);
			backPageButton.setDisabled(true);
			nextPageButton.setDisabled(true);
			lastPageButton.setDisabled(true);


			if (paginatedLogs.totalPages > 1) {
				if (currentPage > 0) {
					backPageButton.setDisabled(false);
				}

				if (currentPage > 1) {
					firstPageButton.setDisabled(false);
				}

				if (currentPage < paginatedLogs.totalPages - 1) {
					nextPageButton.setDisabled(false);
				}

				if (currentPage < paginatedLogs.totalPages - 2) {
					lastPageButton.setDisabled(false);
				}
			}

			row.addComponents(firstPageButton, backPageButton, nextPageButton, lastPageButton, exitPageButton);

			await i.editReply({ embeds: [ testEmbed ], components: [row] });

		});

	}

	generateFields(logs: Prisma.ModlogGetPayload<Prisma.ModlogDefaultArgs>[] | undefined): APIEmbedField[] {

		const fields: APIEmbedField[] = [];

		const fieldLayout = `- **Reason:** {{modlog_reason}}
- **Mod:** {{mod}}
- **Date:** {{date}}
- **Time:** {{time}}
{{end_time}}`;

		if (!logs) return fields;

		for (const modlog of logs) {

			const date = Temporal.Instant.from(modlog.date).epochSeconds;

			let fieldValueString = fieldLayout
				.replace('{{modlog_reason}}', modlog.reason)
				.replace('{{mod}}', modlog.modID)
				.replace('{{date}}', `<t:${date}:d>`)
				.replace('{{time}}', `<t:${date}:t>`);

			if (modlog.type == 'mute') {

				fieldValueString = fieldValueString.replace('{{end_time}}', `- **Mute End:**\n - **Date:** <t:${date}:d>\n - **Time:** <t:${date}:t>`);

			}

			fieldValueString = fieldValueString.replace('{{end_time}}', '');

			fields.push({
				name: `Case #${modlog.caseNum} | ${modlog.type}`,
				value: fieldValueString,
				inline: true,
			});

		}

		return fields;

	}

	async logging(interaction: ChatInputCommandInteraction) {

		switch (interaction.options.getSubcommand(true)) {
		case 'show':
			await this.loggingShow(interaction);
			break;
		case 'edit':
			await this.loggingEdit(interaction);
			break;
		}

	}

	async loggingShow(interaction: ChatInputCommandInteraction) {

		const server = await this.client.db.server.findUnique({
			where: {
				id: interaction.guild?.id,
			},
			include: {
				config: true,
			},
		});

		const totalModCount = await this.client.db.modlog.count({
			where: {
				serverID: interaction.guild?.id,
			},
		});

		const totalBanUnban = await this.client.db.modlog.count({
			where: {
				serverID: interaction.guild?.id,
				OR: [
					{ type: 'ban' },
					{ type: 'unban' },
				],
			},
		});

		const totalKickMute = await this.client.db.modlog.count({
			where: {
				serverID: interaction.guild?.id,
				OR: [
					{ type: 'kick' },
					{ type: 'mute' },
				],
			},
		});

		const totalWarn = await this.client.db.modlog.count({
			where: {
				serverID: interaction.guild?.id,
				type: 'warn',
			},
		});

		if (!server || !server.config) {
			await interaction.reply('to-do');
			return;
		}

		const loggingSettings = new EmbedBuilder()
			.setAuthor({ name: '⚙ | Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.addFields(
				{
					name: '> 🗞️ Log Categories:',
					value: `**\`\`\`diff
					Bans/Unbans:
${server.config.modlog_ban ? '+ Enabled' : '- Disabled'}
					Kicks:
${server.config.modlog_kick_mute ? '+ Enabled' : '- Disabled'}
					Warn/Mutes:
${server.config.modlog_warn ? '+ Enabled' : '- Disabled'}
					\`\`\`**`,
					inline: true,
				},
				{
					name: '> ⚙ General Settings:',
					value: `* Modlog Channel: <#${server.config.modlog_chan}>`,
					inline: true,
				},
				{
					name: '> 🚉 Statistics:',
					value: `* Total Events Logged: \`${totalModCount}\`\n* Total Ban/Unban Events: \`${totalBanUnban}\`\n* Total Kick/Mute Events: \`${totalKickMute}\`\n* Total Warn Events: \`${totalWarn}\``,
					inline: true,
				},
			)
			.setTimestamp()
			.setColor('Blue');

		await interaction.reply({ embeds : [ loggingSettings ] });

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

		const banCatButton = new ButtonBuilder()
			.setCustomId('modlog_ban')
			.setLabel('Ban/Unban Logs')
			.setStyle(server.config['modlog_ban'] ? ButtonStyle.Success : ButtonStyle.Secondary);

		const kickMuteCatButton = new ButtonBuilder()
			.setCustomId('modlog_kick_mute')
			.setLabel('Kick/Mute Logs')
			.setStyle(server.config['modlog_kick_mute'] ? ButtonStyle.Success : ButtonStyle.Secondary);

		const warnCatButton = new ButtonBuilder()
			.setCustomId('modlog_warn')
			.setLabel('Warn Logs')
			.setStyle(server.config['modlog_warn'] ? ButtonStyle.Success : ButtonStyle.Secondary);

		const collectorFilter = (i: MessageComponentInteraction) => {
			return i.user.id === interaction.user.id;
		};

		if (!setting && value === null) {

			const toggleCatEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setTitle('Edit Logging Settings')
				.setDescription('Please use the buttons below to toggle any of the logging categories.')
				.setColor('Blue');

			const actionRow = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(banCatButton, kickMuteCatButton, warnCatButton, exitButton);

			const msg = await interaction.reply({
				embeds: [ toggleCatEmbed ],
				components: [ actionRow ],
				ephemeral: true,
			});

			const userInteraction = await msg.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 60_000 });

			const embedInfo = categoryInfo[userInteraction.customId as keyof typeof categoryInfo];
			currentSetting = server.config[userInteraction.customId as ConfigFields];

			const toggleEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setDescription(`${embedInfo.title} are now **${!currentSetting ? 'Enabled' : 'Disabled'}**`)
				.setColor(!currentSetting ? 'Green' : 'Red');

			await this.client.db.server.update({
				where: {
					id: interaction.guild?.id,
				},
				data: {
					config: {
						update: {
							[userInteraction.customId as ConfigFields]: !currentSetting,
						},
					},
				},
				include: {
					config: true,
				},
			});

			await userInteraction.deferUpdate();
			await userInteraction.editReply({ embeds: [ toggleCatEmbed, toggleEmbed ], components: [] });

		}
		else if (setting && value === null) {

			const toggleButton = new ButtonBuilder()
				.setCustomId('edit_toggle')
				.setLabel('Toggle Setting')
				.setStyle(currentSetting ? ButtonStyle.Success : ButtonStyle.Secondary);

			const actionRow = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(toggleButton, exitButton);

			const embedInfo = categoryInfo[setting as keyof typeof categoryInfo];

			const changeSettingValue = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setTitle(embedInfo.title)
				.setDescription(`${embedInfo.desc}\n\n**Current Status:** ${currentSetting ? 'Enabled' : 'Disabled'}`)
				.setColor(currentSetting ? 'Green' : 'Red');

			const msg = await interaction.reply({
				embeds: [ changeSettingValue ],
				components: [ actionRow ],
				ephemeral: true,
			});

			const userInteraction = await msg.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 60_000 });

			const toggleEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setDescription(`${embedInfo.title} are now **${!currentSetting ? 'Enabled' : 'Disabled'}**`)
				.setColor(!currentSetting ? 'Green' : 'Red');

			await this.client.db.server.update({
				where: {
					id: interaction.guild?.id,
				},
				data: {
					config: {
						update: {
							[setting as ConfigFields]: !currentSetting,
						},
					},
				},
				include: {
					config: true,
				},
			});

			await userInteraction.deferUpdate();
			await userInteraction.editReply({ embeds: [ changeSettingValue, toggleEmbed ], components: [] });

		}
		else if (!setting && value !== null) {

			const toggleCatEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setTitle('Edit Logging Settings')
				.setDescription('Please use the buttons below to toggle any of the logging categories.')
				.setColor('Blue');

			const actionRow = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(banCatButton, kickMuteCatButton, warnCatButton, exitButton);

			const msg = await interaction.reply({
				embeds: [ toggleCatEmbed ],
				components: [ actionRow ],
				ephemeral: true,
			});

			const userInteraction = await msg.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 60_000 });

			const embedInfo = categoryInfo[userInteraction.customId as keyof typeof categoryInfo];

			const toggleEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Settings', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setDescription(`${embedInfo.title} are now **${value ? 'Enabled' : 'Disabled'}**`)
				.setColor(value ? 'Green' : 'Red');

			await this.client.db.server.update({
				where: {
					id: interaction.guild?.id,
				},
				data: {
					config: {
						update: {
							[userInteraction.customId as ConfigFields]: value,
						},
					},
				},
				include: {
					config: true,
				},
			});

			await userInteraction.deferUpdate();
			await userInteraction.editReply({ embeds: [ toggleCatEmbed, toggleEmbed ], components: [] });

		}


	}

}