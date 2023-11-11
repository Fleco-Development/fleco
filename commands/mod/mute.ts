import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { Duration } from '@fleco/duration';
import { Command } from '../../types.js';
import { nanoid } from 'nanoid';
import { Temporal } from '@js-temporal/polyfill';

export default class MuteCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('mute')
				.setDescription('Mutes a user in a server')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription('User to mute')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('duration')
						.setDescription('Duration of mute')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('reason')
						.setDescription('Reason for mute')
						.setMaxLength(300),
				)
				.setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const memberFetch = interaction.options.getUser('user', true);
		const member = await interaction.guild?.members.fetch(memberFetch.id);

		const reason = interaction.options.getString('reason', false);

		const durString = interaction.options.getString('duration', true);
		let duration;

		if (member?.isCommunicationDisabled()) {

			const alrMutedEmbed = new EmbedBuilder()
				.setDescription('User is already muted!')
				.setColor('Red');

			await interaction.reply({ embeds: [ alrMutedEmbed ], ephemeral: true });
			return;

		}

		try {

			duration = new Duration(durString);

		}
		catch {

			const invalidDurEmbed = new EmbedBuilder()
				.setTitle('Invalid duration')
				.setDescription(`Invalid Duration Format: \`${durString}\` please use a format like this: \`1h\`, \`1h 30m\`, etc...`)
				.setColor('Red');

			await interaction.reply({ embeds: [ invalidDurEmbed ], ephemeral: true });
			return;

		}

		try {

			await member?.disableCommunicationUntil(duration.endDate(), reason ? `${reason} - ${interaction.member?.user.username}` : `Timed out by ${interaction.member?.user.username}`);

		}
		catch {

			const cannotMuteEmbed = new EmbedBuilder()
				.setDescription('Cannot mute user, please check the bot permissions/hierarchy')
				.setColor('Red');

			await interaction.reply({ embeds: [ cannotMuteEmbed ], ephemeral: true });
			return;


		}

		const totalModlogs = await this.client.db.modlog.count({
			where: {
				serverID: interaction.guild?.id,
			},
		});

		const endDate = Temporal.Now.instant().add(duration.duration);
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

		if (server!.config?.modlog_chan) {

			const muteEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Fleco Modlog', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
				.setTitle('Event - User Mute')
				.addFields(
					{
						name: 'User Info:',
						value: `- **ID:** ${member?.user.id}\n- **Username:** ${member?.user.username}`,
						inline: true,
					},
					{
						name: 'Mod Info:',
						value: `- **ID:** ${interaction.member?.user.id}\n- **Username:** ${interaction.member?.user.username}`,
						inline: true,
					},
					{
						name: 'Info:',
						value: `- **Reason:** ${reason ?? 'None'}\n- **Muted Until:** <t:${endDate.epochSeconds}:F> **][** <t:${endDate.epochSeconds}:R>\n- **Date:** <t:${date.epochSeconds}:f>`,
					},
				)
				.setFooter({ text: `Case Number: ${server!.modlogs.length + 1}` })
				.setColor('Gold');

			const modlogChan = await interaction.guild?.channels.fetch(server!.config.modlog_chan);

			if (!modlogChan || !modlogChan.isTextBased()) return;

			msg = await modlogChan.send({ embeds: [ muteEmbed ] });

		}

		await this.client.db.modlog.create({
			data: {
				id: nanoid(),
				serverID: interaction.guild!.id,
				type: 'mute',
				reason: reason ?? 'None',
				userID: member!.user.id,
				modID: interaction.member!.user.id,
				date: date.toString(),
				endDate: endDate.toString(),
				caseNum: totalModlogs + 1,
				logMsgID: msg?.id ?? null,
			},
		});

		const muteEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setDescription(`Muted <@${member?.user.id}> for ${duration.toString()}`)
			.setColor('Blue');

		await interaction.reply({ embeds: [ muteEmbed ], ephemeral: true });

	}

}