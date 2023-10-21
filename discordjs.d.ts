import type { PostgreSqlDriver } from "@mikro-orm/postgresql";
import type { MikroORM } from "@mikro-orm/core";
import type { Command } from "./types.ts";

declare module "discord.js" {
    interface Client {
        public static commands: Map<string, Command>;
        public static commandDir: string;
        public db: MikroORM<PostgreSqlDriver>
    }
}