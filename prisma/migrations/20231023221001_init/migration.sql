-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modlog" (
    "id" TEXT NOT NULL,
    "caseNum" INTEGER NOT NULL,
    "serverID" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "modID" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "logMsgID" TEXT,

    CONSTRAINT "Modlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "serverID" TEXT NOT NULL,
    "modlog_chan" TEXT,
    "modlog_warn" BOOLEAN,
    "modlog_ban" BOOLEAN,
    "modlog_mute" BOOLEAN,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_serverID_key" ON "Config"("serverID");

-- AddForeignKey
ALTER TABLE "Modlog" ADD CONSTRAINT "Modlog_serverID_fkey" FOREIGN KEY ("serverID") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_serverID_fkey" FOREIGN KEY ("serverID") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
