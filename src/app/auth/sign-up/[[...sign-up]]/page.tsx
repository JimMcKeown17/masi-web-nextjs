import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp routing="path" path="/auth/sign-up" signInUrl="/auth/sign-in" />
    </div>
  );
}
