import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('🔥 WEBHOOK KIWIFY CHEGOU');

  try {
    // 🔐 Token de segurança
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (token !== process.env.KIWIFY_WEBHOOK_SECRET) {
      console.log('❌ Token inválido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    console.log('📦 Payload recebido');

    // 📌 Aceita apenas pagamento aprovado
    if (body.order_status !== 'paid' && body.order_status !== 'approved') {
      console.log('ℹ️ Status ignorado:', body.order_status);
      return NextResponse.json({ ignored: true });
    }

    // ✅ CAMPOS REAIS DA KIWIFY
    const customerEmail = body?.Customer?.email;
    const customerName = body?.Customer?.full_name;
    const orderId = body?.order_id;
    const subscriptionId = body?.subscription_id ?? null;

    if (!customerEmail || !orderId) {
      console.error('❌ Dados obrigatórios ausentes', body);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const db = getFirestore();
    const usersRef = db.collection('users');

    const snapshot = await usersRef
      .where('email', '==', customerEmail)
      .limit(1)
      .get();

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

      console.log('✅ Usuário criado:', customerEmail);
    } else {
      const userDoc = snapshot.docs[0];

      if (userDoc.data().kiwify_order_id === orderId) {
        console.log('🔁 Pedido já processado');
        return NextResponse.json({ duplicated: true });
      }

      await userDoc.ref.update({
        plan: 'premium',
        updatedAt: new Date(),
        kiwify_order_id: orderId,
        subscription_id: subscriptionId,
      });

      console.log('🔄 Usuário atualizado:', customerEmail);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('💥 Erro no Webhook:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
