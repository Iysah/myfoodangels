import { firestore } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  addDoc,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

// Generic function to add a document to a collection
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), data);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Generic function to set a document with a specific ID
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    await setDoc(doc(firestore, collectionName, docId), data);
  } catch (error) {
    throw error;
  }
};

// Generic function to get a document by ID
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const docSnap = await getDoc(doc(firestore, collectionName, docId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Generic function to update a document
export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    await updateDoc(doc(firestore, collectionName, docId), data);
  } catch (error) {
    throw error;
  }
};

// Generic function to delete a document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, collectionName, docId));
  } catch (error) {
    throw error;
  }
};

// Generic function to query documents
export const queryDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const q = query(collection(firestore, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as unknown as T);
  } catch (error) {
    throw error;
  }
};

// Generic function to listen to a document
export const listenToDocument = <T extends DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(firestore, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    } else {
      callback(null);
    }
  });
};

// Generic function to listen to a query
export const listenToQuery = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
) => {
  const q = query(collection(firestore, collectionName), ...constraints);
  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as unknown as T);
    callback(documents);
  });
};

// Helper function to create a timestamp
export const createTimestamp = () => {
  return Timestamp.now();
};

// Helper functions for common query constraints
export const createWhereConstraint = (field: string, operator: "=="|"!="|"<"|"<="|">"|">="|"array-contains"|"array-contains-any"|"in"|"not-in", value: any) => {
  return where(field, operator, value);
};

export const createOrderByConstraint = (field: string, direction: "asc"|"desc" = "asc") => {
  return orderBy(field, direction);
};

export const createLimitConstraint = (limitCount: number) => {
  return limit(limitCount);
};