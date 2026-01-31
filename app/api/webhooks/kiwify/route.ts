import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const db = getFirestore();

    // Build phase → ignora
    if (!db) {
      return NextResponse.json({ build: true });
    }

    // 1. Segurança do token
    const url = new URL(req.url);
    const secretToken = url.searchParams.get('token');

    if (secretToken !== process.env.KIWIFY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Status do pedido
    if (body.order_status !== 'paid' && body.order_status !== 'approved') {
      return NextResponse.json({ message: 'Status ignorado' });
    }

    const customerEmail = body.customer_email;

    // 3. Busca/criação do usuário
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', customerEmail).get();

    if (snapshot.empty) {
      await usersRef.add({
        email: customerEmail,
        name: body.customer_name || 'Novo Usuário',
        createdAt: new Date(),
        plan: 'premium',
        kiwify_order_id: body.order_id,
      });

      console.log(`Usuário criado via Webhook: ${customerEmail}`);
    } else {
      const userDoc = snapshot.docs[0];

      if (userDoc.data().kiwify_order_id === body.order_id) {
        return NextResponse.json({ message: 'Pedido já processado' });
      }

      await userDoc.ref.update({
        plan: 'premium',
        updatedAt: new Date(),
        kiwify_order_id: body.order_id,
      });

      console.log(`Usuário atualizado via Webhook: ${customerEmail}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Erro no Webhook:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
