import 'next-auth';

declare module 'next-auth' {
  interface Session {
    idToken?: string;
    accessToken?: string;
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
    expiresIn?: number;
    console?: string;
  };
};
