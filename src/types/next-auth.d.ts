import 'next-auth';

interface UserWithId extends DefaultSession["user"] {
  id?: string;
}

declare module 'next-auth' {
  interface Session {
    idToken?: string;
    accessToken?: string;
    uesr: UserWithId;
    error?: String;
  };

  interface User {
    id?: string;
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    user: UserWithId;
    expiresIn?: number;
    console?: string;
  };
};
