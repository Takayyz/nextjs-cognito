import CredentialsProvider from 'next-auth/providers/credentials';
import CognitoProvider from 'next-auth/providers/cognito';
import { JWT } from 'next-auth/jwt';
import { Issuer } from 'openid-client';
import {
  CognitoIdentityProvider,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypt from 'crypto';

import type { Account, NextAuthOptions, Session, User } from "next-auth";
import type { InitiateAuthCommandInput } from '@aws-sdk/client-cognito-identity-provider';

const cognitoProvider = CognitoProvider({
  clientId: process.env.COGNITO_CLIENT_ID ?? '',
  clientSecret: process.env.COGNITO_CLIENT_SECRET ?? '',
  issuer: process.env.COGNITO_ISSUER,
  checks: 'nonce',
});

const signIn = async (email: string, password: string): Promise<User> => {
  const client = new CognitoIdentityProvider({
    region: process.env.COGNITO_REGION,
  });

  const secretHash = crypt
    .createHmac('sha256', process.env.COGNITO_CLIENT_SECRET ?? '')
    .update(email + process.env.COGNITO_CLIENT_ID)
    .digest('base64');

  try {
    const input: InitiateAuthCommandInput = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };

    const response = await client.send(new InitiateAuthCommand(input));

    if (response.ChallengeParameters) {
      // TODO: 初回パスワード更新の場合パスワード再設定画面へリダイレクトさせたい(ChallengeName: NEW_PASSWORD_REQUIRED)
      // console.log({response});
      return {
        id: JSON.stringify(response),
        email,
      };
    }

    if (!response.AuthenticationResult) {
      throw new Error('Non auth response reslut.');
    }
    if (!response.AuthenticationResult.IdToken) {
      throw new Error('Non id token.');
    }

    const {
      IdToken,
      AccessToken,
      RefreshToken,
      ExpiresIn,
    } = response.AuthenticationResult;

    return {
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      expiresIn: ExpiresIn,
      email,
    };

  } catch (error) {
    console.log({error});

    throw new Error('Auth Error.');
  };
};

// INFO: NextAuthではトークンリフレッシュ処理を提供していない為自作
const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  // INFO: 初回パスワードリセットの場合を考慮
  if (!token.refreshToken) {
    return token;
  }

   try {
    const clientId = cognitoProvider.options?.clientId ?? '';
    const clientSecret = cognitoProvider.options?.clientSecret ?? '';
    const issuer = await Issuer.discover(cognitoProvider.wellKnown!);
    const tokenEndpoint = issuer.metadata.token_endpoint ?? '';
    const basicAuthParams = `${clientId}:${clientSecret}`;
    const basicAuth = Buffer.from(basicAuthParams).toString('base64');
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    const response = await fetch(tokenEndpoint, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      method: 'POST',
      body: params.toString(),
    });
    const newToken = await response.json();

    return {
      ...newToken,
      idToken: newToken.idToken,
      accessToken: newToken.accessToken,
    };
  } catch (error) {
    console.error('Error refreshing access token');
    console.log(error);

    throw error;
  }
};

export const authConfig = {
  debug: true,
  pages: {
    signIn: '/login',
    error: '/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Cognito',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async (credentials) => {
        return await signIn(
          credentials?.email ?? '',
          credentials?.password ?? ''
        );
      }
    }),
  ],
  callbacks: {
    jwt: async ({
      user,
      token,
      account
    }: {
      user: User,
      token: JWT,
      account: Account|null
    }) => {
      // INFO: Initial sign in
      if (account) {
        token.idToken = account.id_token || user.idToken;
        token.accessToken = account.access_token || user.accessToken;
        token.expiresIn = account.expires_at || user.expiresIn;
        token.refreshToken = account.refresh_token || user.refreshToken;

        return token;
      };

      // INFO: Return previous token if the access token has not expired yet
      if (token.expiresIn && token.expiresIn < Math.floor(Date.now() / 1000)) {
        console.debug(`Token available (exp: ${token.expiresIn})`);
        return token;
      }

      return refreshAccessToken(token);
    },
    session: async ({
      session,
      token
    }: {
      session: Session,
      token: JWT
    }): Promise<Session> => {
      session.idToken = token.idToken;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
    // authorized() {
    //   console.log('aaaa');
    // },
  },
} satisfies NextAuthOptions;
