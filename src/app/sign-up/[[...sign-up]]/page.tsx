import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f6f7] px-4 py-10">
      <SignUp path="/sign-up" routing="path" />
    </main>
  );
}
