'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    console.log('Starting registration process...');
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    console.log('Form data validated successfully');

    const [user] = await getUser(validatedData.email);
    console.log('Checked for existing user:', user ? 'found' : 'not found');

    if (user) {
      console.log('User already exists with email:', validatedData.email);
      return { status: 'user_exists' } as RegisterActionState;
    }

    console.log('Creating new user...');
    await createUser(validatedData.email, validatedData.password);
    console.log('User created successfully');

    console.log('Signing in user...');
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });
    console.log('User signed in successfully');

    return { status: 'success' };
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
