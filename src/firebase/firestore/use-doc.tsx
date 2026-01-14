'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  type DocumentReference,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';


interface UseDocOptions<T> {
  idField?: keyof T;
}

export function useDoc<T>(
  ref: DocumentReference | null,
  options?: UseDocOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data();
           if (options?.idField) {
            setData({ ...docData, [options.idField]: snapshot.id } as T);
          } else {
            setData({ ...docData, id: snapshot.id } as T);
          }
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
         const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref, options?.idField]);

  return { data, loading, error };
}
