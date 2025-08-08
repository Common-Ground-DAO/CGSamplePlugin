-- CreateTable
CREATE TABLE "Airdrop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "airdropAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AirdropItem" (
    "address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "airdropId" INTEGER NOT NULL,

    PRIMARY KEY ("address", "airdropId"),
    CONSTRAINT "AirdropItem_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "Airdrop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MerkleTree" (
    "airdropId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" JSONB NOT NULL,
    CONSTRAINT "MerkleTree_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "Airdrop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vesting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "beneficiaryAddress" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTimeSeconds" INTEGER NOT NULL,
    "endTimeSeconds" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Airdrop_communityId_idx" ON "Airdrop"("communityId");

-- CreateIndex
CREATE INDEX "AirdropItem_airdropId_idx" ON "AirdropItem"("airdropId");

-- CreateIndex
CREATE INDEX "AirdropItem_address_idx" ON "AirdropItem"("address");

-- CreateIndex
CREATE INDEX "MerkleTree_airdropId_idx" ON "MerkleTree"("airdropId");

-- CreateIndex
CREATE INDEX "Vesting_beneficiaryAddress_idx" ON "Vesting"("beneficiaryAddress");

-- CreateIndex
CREATE INDEX "Vesting_communityId_idx" ON "Vesting"("communityId");

-- CreateIndex
CREATE INDEX "Vesting_startTimeSeconds_idx" ON "Vesting"("startTimeSeconds");

-- CreateIndex
CREATE INDEX "Vesting_endTimeSeconds_idx" ON "Vesting"("endTimeSeconds");
