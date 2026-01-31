'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase'; 
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react'; // Adicionei para o ícone do botão

// Definição do tipo de dados que esperamos do banco
interface UserSubscription {
  plan: string;
  status: string;
  updatedAt: any;
  subscription_id?: string;
  kiwify_order_id?: string;
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const router = useRouter();

    useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    // 1. Verifica se tem usuário logado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // 2. Busca no Firestore pelo Email do usuário logado
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // --- CORREÇÃO AQUI ---
          // Vamos varrer todos os documentos encontrados para este email.
          // Se houver algum 'premium', usamos ele. Se não, usamos o primeiro que aparecer.
          
          let userDataFound = querySnapshot.docs[0].data() as UserSubscription;

          querySnapshot.docs.forEach((doc) => {
            const data = doc.data() as UserSubscription;
            console.log("Documento encontrado:", doc.id, data); // Para debug no console

            // Se encontrarmos um documento Premium, ele ganha prioridade
            if (data.plan === 'premium') {
              userDataFound = data;
            }
          });

          setSubscription(userDataFound);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error("Erro ao buscar assinatura:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Função para formatar data (Firestore Timestamp para texto)
  const formatData = (timestamp: any) => {
    if (!timestamp) return '-';
    // Se for Timestamp do Firestore
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
    }
    // Se for string ou Date normal
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  // Renderização
  if (loading) return <div className="p-8 text-center">Carregando informações...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Minha Assinatura</h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Plano Atual</h2>
            <p className="text-slate-500 text-sm">Detalhes da sua conta e acesso</p>
          </div>
          
          {/* Badge de Status */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            subscription?.plan === 'premium' 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {subscription?.plan === 'premium' ? 'Premium Ativo' : 'Plano Gratuito'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalhe 1: Tipo de Plano */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Nível de Acesso</p>
            <p className="text-lg font-semibold text-slate-800">
              {subscription?.plan === 'premium' ? 'Ruralis PRO (Completo)' : 'Acesso Limitado'}
            </p>
          </div>

          {/* Detalhe 2: Última Atualização/Renovação */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Última Atualização</p>
            <p className="text-lg font-semibold text-slate-800">
              {subscription ? formatData(subscription.updatedAt) : '-'}
            </p>
          </div>
          
          {/* Detalhe 3: Status Financeiro */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status do Pagamento</p>
             <p className="text-lg font-semibold text-slate-800 capitalize">
               {translateStatus(subscription?.status)}
             </p>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          {subscription?.plan === 'premium' ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>Para gerenciar cobranças, acesse seu e-mail da Kiwify.</span>
            </div>
          ) : (
            // AQUI ESTÁ O LINK QUE VOCÊ PEDIU
            <a 
              href="https://pay.kiwify.com.br/YfRpxeU"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
            >
              Fazer Upgrade para Premium
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper simples de tradução
function translateStatus(status?: string) {
  if (!status) return 'Não Assinante';
  const map: Record<string, string> = {
    'paid': 'Pago',
    'approved': 'Aprovado',
    'active': 'Ativo',
    'past_due': 'Pendente',
    'canceled': 'Cancelado',
    'refunded': 'Reembolsado',
    'suspended': 'Suspenso'
  };
  return map[status] || status;
}