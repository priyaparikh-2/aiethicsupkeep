-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceCategory" TEXT NOT NULL,
    "homepageUrl" TEXT,
    "rssUrl" TEXT,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "author" TEXT,
    "publicationDate" TIMESTAMP(3),
    "sourceId" TEXT NOT NULL,
    "isPreprint" BOOLEAN NOT NULL DEFAULT false,
    "isPeerReviewed" BOOLEAN,
    "primarySourceUrl" TEXT,
    "primarySourceLabel" TEXT,
    "extractedText" TEXT,
    "developmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Development" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Development_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentTag" (
    "developmentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "DevelopmentTag_pkey" PRIMARY KEY ("developmentId","tagId")
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "stateOfConversation" TEXT NOT NULL,
    "signalBeyondHeadlines" TEXT NOT NULL,
    "researchProvocations" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingDevelopment" (
    "briefingId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "BriefingDevelopment_pkey" PRIMARY KEY ("briefingId","developmentId")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SAVED',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "libraryItemId" TEXT NOT NULL,
    "exactPassage" TEXT NOT NULL,
    "surroundingContext" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "annotation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "libraryItemId" TEXT,
    "highlightId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteTag" (
    "noteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "NoteTag_pkey" PRIMARY KEY ("noteId","tagId")
);

-- CreateTable
CREATE TABLE "NoteDevelopmentLink" (
    "noteId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,

    CONSTRAINT "NoteDevelopmentLink_pkey" PRIMARY KEY ("noteId","developmentId")
);

-- CreateTable
CREATE TABLE "IdeaConstellation" (
    "id" TEXT NOT NULL,
    "centralQuestion" TEXT NOT NULL,
    "themeTags" TEXT NOT NULL,
    "possibleArgument" TEXT,
    "whyNow" TEXT,
    "evidenceIds" TEXT NOT NULL,
    "missingResearch" TEXT,
    "counterargument" TEXT,
    "openingQuestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeaConstellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "whatChanged" TEXT NOT NULL,
    "theConversation" TEXT NOT NULL,
    "whereStakeholdersDisagree" TEXT NOT NULL,
    "whatDisappeared" TEXT NOT NULL,
    "yourWeekOfThinking" TEXT NOT NULL,
    "emergingThreads" TEXT NOT NULL,
    "possibleArticle" TEXT NOT NULL,
    "watchNextWeek" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReviewDevelopment" (
    "weeklyReviewId" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,

    CONSTRAINT "WeeklyReviewDevelopment_pkey" PRIMARY KEY ("weeklyReviewId","developmentId")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "deliveryTime" TEXT NOT NULL DEFAULT '07:00',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "recipientEmail" TEXT,
    "weeklyReviewDay" TEXT NOT NULL DEFAULT 'FRIDAY',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentTag" ADD CONSTRAINT "DevelopmentTag_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentTag" ADD CONSTRAINT "DevelopmentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingDevelopment" ADD CONSTRAINT "BriefingDevelopment_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingDevelopment" ADD CONSTRAINT "BriefingDevelopment_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteTag" ADD CONSTRAINT "NoteTag_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteTag" ADD CONSTRAINT "NoteTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDevelopmentLink" ADD CONSTRAINT "NoteDevelopmentLink_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDevelopmentLink" ADD CONSTRAINT "NoteDevelopmentLink_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReviewDevelopment" ADD CONSTRAINT "WeeklyReviewDevelopment_weeklyReviewId_fkey" FOREIGN KEY ("weeklyReviewId") REFERENCES "WeeklyReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReviewDevelopment" ADD CONSTRAINT "WeeklyReviewDevelopment_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE CASCADE ON UPDATE CASCADE;
