-- CreateTable
CREATE TABLE "Airport" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "departurePoint" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureTime" DATETIME NOT NULL,
    "arrivalTime" DATETIME NOT NULL,
    "company" TEXT NOT NULL,
    "impeded" BOOLEAN NOT NULL DEFAULT false,
    "redirected" BOOLEAN NOT NULL DEFAULT false,
    "redirectionReason" TEXT,
    CONSTRAINT "Flight_departurePoint_fkey" FOREIGN KEY ("departurePoint") REFERENCES "Airport" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_destination_fkey" FOREIGN KEY ("destination") REFERENCES "Airport" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL
);
