import { Event } from "../types.js";
import { Events, Interaction } from "discord.js";

export default class InteractionCreateEvent extends Event {

    constructor() {
        super(Events.InteractionCreate, false);
    }

    async execute(interaction: Interaction) {

        if (!interaction.isCommand()) return;

        const command = this.client.commands.get(interaction.commandName);

        await command?.execute(interaction);

    }

}