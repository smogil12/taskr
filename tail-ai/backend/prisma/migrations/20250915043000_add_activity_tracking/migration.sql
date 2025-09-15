-- AddActivityTracking
-- Add activity tracking fields to tasks table
ALTER TABLE "tasks" ADD COLUMN "lastEditedBy" TEXT;
ALTER TABLE "tasks" ADD COLUMN "lastEditedAt" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "createdBy" TEXT;

-- Add activity tracking fields to projects table  
ALTER TABLE "projects" ADD COLUMN "lastEditedBy" TEXT;
ALTER TABLE "projects" ADD COLUMN "lastEditedAt" TIMESTAMP(3);

-- Add activity tracking fields to clients table
ALTER TABLE "clients" ADD COLUMN "lastEditedBy" TEXT;
ALTER TABLE "clients" ADD COLUMN "lastEditedAt" TIMESTAMP(3);

-- Add foreign key constraints for tasks
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lastEditedBy_fkey" FOREIGN KEY ("lastEditedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraints for projects
ALTER TABLE "projects" ADD CONSTRAINT "projects_lastEditedBy_fkey" FOREIGN KEY ("lastEditedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraints for clients
ALTER TABLE "clients" ADD CONSTRAINT "clients_lastEditedBy_fkey" FOREIGN KEY ("lastEditedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
