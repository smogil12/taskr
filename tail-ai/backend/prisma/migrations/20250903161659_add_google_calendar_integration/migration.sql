-- AddGoogleCalendarIntegration
ALTER TABLE "users" ADD COLUMN "googleCalendarConnected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "googleAccessToken" TEXT;
ALTER TABLE "users" ADD COLUMN "googleRefreshToken" TEXT;
ALTER TABLE "tasks" ADD COLUMN "calendarEventId" TEXT;
ALTER TABLE "tasks" ADD COLUMN "calendarEventUrl" TEXT;
