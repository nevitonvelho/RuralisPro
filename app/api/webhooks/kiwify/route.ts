import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const db = getFirestore();
    if (!db) {
      return NextResponse.json({ build: true });
    }

    // 🔐 Segurança do token
    const url = new URL(req.url);
    const secretToken = url.searchParams.get('token');

    if (secretToken !== process.env.KIWIFY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // 📌 Aceita apenas pagamento aprovado
    if (body.order_status !== 'paid' && body.order_status !== 'approved') {
      return NextResponse.json({ message: 'Status ignorado' });
    }

    // ✅ CAMPOS CORRETOS DA KIWIFY
    const customerEmail = body?.Customer?.email;
    const customerName = body?.Customer?.full_name;
    const orderId = body?.order_id;
    const subscriptionId = body?.subscription_id ?? null;

    // 🚨 Validação obrigatória
    if (!customerEmail || !orderId) {
      console.error('Webhook inválido:', body);
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      );
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', customerEmail).get();

    if (snapshot.empty) {
      // 🆕 Usuário novo
      await usersRef.add({
        email: customerEmail,
        name: customerName ?? 'Novo Usuário',
        plan: 'premium',
        createdAt: new Date(),
        kiwify_order_id: orderId,
        subscription_id: subscriptionId,
      });

      console.log(`Usuário criado via webhook: ${customerEmail}`);
    } else {
      const userDoc = snapshot.docs[0];

      // 🛑 Evita processar o mesmo pedido duas vezes
      if (userDoc.data().kiwify_order_id === orderId) {
        return NextResponse.json({ message: 'Pedido já processado' });
      }

      await userDoc.ref.update({
        plan: 'premium',
        updatedAt: new Date(),
        kiwify_order_id: orderId,
        subscription_id: subscriptionId,
      });

      console.log(`Usuário atualizado via webhook: ${customerEmail}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Erro no Webhook:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
