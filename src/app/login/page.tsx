'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";
import { authenticate } from "./actions";

export default function LoginPage(): JSX.Element {
  const [errorMessage, dispatch] = useFormState(authenticate, true);

  return (
    <div className="flex justify-center items-center flex-col h-screen text-center">
      <h1 className="text-3xl">Login</h1>
      <form action={dispatch} className="mt-5 grid gap-4 w-full max-w-xl">
        <Input type="email" name="email" placeholder="Email" />
        <Input type="password" name="password" placeholder="Password" />
        <Button>Login</Button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};
