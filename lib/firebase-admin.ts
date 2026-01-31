import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirestore() {
  if (!admin.apps.length) {
    const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;

    if (!base64Key) {
      throw new Error('FIREBASE_PRIVATE_KEY_BASE64 ausente');
    }

    const privateKey = Buffer.from(base64Key, 'base64')
      .toString('utf-8')
      .trim();

    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Private key inválida');
    }

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });

    // evita erro com undefined em add/update
    admin.firestore().settings({
      ignoreUndefinedProperties: true,
    });
  }

  return admin.firestore();
}
