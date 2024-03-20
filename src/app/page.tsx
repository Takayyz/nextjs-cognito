import { LoginButton, LogoutButton } from "@/components/AuthButton";
import { IsLoggedin } from "@/components/IsLoggedin";

export default function Home(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Next.js w/ <br />NextAuth n Cognito</h1>
        <IsLoggedin />
        <LoginButton />
        <LogoutButton />
      </div>
    </main>
  );
}
