'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; 
import { app } from '@/lib/firebase'; 
import { useRouter } from 'next/navigation';
// Adicionei o ícone 'Mail' para o botão de contato
import { ExternalLink, Mail } from 'lucide-react';

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
  const [userEmail, setUserEmail] = useState<string | null>(null); // Guardar o email para facilitar o corpo da mensagem
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserEmail(user.email); // Salva o email para usar no mailto

      try {
        console.log("Buscando assinatura para o email:", user.email);

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          let finalData = querySnapshot.docs[0].data() as UserSubscription;

          querySnapshot.docs.forEach((doc) => {
            const data = doc.data() as UserSubscription;
            if (data.plan === 'premium') {
              finalData = data;
            }
          });

          setSubscription(finalData);
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

  const formatData = (timestamp: any) => {
    if (!timestamp) return '-';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
    }
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

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
          
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            subscription?.plan === 'premium' 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {subscription?.plan === 'premium' ? 'Premium Ativo' : 'Plano Gratuito'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Nível de Acesso</p>
            <p className="text-lg font-semibold text-slate-800">
              {subscription?.plan === 'premium' ? 'Ruralis PRO (Completo)' : 'Acesso Limitado'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Última Atualização</p>
            <p className="text-lg font-semibold text-slate-800">
              {subscription ? formatData(subscription.updatedAt) : '-'}
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status do Pagamento</p>
             <p className="text-lg font-semibold text-slate-800 capitalize">
               {translateStatus(subscription?.status)}
             </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          {subscription?.plan === 'premium' ? (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <span>Sua assinatura está ativa via Kiwify.</span>
                </div>

                {/* --- AQUI ESTÁ O BOTÃO DE CANCELAMENTO --- */}
                {/* Substitua 'suporte@ruralis.com' pelo seu email real */}
                <a 
                  href={`mailto:suporte@ruralis.com?subject=Solicitação de Cancelamento - Ruralis PRO&body=Olá, gostaria de solicitar o cancelamento da minha assinatura referente ao email: ${userEmail}`}
                  className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium w-fit"
                >
                  <Mail size={16} />
                  Solicitar Cancelamento via E-mail
                </a>
            </div>
          ) : (
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