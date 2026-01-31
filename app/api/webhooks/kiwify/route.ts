import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('🔥 WEBHOOK KIWIFY CHEGOU');

  try {
    // 🔐 1. Token de segurança
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (token !== process.env.KIWIFY_WEBHOOK_SECRET) {
      console.log('❌ Token inválido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    
    // Pegamos os status principais
    const orderStatus = body.order_status; // ex: paid, refunded, chargedback
    const subStatus = body.subscription_status; // ex: active, past_due, canceled

    console.log(`📦 Status Recebido: Order=${orderStatus} | Sub=${subStatus}`);

    // 🧠 2. LÓGICA DE DECISÃO DO PLANO
    let newPlan = 'free'; // Padrão: sem acesso
    let shouldUpdate = false;

    // Cenário A: Compra Aprovada ou Renovação
    if (orderStatus === 'paid' || orderStatus === 'approved') {
      newPlan = 'premium';
      shouldUpdate = true;
    } 
    // Cenário B: Reembolso ou Chargeback (Cartão roubado/cancelado)
    else if (orderStatus === 'refunded' || orderStatus === 'chargedback') {
      newPlan = 'free'; // Remove acesso imediatamente
      shouldUpdate = true;
    }
    // Cenário C: Assinatura Cancelada ou Atrasada
    // Nota: 'past_due' é quando o cartão falha na renovação
    else if (subStatus === 'canceled' || subStatus === 'past_due' || subStatus === 'suspended') {
      newPlan = 'free'; // Ou 'overdue' se quiser mostrar msg específica
      shouldUpdate = true;
    }

    // Se não for nenhum evento relevante, ignoramos
    if (!shouldUpdate) {
      console.log('ℹ️ Evento ignorado (não altera acesso)');
      return NextResponse.json({ ignored: true });
    }

    // ✅ 3. IDENTIFICAÇÃO DO USUÁRIO
    // A Kiwify manda os dados dentro de "Customer" (com C maiúsculo às vezes) ou na raiz dependendo do evento
    // Vamos garantir que pegamos de qualquer lugar
    const customerEmail = body?.Customer?.email || body?.email;
    const customerName = body?.Customer?.full_name || body?.name;
    const orderId = body?.order_id;
    const subscriptionId = body?.subscription_id ?? null;

    if (!customerEmail) {
      console.error('❌ E-mail não encontrado no payload', body);
      return NextResponse.json({ error: 'Email ausente' }, { status: 400 });
    }

    const db = getFirestore();
    
    // Verifica se banco carregou (proteção build)
    if (!db) return NextResponse.json({ build: true });

    const usersRef = db.collection('users');

    // Busca usuário pelo e-mail
    const snapshot = await usersRef
      .where('email', '==', customerEmail)
      .limit(1)
      .get();

    // 🔄 4. ATUALIZAÇÃO NO BANCO DE DADOS
    if (snapshot.empty) {
      // Se for um Cancelamento de um usuário que nem existe, não faz sentido criar
      if (newPlan === 'free') {
        return NextResponse.json({ message: 'Cancelamento ignorado p/ usuário inexistente' });
      }

      // 🆕 Usuário novo (SÓ CRIA SE FOR PREMIUM)
      await usersRef.add({
        email: customerEmail,
        name: customerName ?? 'Novo Usuário',
        plan: newPlan, // 'premium'
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        kiwify_order_id: orderId,
        subscription_id: subscriptionId,
      });

      console.log(`✅ Usuário criado como ${newPlan}: ${customerEmail}`);

    } else {
      // ✏️ Usuário existente (Renovação, Cancelamento ou Atraso)
      const userDoc = snapshot.docs[0];

      // Se for renovação (mesmo ID), a gente atualiza a data mesmo assim
      // Se for cancelamento, a gente atualiza o plano para free

      await userDoc.ref.update({
        plan: newPlan, // Aqui muda para 'premium' ou 'free'
        status: subStatus || orderStatus, // Salva o status cru da Kiwify para auditoria
        updatedAt: new Date(),
        // Só atualiza IDs se eles vierem no payload
        ...(orderId && { kiwify_order_id: orderId }),
        ...(subscriptionId && { subscription_id: subscriptionId }),
      });

      console.log(`🔄 Usuário ${customerEmail} atualizado para plano: ${newPlan}`);
    }

    return NextResponse.json({ success: true, plan_set: newPlan });

  } catch (err) {
    console.error('💥 Erro no Webhook:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}