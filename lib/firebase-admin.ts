import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirestore() {
  // 🔥 NÃO roda no build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      ?.trim();

    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY ausente');
    }

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  return admin.firestore();
}
