import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types.js';

const answers = [
	'Yes.',
	'No.',
	'My sources say yes!',
	'Most likely.',
	'I don\'t know.',
	'Maybe, sometimes.',
	'Outlook is good.',
	'Sings point to yes.',
	'Definitely!',
	'Absolutely!',
	'Nope.',
	'No thanks, I won\'t be able to make it.',
	'No way!',
	'It\'s certain',
	'It\'s decidedly so.',
	'Without a doubt.',
	'Yes - definitely.',
	'You can rely on it.',
	'As I can see it, yes.',
];

export default class EightBallCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('8ball')
				.setDescription('Get the answer to anything.')
				.addStringOption((option) =>
					option
						.setName('question')
						.setDescription('What would you like to ask?')
						.setRequired(true)
						.setMaxLength(300),
				)
				.setDMPermission(false),
		);
	}

	async execute(interaction: CommandInteraction) {

		const question = interaction.options.get('question', true).value;

		const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

		const eightBallEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setTitle(`${interaction.member?.user.username} asks the magic 8-ball:`)
			.setDescription(`${question}`)
			.addFields({ name: 'The magic 8-ball says:', value: `${randomAnswer}` })
			.setTimestamp()
			.setColor('Blue');

		await interaction.reply({ embeds: [ eightBallEmbed ] });

	}

}