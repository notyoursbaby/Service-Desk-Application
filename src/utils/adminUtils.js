import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Function to check if a user is an admin
export const isAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Function to set a user as admin
export const setUserAsAdmin = async (userId) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: 'admin'
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting admin role:', error);
    return false;
  }
};

// Function to remove admin role
export const removeAdminRole = async (userId) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: 'user'
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
}; 
