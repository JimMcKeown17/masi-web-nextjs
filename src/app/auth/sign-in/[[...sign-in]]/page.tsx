import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn routing="path" path="/auth/sign-in" signUpUrl="/auth/sign-up" />
    </div>
  );
}
