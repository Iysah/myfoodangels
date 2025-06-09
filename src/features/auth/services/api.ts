import { store } from '../../../store/root';
import { UserRole } from '../../../types/user';

interface SignupParams {
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
}

interface loginParams {
  email: string;
  password: string;
}

export const signup = async ({
  email,
  password,
  fullName,
  role = (store.auth.role as UserRole),
}: SignupParams): Promise<void> => {
  try {
    await store.auth.register({
      email,
      password,
      name: fullName || '',
      accountType: role,
    });
  } catch (error) {
    console.error('Signup failed:', error);
    console.log(error)
    throw error;
  }
};

export const login = async ({
  email,
  password,
}: loginParams) => {
  try {
    await store.auth.login(email, password);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}