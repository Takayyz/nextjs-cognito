'use client';

// import { authenticate } from "@/app/login/actions";
import { signOut } from '@/auth';

export const LoginButton = () => {
  const handleLogin = () => console.log('clicked sign in');

  return (
    <button
      className="mt-4 bg-blue-500 hover:bg-blue-300 active:scale-90 transition-all duration-200 text-white py-2 px-4 rounded-full mx-auto"
      onClick={handleLogin}
    >
      Sign in
    </button>
  );
};

export const LogoutButton = () => (
  <button
    className="mt-4 bg-red-500 hover:bg-red-300 active:scale-90 transition-all duration-200 text-white py-2 px-4 rounded-full mx-auto"
    onClick={() => signOut({ callbackUrl: '/login' })}
  >
    Sign out
  </button>
);
