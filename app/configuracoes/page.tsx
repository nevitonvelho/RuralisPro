'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Importe seu app firebase cliente aqui
import { useRouter } from 'next/navigation';

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
        router.push('/login'); // Manda pro login se não tiver logado
        return;
      }

      try {
        // 2. Busca no Firestore pelo Email do usuário logado
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Pegamos o primeiro documento encontrado
          const userData = querySnapshot.docs[0].data() as UserSubscription;
          setSubscription(userData);
        } else {
          // Usuário logado mas sem registro de compra no banco
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
      <h1 className="text-3xl font-bold mb-8">Minha Assinatura</h1>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Plano Atual</h2>
            <p className="text-gray-500">Detalhes da sua conta</p>
          </div>
          
          {/* Badge de Status */}
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            subscription?.plan === 'premium' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {subscription?.plan === 'premium' ? 'ATIVO' : 'GRÁTIS'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalhe 1: Tipo de Plano */}
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Nível de Acesso</p>
            <p className="text-lg font-medium capitalize">
              {subscription?.plan === 'premium' ? 'Ruralis PRO (Premium)' : 'Usuário Gratuito'}
            </p>
          </div>

          {/* Detalhe 2: Última Atualização/Renovação */}
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Última Atualização</p>
            <p className="text-lg font-medium">
              {subscription ? formatData(subscription.updatedAt) : '-'}
            </p>
          </div>
          
          {/* Detalhe 3: Status Financeiro */}
          <div className="p-4 bg-gray-50 rounded-md">
             <p className="text-sm text-gray-500 mb-1">Status do Pagamento</p>
             <p className="text-lg font-medium capitalize">
               {translateStatus(subscription?.status)}
             </p>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-8 border-t pt-6">
          {subscription?.plan === 'premium' ? (
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Gerenciar Assinatura na Kiwify &rarr;
            </button>
          ) : (
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Fazer Upgrade para Premium
            </button>
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
    'past_due': 'Pagamento Pendente',
    'canceled': 'Cancelado',
    'refunded': 'Reembolsado'
  };
  return map[status] || status;
}