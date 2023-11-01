import { ChatInputCommandInteraction, EmbedBuilder, GuildNSFWLevel, GuildVerificationLevel, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';
import { Temporal } from '@js-temporal/polyfill';

type VerificationLevel = {
	[Key in GuildVerificationLevel]: { title: string, requirements: string };
}

type NsfwLevel = {
	[Key in GuildNSFWLevel]: string;
}

const NsfwLevels: NsfwLevel = {
	0: 'Default',
	1: 'Explicit',
	2: 'Safe',
	3: 'Age Restricted',
};

const VerificationLevels: VerificationLevel = {
	0: {
		title: 'None',
		requirements: 'None',
	},
	1: {
		title: 'Low',
		requirements: 'Must have a verified email.',
	},
	2: {
		title: 'Medium',
		requirements: 'Must be registered for more than 5 minutes.',
	},
	3: {
		title: 'High',
		requirements: 'Must be a member for more than 10 minutes.',
	},
	4: {
		title: 'Very High',
		requirements: 'Must have a verified phone number.',
	},
};

export default class ServerInfoCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('serverinfo')
				.setDescription('Get information about the current server.')
				.setDMPermission(false),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const createDate = Temporal.Instant.fromEpochMilliseconds(interaction.guild!.createdTimestamp).epochSeconds;
		const ownerInfo = await interaction.guild?.fetchOwner();

		const totalText = interaction.guild?.channels.cache.filter(ch => ch.isTextBased() && !ch.isThread()).size as number;
		const totalVoice = interaction.guild?.channels.cache.filter(ch => ch.isVoiceBased()).size as number;

		const totalUsers = interaction.guild?.members.cache.filter(m => !m.user.bot).size as number;
		const totalBots = interaction.guild?.members.cache.filter(m => m.user.bot).size as number;

		const totalPremiumRoles = interaction.guild?.roles.cache.filter(r => r.tags?.availableForPurchase).size as number;
		const totalIntegrationRoles = interaction.guild?.roles.cache.filter(r => r.tags?.botId || r.tags?.integrationId).size as number;
		const totalLinkedRoles = interaction.guild?.roles.cache.filter(r => r.tags?.guildConnections).size as number;

		const verificationLevel = VerificationLevels[interaction.guild?.verificationLevel as GuildVerificationLevel];
		const nsfwLevel = NsfwLevels[interaction.guild?.nsfwLevel as GuildNSFWLevel];

		const serverEmbed = new EmbedBuilder()
			.setTitle(`Info for ${interaction.guild?.name}`)
			.setDescription(`Owner: ${ownerInfo?.user.username} (${ownerInfo?.id})\nCreated: <t:${createDate}:F>${interaction.guild?.icon ? `\n\n**[Icon Link (WebP)](${interaction.guild.iconURL({ extension: 'webp' })})** | **[Icon Link (PNG)](${interaction.guild?.iconURL({ extension: 'png' })})**` : ''}`)
			.addFields(
				{
					name: `Total Channels: ${totalText + totalVoice}`,
					value: `- **Text:** ${totalText}\n- **Voice:** ${totalVoice}`,
					inline: true,
				},
				{
					name: `Total Members: ${totalUsers + totalBots}`,
					value: `- **Users:** ${totalUsers}\n- **Bots**: ${totalBots}`,
					inline: true,
				},
				{
					name: `Total Roles: ${interaction.guild?.roles.cache.size}`,
					value: `- **Premium:** ${totalPremiumRoles}\n- **Integration/Bot:** ${totalIntegrationRoles}\n- **Linked:** ${totalLinkedRoles}`,
					inline: true,
				},
				{
					name: 'Verification Level:',
					value: `- **Type**: ${verificationLevel.title}\n- **Requirements:** ${verificationLevel.requirements}`,
				},
				{
					name: 'NSFW Level:',
					value: `- **Type:** ${nsfwLevel}`,
				},
			)
			.setColor('Blue')
			.setTimestamp();

		if (interaction.guild?.icon) {
			serverEmbed.setThumbnail(interaction.guild.iconURL({ extension: 'webp' }));
		}

		await interaction.reply({ embeds: [ serverEmbed ] });

	}

}