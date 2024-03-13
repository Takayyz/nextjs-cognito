import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login(): JSX.Element {
  return (
    <div className="flex justify-center items-center flex-col h-screen text-center">
      <h1 className="text-3xl">Login</h1>
      <form className="mt-5 grid gap-4 w-full max-w-xl">
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button>Login</Button>
      </form>
    </div>
  );
};
