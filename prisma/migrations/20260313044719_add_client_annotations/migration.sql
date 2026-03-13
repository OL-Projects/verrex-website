-- CreateTable
CREATE TABLE "ClientAnnotation" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "attachmentUrls" TEXT,
    "activityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientAnnotation_activityId_idx" ON "ClientAnnotation"("activityId");

-- CreateIndex
CREATE INDEX "ClientAnnotation_projectId_idx" ON "ClientAnnotation"("projectId");

-- CreateIndex
CREATE INDEX "ClientAnnotation_authorId_idx" ON "ClientAnnotation"("authorId");

-- AddForeignKey
ALTER TABLE "ClientAnnotation" ADD CONSTRAINT "ClientAnnotation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ProjectActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAnnotation" ADD CONSTRAINT "ClientAnnotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAnnotation" ADD CONSTRAINT "ClientAnnotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
