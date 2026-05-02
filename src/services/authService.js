import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export { auth };