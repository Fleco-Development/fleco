// import { Command } from "../../types.js";
import { readdirSync } from "node:fs";

export async function loadCommands(commandDir: string): Promise<void> { //: Promise<Map<string, Command>> {


    const commandFiles = readdirSync(commandDir);

    console.log(commandFiles);

}