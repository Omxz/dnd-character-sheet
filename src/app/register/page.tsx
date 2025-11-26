import { AuthForm } from "@/components/auth";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
