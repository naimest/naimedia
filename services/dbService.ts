import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot,
  where
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth, db } from './firebase';
import { Account, Client, ServiceDef, TelegramConfig } from '../types';

// --- Auth ---
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signup = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);

// --- Database Helpers ---
const getCollection = (user: User, colName: string) => {
  return query(collection(db, colName), where('userId', '==', user.uid));
};

// Generic Subscriber
export const subscribeToData = (
  user: User, 
  colName: string, 
  callback: (data: any[]) => void
) => {
  const q = getCollection(user, colName);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(data);
  });
};

// Generic CRUD
export const addItem = async (user: User, colName: string, data: any) => {
  await addDoc(collection(db, colName), { ...data, userId: user.uid });
};

export const updateItem = async (colName: string, id: string, data: any) => {
  const ref = doc(db, colName, id);
  // Remove id from data if present to avoid duplicating it in fields
  const { id: _, ...cleanData } = data;
  await updateDoc(ref, cleanData);
};

export const deleteItem = async (colName: string, id: string) => {
  await deleteDoc(doc(db, colName, id));
};

// --- Specific Type Helpers ---
// We map the collection names here
export const COLLECTIONS = {
  ACCOUNTS: 'accounts',
  CLIENTS: 'clients',
  SERVICES: 'services',
  SETTINGS: 'settings' // For Telegram Config
};
