import { db } from '../firebaseClient';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Create a notification for a user.
 * @param {string} toUid - recipient user ID
 * @param {'friend_added'|'like'|'completed'} type
 * @param {{ uid: string, displayName: string, photoURL: string }} fromUser
 * @param {string} [recTitle] - title of the recommendation (for like/completed)
 */
export const createNotification = async (toUid, type, fromUser, recTitle = '') => {
    if (!db || !toUid || toUid === fromUser?.uid) return; // Don't notify self
    try {
        await addDoc(collection(db, 'notifications'), {
            toUid,
            type,
            fromUid: fromUser?.uid || '',
            fromName: fromUser?.displayName || 'Someone',
            fromPhoto: fromUser?.photoURL || '',
            recTitle,
            read: false,
            created_at: serverTimestamp(),
        });
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};

/**
 * Fetch notifications for a user, newest first.
 */
export const getNotifications = async (uid) => {
    if (!db || !uid) return [];
    try {
        const q = query(
            collection(db, 'notifications'),
            where('toUid', '==', uid),
            orderBy('created_at', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return [];
    }
};

/**
 * Mark all unread notifications as read for a user.
 */
export const markAllRead = async (uid) => {
    if (!db || !uid) return;
    try {
        const q = query(
            collection(db, 'notifications'),
            where('toUid', '==', uid),
            where('read', '==', false)
        );
        const snap = await getDocs(q);
        const updates = snap.docs.map(d => updateDoc(d.ref, { read: true }));
        await Promise.all(updates);
    } catch (err) {
        console.error('Error marking notifications as read:', err);
    }
};

/**
 * Delete all notifications for a user.
 */
export const clearAllNotifications = async (uid) => {
    if (!db || !uid) return;
    try {
        const q = query(
            collection(db, 'notifications'),
            where('toUid', '==', uid)
        );
        const snap = await getDocs(q);
        const deletes = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletes);
    } catch (err) {
        console.error('Error clearing notifications:', err);
    }
};
