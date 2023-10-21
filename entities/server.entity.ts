import { Collection, Entity, OneToMany, PrimaryKey } from "@mikro-orm/core";
import { Modlog } from "./modlog.entity.js";

@Entity()
export class Server {

    @PrimaryKey()
    id!: string;

    @OneToMany(() => Modlog, modlog => modlog.server)
    modlog = new Collection<Modlog>(this);

}