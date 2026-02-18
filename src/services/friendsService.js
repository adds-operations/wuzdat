import { db } from '../firebaseClient';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';

// --- User Profiles ---

export const ensureUserProfile = async (user) => {
    if (!db || !user) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
        });
    }
};

export const searchUserByEmail = async (email, currentUid) => {
    if (!db) return null;
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const userData = snap.docs[0].data();
    // Don't return self
    if (userData.uid === currentUid) return null;
    return { id: snap.docs[0].id, ...userData };
};

// --- Friend Requests ---

export const sendFriendRequest = async (fromUser, toUid) => {
    if (!db) return;

    // Check if request already exists in either direction
    const q1 = query(
        collection(db, 'friendRequests'),
        where('fromUid', '==', fromUser.uid),
        where('toUid', '==', toUid)
    );
    const q2 = query(
        collection(db, 'friendRequests'),
        where('fromUid', '==', toUid),
        where('toUid', '==', fromUser.uid)
    );
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    if (!snap1.empty || !snap2.empty) {
        throw new Error('Friend request already exists');
    }

    // Check if already friends
    const alreadyFriends = await checkFriendship(fromUser.uid, toUid);
    if (alreadyFriends) {
        throw new Error('Already friends');
    }

    await addDoc(collection(db, 'friendRequests'), {
        fromUid: fromUser.uid,
        fromName: fromUser.displayName || '',
        fromPhoto: fromUser.photoURL || '',
        fromEmail: fromUser.email || '',
        toUid: toUid,
        createdAt: serverTimestamp(),
    });
};

export const getPendingRequests = async (uid) => {
    if (!db) return [];
    const q = query(
        collection(db, 'friendRequests'),
        where('toUid', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getSentRequests = async (uid) => {
    if (!db) return [];
    const q = query(
        collection(db, 'friendRequests'),
        where('fromUid', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const acceptFriendRequest = async (requestId, fromUid, toUid) => {
    if (!db) return;
    // Create friendship doc
    await addDoc(collection(db, 'friends'), {
        users: [fromUid, toUid],
        createdAt: serverTimestamp(),
    });
    // Delete the request
    await deleteDoc(doc(db, 'friendRequests', requestId));
};

export const rejectFriendRequest = async (requestId) => {
    if (!db) return;
    await deleteDoc(doc(db, 'friendRequests', requestId));
};

// --- Instant Connect (no request needed) ---

export const instantConnect = async (currentUid, targetUid) => {
    if (!db) return;

    // Check if already friends
    const alreadyFriends = await checkFriendship(currentUid, targetUid);
    if (alreadyFriends) {
        throw new Error('Already friends');
    }

    // Create friendship directly — both users are friends instantly
    await addDoc(collection(db, 'friends'), {
        users: [currentUid, targetUid],
        createdAt: serverTimestamp(),
    });
};

// --- Friendships ---

export const checkFriendship = async (uidA, uidB) => {
    if (!db) return false;
    const q = query(
        collection(db, 'friends'),
        where('users', 'array-contains', uidA)
    );
    const snap = await getDocs(q);
    return snap.docs.some(d => d.data().users.includes(uidB));
};

export const getFriendIds = async (uid) => {
    if (!db) return [];
    const q = query(
        collection(db, 'friends'),
        where('users', 'array-contains', uid)
    );
    const snap = await getDocs(q);
    const friendIds = [];
    snap.docs.forEach(d => {
        const users = d.data().users;
        const friendId = users.find(u => u !== uid);
        if (friendId) friendIds.push(friendId);
    });
    return friendIds;
};

export const getFriendsList = async (uid) => {
    if (!db) return [];
    const friendIds = await getFriendIds(uid);
    if (friendIds.length === 0) return [];

    const friends = [];
    for (const fid of friendIds) {
        const userSnap = await getDoc(doc(db, 'users', fid));
        if (userSnap.exists()) {
            friends.push({ id: userSnap.id, ...userSnap.data() });
        }
    }
    return friends;
};

export const removeFriend = async (currentUid, friendUid) => {
    if (!db) return;
    const q = query(
        collection(db, 'friends'),
        where('users', 'array-contains', currentUid)
    );
    const snap = await getDocs(q);
    for (const friendDoc of snap.docs) {
        if (friendDoc.data().users.includes(friendUid)) {
            await deleteDoc(doc(db, 'friends', friendDoc.id));
            break;
        }
    }
};
