-- AddAccountLockoutFields
ALTER TABLE "users" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "accountLockedUntil" TIMESTAMP(3);


