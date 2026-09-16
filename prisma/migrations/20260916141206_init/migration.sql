-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sourceCategory" TEXT NOT NULL,
    "homepageUrl" TEXT,
    "rssUrl" TEXT,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "author" TEXT,
    "publicationDate" DATETIME,
    "sourceId" TEXT NOT NULL,
    "isPreprint" BOOLEAN NOT NULL DEFAULT false,
    "isPeerReviewed" BOOLEAN,
    "primarySourceUrl" TEXT,
    "primarySourceLabel" TEXT,
    "extractedText" TEXT,
    "developmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Article_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Development" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "eventDate" DATETIME,
    "whatHappened" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "whereConversationStands" TEXT NOT NULL,
    "whoIsAffected" TEXT NOT NULL,
    "researchLens" TEXT,
    "questionUnderneath" TEXT,
    "newMediaForm" BOOLEAN NOT NULL DEFAULT false,
    "scoreResearchRelevance" INTEGER NOT NULL DEFAULT 0,
    "scoreConsequence" INTEGER NOT NULL DEFAULT 0,
    "scoreNovelty" INTEGER NOT NULL DEFAULT 0,
    "scoreEvidenceQuality" INTEGER NOT NULL DEFAULT 0,
    "scoreOriginalReporting" INTEGER NOT NULL DEFAULT 0,
    "scoreIntellectualGenerativity" INTEGER NOT NULL DEFAULT 0,
    "scoreTotal" INTEGER NOT NULL DEFAULT 0,
    "verificationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DevelopmentTag" (
    "developmentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("developmentId", "tagId"),
    CONSTRAINT "DevelopmentTag_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "stateOfConversation" TEXT NOT NULL,
    "signalBeyondHeadlines" TEXT NOT NULL,
    "researchProvocations" TEXT NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BriefingDevelopment" (
    "briefingId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    PRIMARY KEY ("briefingId", "developmentId"),
    CONSTRAINT "BriefingDevelopment_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BriefingDevelopment_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "developmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SAVED',
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LibraryItem_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "libraryItemId" TEXT NOT NULL,
    "exactPassage" TEXT NOT NULL,
    "surroundingContext" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "annotation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Highlight_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "libraryItemId" TEXT,
    "highlightId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Note_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoteTag" (
    "noteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("noteId", "tagId"),
    CONSTRAINT "NoteTag_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NoteTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoteDevelopmentLink" (
    "noteId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,

    PRIMARY KEY ("noteId", "developmentId"),
    CONSTRAINT "NoteDevelopmentLink_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NoteDevelopmentLink_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdeaConstellation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centralQuestion" TEXT NOT NULL,
    "themeTags" TEXT NOT NULL,
    "possibleArgument" TEXT,
    "whyNow" TEXT,
    "evidenceIds" TEXT NOT NULL,
    "missingResearch" TEXT,
    "counterargument" TEXT,
    "openingQuestion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "whatChanged" TEXT NOT NULL,
    "theConversation" TEXT NOT NULL,
    "whereStakeholdersDisagree" TEXT NOT NULL,
    "whatDisappeared" TEXT NOT NULL,
    "yourWeekOfThinking" TEXT NOT NULL,
    "emergingThreads" TEXT NOT NULL,
    "possibleArticle" TEXT NOT NULL,
    "watchNextWeek" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WeeklyReviewDevelopment" (
    "weeklyReviewId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,

    PRIMARY KEY ("weeklyReviewId", "developmentId"),
    CONSTRAINT "WeeklyReviewDevelopment_weeklyReviewId_fkey" FOREIGN KEY ("weeklyReviewId") REFERENCES "WeeklyReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeeklyReviewDevelopment_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "deliveryTime" TEXT NOT NULL DEFAULT '07:00',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "recipientEmail" TEXT,
    "weeklyReviewDay" TEXT NOT NULL DEFAULT 'FRIDAY',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE INDEX "Article_developmentId_idx" ON "Article"("developmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Briefing_date_key" ON "Briefing"("date");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryItem_developmentId_key" ON "LibraryItem"("developmentId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_weekStart_key" ON "WeeklyReview"("weekStart");
