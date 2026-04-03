import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Needed for crypto.getRandomValues
import { STORAGE_KEYS, MAX_CONTACTS } from '../constants';
import { syncContactToBackend, deleteContactFromBackend } from '../services/api';
import type { EmergencyContact } from '../types';

/**
 * WHY: The prototype stored contacts in useState — resetting on every app
 * restart. This hook is the single source of truth for emergency contacts.
 * It loads from AsyncStorage on mount and persists every mutation immediately.
 * Backend sync is attempted optimistically; local state is never blocked by it.
 */
export function useContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load from AsyncStorage on mount ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
        if (raw) {
          setContacts(JSON.parse(raw));
        }
      } catch (e) {
        setError('Failed to load contacts from storage.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Persist helper ─────────────────────────────────────────────────────────
  const persist = useCallback(async (updated: EmergencyContact[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updated));
  }, []);

  // ── Add contact ────────────────────────────────────────────────────────────
  const addContact = useCallback(
    async (payload: Omit<EmergencyContact, 'id'>): Promise<void> => {
      if (contacts.length >= MAX_CONTACTS) {
        throw new Error(`You can only add up to ${MAX_CONTACTS} emergency contacts.`);
      }

      // Generate a simple unique ID (UUID-lite without an npm package)
      const id = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const newContact: EmergencyContact = { id, ...payload };

      const updated = [...contacts, newContact];
      setContacts(updated);
      await persist(updated);

      // Try syncing to backend — non-blocking
      syncContactToBackend(payload).catch(() => {
        // Backend sync failure is non-fatal; local storage is source of truth.
      });
    },
    [contacts, persist]
  );

  // ── Delete contact ─────────────────────────────────────────────────────────
  const deleteContact = useCallback(
    async (id: string): Promise<void> => {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      await persist(updated);

      deleteContactFromBackend(id).catch(() => {
        // Backend sync failure is non-fatal.
      });
    },
    [contacts, persist]
  );

  return {
    contacts,
    isLoading,
    error,
    addContact,
    deleteContact,
  };
}
