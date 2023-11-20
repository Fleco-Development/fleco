import { PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Temporal } from '@js-temporal/polyfill';
import { Command } from '../../types.js';
import { nanoid } from 'nanoid';

export default class KickCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('kick')
				.setDescription('Kicks a user from the server.')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('User to kick'),
				)
				.addStringOption(option =>
					option
						.setName('reason')
						.setDescription('Reason for kick')
						.setMaxLength(300),
				)
				.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const memberFetch = interaction.options.getUser('user', true);
		const member = await interaction.guild?.members.fetch(memberFetch.id);

		if (!member) {

			const memberNoExist = new EmbedBuilder()
				.setDescription('Member is not in the server!')
				.setColor('Red');

			await interaction.reply({ embeds: [ memberNoExist ], ephemeral: true });
			return;

		}

		const reason = interaction.options.getString('reason', false);

		if (!member?.kickable) {

			const cannotKickEmbed = new EmbedBuilder()
				.setDescription('Cannot kick user, please check the bot permissions/hierarchy')
				.setColor('Red');

			await interaction.reply({ embeds: [ cannotKickEmbed ], ephemeral: true });
			return;

		}

		await member.kick(reason ? `${reason} - ${interaction.member?.user.username}` : `Kicked by ${interaction.member?.user.username}`);

		const date = Temporal.Now.instant();

		const server = await this.client.db.server.findFirst({
			where: {
				id: interaction.guild?.id,
			},
			include: {
				config: true,
				modlogs: true,
			},
		});

		let msg;

		if (server?.config?.modlog_chan) {

			const kickEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Modlog', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setTitle('Event - User Kick')
				.addFields(
					{
						name: 'User Info:',
						value: `- **ID:** ${member.user.id}\n- **Username:** ${member.user.username}`,
						inline: true,
					},
					{
						name: 'Mod Info:',
						value: `- **ID:** ${interaction.member?.user.id}\n- **Username:** ${interaction.member?.user.username}`,
						inline: true,
					},
					{
						name: 'Info:',
						value: `- **Reason:** ${reason ?? 'none'}\n- **Date:** <t:${date.epochSeconds}:f>`,
					},
				)
				.setFooter({ text: `Case Number: ${server.modlogs.length + 1}` })
				.setColor('Gold');

			const modlogChan = await interaction.guild?.channels.fetch(server.config.modlog_chan);

			if (!modlogChan || !modlogChan.isTextBased()) return;

			msg = await modlogChan.send({ embeds: [ kickEmbed ] });

		}

		await this.client.db.modlog.create({
			data: {
				id: nanoid(),
				serverID: interaction.guild!.id,
				type: 'kick',
				reason: reason ?? 'None',
				userID: member.user.id,
				modID: interaction.member!.user.id,
				date: date.toString(),
				caseNum: server!.modlogs.length + 1,
				logMsgID: msg?.id,
			},
		});

		const kickEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setDescription(`Kicked <@${member?.user.id}> `)
			.setColor('Blue');

		await interaction.reply({ embeds: [ kickEmbed ], ephemeral: true });

	}

}