import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirestore() {
  // 🔥 NÃO inicializa Firebase durante o build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!admin.apps.length) {
    const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;

    if (!base64Key) {
      throw new Error('FIREBASE_PRIVATE_KEY_BASE64 ausente');
    }

    // ✅ Decodifica Base64 → PEM válido
    const privateKey = Buffer
      .from(base64Key, 'base64')
      .toString('utf-8')
      .trim();

    // 🧪 Diagnóstico de segurança (pode remover depois)
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Private key decodificada não é PEM válida');
    }

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });
  }

  return admin.firestore();
}
