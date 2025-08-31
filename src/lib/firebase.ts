import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence, getDoc, doc } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

export const app = initializeApp(cfg)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDoc(doc(db, "settings", "test_connection"))
    return true
  } catch (error) {
    console.error('Firebase connection test failed:', error)
    return false
  }
}

// Offline לשטח
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch(() => {})
  isSupported().then((ok) => ok && getAnalytics(app))
}
