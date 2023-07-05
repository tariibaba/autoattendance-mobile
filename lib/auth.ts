import EncryptedStorage from 'react-native-encrypted-storage';
import * as SecureStore from 'expo-secure-store';

export type UserSession = {
  username: string;
  userRole: string;
  token: string;
  userId: string;
};

export type UserSessionOptions = UserSession;

export async function createUserSession({
  username,
  userRole,
  token,
  userId,
}: UserSessionOptions): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      'userSession',
      JSON.stringify({ token, username, userRole, userId })
    );
  } catch (err) {
    console.error(err);
  }
}

export async function readUserSession(): Promise<UserSession | undefined> {
  try {
    const session = await SecureStore.getItemAsync('userSession');
    return JSON.parse(session!);
  } catch (err) {
    console.error(err);
  }
}

export async function deleteUserSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('userSession');
  } catch (err) {
    console.error(err);
  }
}
