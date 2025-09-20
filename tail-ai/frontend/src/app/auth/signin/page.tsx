'use client';

import { SignInForm } from "@/components/forms/signin-form";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div>
      {message === 'password-reset-success' && (
        <div className="mx-auto w-[28rem] mt-4">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your password has been reset successfully! You can now sign in with your new password.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <SignInForm />
    </div>
  );
}

