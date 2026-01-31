import * as admin from 'firebase-admin';

// Verifica se já existe uma instância para não criar duplicada (Singleton)
if (!admin.apps.length) {
  
  // 1. Pega a chave
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  // 2. TRATAMENTO BLINDADO:
  // - .replace(/\\n/g, '\n') -> Arruma as quebras de linha
  // - .replace(/"/g, '')     -> Remove TODAS as aspas (resolve o erro Invalid PEM)
  const privateKey = rawKey
    ? rawKey.replace(/\\n/g, '\n').replace(/"/g, '')
    : undefined;

  if (!privateKey) {
    console.error('❌ ERRO CRÍTICO: FIREBASE_PRIVATE_KEY não foi encontrada ou está vazia.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

export { db };