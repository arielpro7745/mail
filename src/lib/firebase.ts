import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

export const app = initializeApp(cfg)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Offline לשטח
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch(() => {})
  isSupported().then((ok) => ok && getAnalytics(app))
}
