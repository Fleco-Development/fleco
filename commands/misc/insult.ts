import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types.js';

// Ones to grab if API call fails.
const failedInsults = [
	'Wow, the API knows you won\'t go far in life. So it didn\'t even bother getting an insult for you.',
	'No one should ever be ashamed with themselves. Except for you.',
	'Please stop, your giving the API nightmares.',
	'You must be desperate to get insulted. If you want to get insulted, go to your nearest McDonald\'s and be yourself.',
	'You are such an attention seeker, that you fake a mental illness on TikTok. Doesn\'t matter if people find out, attention is attention.',
	'Hey, I think you should stop referring that person as your "kitten", it\'s weird as hell.',
	'Go back to Reddit, and fuel your power trip there.',
	'Go and be a basic person, and order something from Starbucks.',
	'Why don\'t you go play Desert Bus, that way people don\'t have to deal with you for 8 hours.',
	'Instead of a insult, our API put a restraining order against you.',
	'Hey, no insult here. Just wanna say thank you for using Fleco',
	// INSULTS BELOW, GENERATED FROM EVILINSULT
	'Two wrongs don\'t make a right, take your parents as an example.',
	'I would ask how old you are, but I know you can\'t count that high.',
	'Some cause happiness wherever they go; others, whenever they go.',
	'You must have been born on a highway, because that\'s where most accidents happen.',
];

export default class InsultCommand extends Command {

	constructor() {
		super(
			new SlashCommandBuilder()
				.setName('insult')
				.setDescription('Let the bot insult you.'),
		);
	}

	async execute(interaction: CommandInteraction) {

		const insultEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Fleco', iconURL: this.client.user?.displayAvatarURL({ extension: 'webp' }) })
			.setFooter({ text: 'Powered by evilinsult.com' })
			.setTimestamp();

		try {

			const apiCall = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json');
			const apiData = await apiCall.json();

			insultEmbed.setColor('Blue');
			insultEmbed.setDescription(apiData.insult);

		}
		catch (err) {

			console.error(err);

			insultEmbed.setColor('Red');

			const randomInsult = failedInsults[Math.floor(Math.random() * failedInsults.length)] as string;
			insultEmbed.setDescription(randomInsult);

		}

		await interaction.reply({ embeds: [ insultEmbed ] });

	}

}