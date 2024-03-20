'use client';

import { useSession } from "next-auth/react";
import React from 'react';

export const IsLoggedin = (): JSX.Element => {
  const {data: session} = useSession();

  if (!session) {
    return <p>ログインしていません。</p>
  }

  return (
    <div>
      {session.user ? `${session.user.email}としてログインしています。` : 'Loading...'}
    </div>
  );
};
