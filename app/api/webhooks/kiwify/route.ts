import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // 1. SEGURANÇA: Verificar se a requisição vem mesmo da Kiwify
    // Na Kiwify, configure o webhook como: https://seu-site.com/api/webhook?token=SEU_TOKEN_SECRETO
    const url = new URL(req.url);
    const secretToken = url.searchParams.get('token');

    if (secretToken !== process.env.KIWIFY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Verificar o Status do Pedido
    if (body.order_status !== 'paid' && body.order_status !== 'approved') {
      // Retornamos 200 para a Kiwify parar de tentar enviar esse evento ignorado
      return NextResponse.json({ message: 'Status ignorado' });
    }

    const customerEmail = body.customer_email;
    
    // 3. Estratégia de Busca/Criação do Usuário
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', customerEmail).get();

    let userRef;

    if (snapshot.empty) {
      // CENÁRIO A: O usuário comprou mas ainda não tem conta no sistema.
      // Criamos o documento para quando ele fizer o login, já estar tudo pronto.
      // DICA: Usar o email como ID facilita a busca, ou deixe o Firebase gerar o ID.
      const newUser = await usersRef.add({
        email: customerEmail,
        name: body.customer_name || 'Novo Usuário',
        createdAt: new Date(),
        // Define o plano inicial
        plan: 'premium', 
        kiwify_order_id: body.order_id
      });
      userRef = newUser;
      console.log(`Usuário criado via Webhook: ${customerEmail}`);
    } else {
      // CENÁRIO B: O usuário já existe
      const userDoc = snapshot.docs[0];
      
      // Verificação extra: Se o pedido já foi processado antes, não faz nada
      if (userDoc.data().kiwify_order_id === body.order_id) {
         return NextResponse.json({ message: 'Pedido já processado anteriormente' });
      }

      userRef = userDoc.ref;
      
      await userRef.update({
        plan: 'premium',
        updatedAt: new Date(),
        kiwify_order_id: body.order_id
      });
      console.log(`Usuário atualizado via Webhook: ${customerEmail}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("Erro no Webhook:", err);
    // Se der erro real (banco fora do ar, etc), retornamos 500 para a Kiwify tentar de novo depois
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}