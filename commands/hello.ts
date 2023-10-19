import { Command } from "../types.js";
import { CommandInteraction } from "discord.js";

export default class TestStruct extends Command {

    constructor() {
        super({
            name: "hello",
            description: "testing"
        })
    }

    async execute(_: CommandInteraction): Promise<void> {
        
    }

}