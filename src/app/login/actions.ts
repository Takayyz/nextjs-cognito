import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

export async function authenticate(_: boolean, formData: FormData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    });

    redirect('/');
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return false;
    }

    throw error;
  }
};
