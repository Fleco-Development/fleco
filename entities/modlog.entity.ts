import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Server } from "./server.entity.js";

@Entity()
export class Modlog {

    @PrimaryKey()
    id!: string;

    @Property()
    type!: "warn" | "ban" | "mute" | "unban";

    @Property()
    reason!: string;

    @Property()
    userID!: string;

    @Property()
    modID!: string;

    @ManyToOne(() => Server)
    server!: Server;

}