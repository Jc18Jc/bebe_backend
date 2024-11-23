-- CreateTable
CREATE TABLE `Baby` (
    `babyId` INTEGER NOT NULL AUTO_INCREMENT,
    `babyName` VARCHAR(191) NOT NULL DEFAULT '익명이',
    `babySex` INTEGER NOT NULL DEFAULT 0,
    `babyBirthday` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `height` DOUBLE NOT NULL DEFAULT 0,
    `weight` DOUBLE NOT NULL DEFAULT 0,
    `imageUrl` VARCHAR(255) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`babyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` BINARY(16) NOT NULL,
    `userName` VARCHAR(191) NOT NULL DEFAULT '익명',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_uuid_key`(`uuid`),
    INDEX `User_uuid_idx`(`uuid`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBaby` (
    `userUuid` BINARY(16) NOT NULL,
    `babyId` INTEGER NOT NULL,
    `role` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userUuid`, `babyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Record` (
    `recordId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `memo` VARCHAR(1023) NOT NULL DEFAULT '',
    `imageUrl` VARCHAR(255) NOT NULL DEFAULT '',
    `originalImageUrl` VARCHAR(255) NOT NULL DEFAULT '',
    `babyId` INTEGER NOT NULL,
    `attribute` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Record_babyId_type_startTime_idx`(`babyId`, `type`, `startTime`),
    INDEX `Record_babyId_type_endTime_idx`(`babyId`, `type`, `endTime`),
    INDEX `Record_babyId_startTime_endTime_idx`(`babyId`, `startTime`, `endTime`),
    INDEX `Record_babyId_type_idx`(`babyId`, `type`),
    PRIMARY KEY (`recordId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Auth` (
    `authId` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `uuid` BINARY(16) NOT NULL,
    `refreshToken` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Auth_uuid_key`(`uuid`),
    UNIQUE INDEX `Auth_email_provider_key`(`email`, `provider`),
    PRIMARY KEY (`authId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Analysis` (
    `analysisId` INTEGER NOT NULL AUTO_INCREMENT,
    `babyAgeInDays` INTEGER NOT NULL,
    `babyRecentMeals` VARCHAR(191) NOT NULL,
    `parentConcerns` VARCHAR(500) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `colorEvaluation` VARCHAR(1000) NOT NULL,
    `texture` VARCHAR(191) NOT NULL,
    `textureEvaluation` VARCHAR(1000) NOT NULL,
    `specialObservations` VARCHAR(191) NOT NULL,
    `specialObservationsEvaluation` VARCHAR(1000) NOT NULL,
    `comprehensiveAssessment` VARCHAR(1500) NOT NULL,
    `result` JSON NOT NULL,
    `recordId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Analysis_recordId_key`(`recordId`),
    INDEX `Analysis_recordId_idx`(`recordId`),
    PRIMARY KEY (`analysisId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invite` (
    `inviteId` INTEGER NOT NULL AUTO_INCREMENT,
    `inviteCode` INTEGER NOT NULL,
    `babyId` INTEGER NOT NULL,
    `deadline` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invite_inviteCode_key`(`inviteCode`),
    PRIMARY KEY (`inviteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Csc` (
    `cscId` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `content` VARCHAR(1023) NOT NULL DEFAULT '',
    `isSolve` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Csc_isSolve_idx`(`isSolve`),
    PRIMARY KEY (`cscId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prefer` (
    `preferId` INTEGER NOT NULL AUTO_INCREMENT,
    `babyId` INTEGER NOT NULL,
    `foodId` INTEGER NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Prefer_babyId_foodId_key`(`babyId`, `foodId`),
    PRIMARY KEY (`preferId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalysisReport` (
    `reportId` INTEGER NOT NULL AUTO_INCREMENT,
    `babyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dailyFeedingAmount` TEXT NOT NULL,
    `feedingFrequencyAndInterval` TEXT NOT NULL,
    `feedingScore` INTEGER NOT NULL,
    `dailySleepAmount` TEXT NOT NULL,
    `sleepCycle` TEXT NOT NULL,
    `sleepFeedingCorrelation` TEXT NOT NULL,
    `sleepScore` INTEGER NOT NULL,
    `stoolColorAndTexture` TEXT NOT NULL,
    `foodStoolRelation` TEXT NOT NULL,
    `digestiveHealthScore` INTEGER NOT NULL,
    `nutritionStatus` TEXT NOT NULL,
    `sleepDevelopmentRelation` TEXT NOT NULL,
    `digestiveHealthPrediction` TEXT NOT NULL,
    `overallHealthRecommendation` TEXT NOT NULL,
    `overallHealthScore` INTEGER NOT NULL,

    INDEX `AnalysisReport_babyId_idx`(`babyId`),
    PRIMARY KEY (`reportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refresh` (
    `refreshId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Refresh_token_key`(`token`),
    INDEX `Refresh_userUuid_idx`(`userUuid`),
    INDEX `Refresh_token_idx`(`token`),
    PRIMARY KEY (`refreshId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlackList` (
    `blacListId` INTEGER NOT NULL AUTO_INCREMENT,
    `refreshOrUuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BlackList_refreshOrUuid_key`(`refreshOrUuid`),
    INDEX `BlackList_refreshOrUuid_idx`(`refreshOrUuid`),
    PRIMARY KEY (`blacListId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inquiry` (
    `inquiryId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `content` VARCHAR(400) NOT NULL DEFAULT '',
    `reply` VARCHAR(400) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Inquiry_userUuid_idx`(`userUuid`),
    PRIMARY KEY (`inquiryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `roomId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'chatting room',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Room_userUuid_idx`(`userUuid`),
    PRIMARY KEY (`roomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `messageId` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `isUser` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `encryptedContent` LONGBLOB NOT NULL,

    INDEX `Message_roomId_idx`(`roomId`),
    PRIMARY KEY (`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GeneralSajuAnalysis` (
    `sajuId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `analysisResult` JSON NOT NULL,
    `type` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GeneralSajuAnalysis_userUuid_idx`(`userUuid`),
    INDEX `GeneralSajuAnalysis_type_idx`(`type`),
    PRIMARY KEY (`sajuId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Device` (
    `deviceId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `deviceToken` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'ko',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Device_deviceToken_key`(`deviceToken`),
    INDEX `Device_language_idx`(`language`),
    PRIMARY KEY (`deviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyReport` (
    `weeklyReportId` INTEGER NOT NULL AUTO_INCREMENT,
    `babyId` INTEGER NOT NULL,
    `report` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WeeklyReport_babyId_idx`(`babyId`),
    PRIMARY KEY (`weeklyReportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserContact` (
    `userContactid` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `inviteCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserContact_userUuid_key`(`userUuid`),
    UNIQUE INDEX `UserContact_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `UserContact_inviteCode_key`(`inviteCode`),
    PRIMARY KEY (`userContactid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventInvite` (
    `eventInviteId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `invitedEmail` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EventInvite_userUuid_idx`(`userUuid`),
    UNIQUE INDEX `EventInvite_invitedEmail_provider_key`(`invitedEmail`, `provider`),
    PRIMARY KEY (`eventInviteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MissionCompletion` (
    `missionCompletionId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `type` INTEGER NOT NULL,
    `completionDay` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MissionCompletion_userUuid_idx`(`userUuid`),
    UNIQUE INDEX `MissionCompletion_userUuid_type_completionDay_key`(`userUuid`, `type`, `completionDay`),
    PRIMARY KEY (`missionCompletionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Diary` (
    `diaryId` INTEGER NOT NULL AUTO_INCREMENT,
    `userUuid` BINARY(16) NOT NULL,
    `babyId` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `imageUrl` VARCHAR(255) NULL,
    `height` DOUBLE NOT NULL DEFAULT 0,
    `weight` DOUBLE NOT NULL DEFAULT 0,
    `diaryDate` VARCHAR(191) NOT NULL,
    `babyAge` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `isRealPublic` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Diary_userUuid_idx`(`userUuid`),
    INDEX `Diary_babyId_idx`(`babyId`),
    INDEX `Diary_diaryDate_idx`(`diaryDate`),
    INDEX `Diary_babyAge_idx`(`babyAge`),
    INDEX `Diary_isPublic_isRealPublic_idx`(`isPublic`, `isRealPublic`),
    PRIMARY KEY (`diaryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiaryTags` (
    `diaryTagId` INTEGER NOT NULL AUTO_INCREMENT,
    `diaryId` INTEGER NOT NULL,
    `tagName` VARCHAR(191) NOT NULL,

    INDEX `DiaryTags_diaryId_idx`(`diaryId`),
    INDEX `DiaryTags_tagName_idx`(`tagName`),
    UNIQUE INDEX `DiaryTags_diaryId_tagName_key`(`diaryId`, `tagName`),
    PRIMARY KEY (`diaryTagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserBaby` ADD CONSTRAINT `UserBaby_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBaby` ADD CONSTRAINT `UserBaby_babyId_fkey` FOREIGN KEY (`babyId`) REFERENCES `Baby`(`babyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analysis` ADD CONSTRAINT `Analysis_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `Record`(`recordId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiaryTags` ADD CONSTRAINT `DiaryTags_diaryId_fkey` FOREIGN KEY (`diaryId`) REFERENCES `Diary`(`diaryId`) ON DELETE RESTRICT ON UPDATE CASCADE;
