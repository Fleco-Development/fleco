import { Command } from "../../types.js";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { Client, RESTGetAPIApplicationCommandsResult, Routes } from "discord.js";


export async function loadCommands(client: Client): Promise<Map<string, Command>> {
   
    const currentAppCommands : RESTGetAPIApplicationCommandsResult = await client.rest.get(Routes.applicationCommands(client.application?.id!)) as RESTGetAPIApplicationCommandsResult;

    const commandMap: Map<string, Command> = new Map();

    const baseCmdDir = readdirSync(client.commandDir);

    for (const baseCmdDirFile of baseCmdDir) {

        const combinedDirs = path.join(client.commandDir, baseCmdDirFile)
        
        const fileInfo = statSync(combinedDirs)

        if (fileInfo.isDirectory()) {

            const categoryDir = readdirSync(combinedDirs).filter(file => process.versions.bun ? file.endsWith(".ts") : file.endsWith(".js"));

            for (const cmdFile of categoryDir) {

                const combinedCmdDir = path.join(combinedDirs, cmdFile);
                
                try {
                    const commandClass = await import(combinedCmdDir);

                    const command : Command = new commandClass.default();
                    command.filePath = combinedCmdDir;

                    const commandDataJSON = command.commandData.toJSON();

                    for(const currentAppCommand of currentAppCommands) {
                        
                        if(currentAppCommand.name === commandDataJSON.name) {
                            await client.rest.patch(Routes.applicationCommand(client.application?.id!, currentAppCommand.id), { body: commandDataJSON });
                            break;
                        }
                    }

                    commandMap.set(command.commandData.name, command);

                    await client.rest.post(Routes.applicationCommands(client.application?.id!), { body: commandDataJSON });

                } catch (e) {
                    console.log("Invalid command");
                    console.error(`error ${e}`);
                }


            }

        }

    }

    for(const currentAppCommand of currentAppCommands) {
        if(!commandMap.has(currentAppCommand.name)) {
            await client.rest.delete(Routes.applicationCommand(client.application?.id!, currentAppCommand.id))
        }
    }

    return commandMap;

}
