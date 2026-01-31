'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; 
import { app } from '@/lib/firebase'; 
import { useRouter } from 'next/navigation';
import { 
  ExternalLink, 
  Mail, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  Crown, 
  User, 
  AlertCircle 
} from 'lucide-react';

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserEmail(user.email);

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          let finalData = querySnapshot.docs[0].data() as UserSubscription;
          // Prioriza o plano premium se houver duplicidade
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
    // Suporte para Timestamp do Firestore ou string ISO
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    }
    return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const isPremium = subscription?.plan === 'premium';

  // SKELETON LOADER (Visual de carregamento)
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-64 animate-pulse">
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
      
      {/* HEADER DA PÁGINA */}
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minha Conta</h1>
        <p className="text-slate-500 mt-2">Gerencie sua assinatura e detalhes de pagamento.</p>
      </header>

      {/* CARD PRINCIPAL */}
      <div className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all ${
        isPremium 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Efeito de fundo para Premium */}
        {isPremium && (
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        )}

        <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isPremium ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                        {isPremium ? <Crown size={32} strokeWidth={1.5} /> : <User size={32} strokeWidth={1.5} />}
                    </div>
                    <div>
                        <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${isPremium ? 'text-emerald-400' : 'text-slate-400'}`}>
                            Plano Atual
                        </p>
                        <h2 className="text-3xl font-bold leading-none">
                            {isPremium ? 'Ruralis PRO' : 'Plano Gratuito'}
                        </h2>
                    </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${
                    subscription?.status === 'active' || subscription?.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${
                        subscription?.status === 'active' || subscription?.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {translateStatus(subscription?.status)}
                </div>
            </div>

            {/* GRID DE INFORMAÇÕES */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl ${isPremium ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                
                {/* Info 1 */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPremium ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-400 shadow-sm'}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Nível de Acesso</p>
                        <p className="font-semibold">{isPremium ? 'Completo (Ilimitado)' : 'Restrito'}</p>
                    </div>
                </div>

                {/* Info 2 */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPremium ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-400 shadow-sm'}`}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Última Renovação</p>
                        <p className="font-semibold">{subscription ? formatData(subscription.updatedAt) : '-'}</p>
                    </div>
                </div>

                {/* Info 3 */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPremium ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-400 shadow-sm'}`}>
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Gateway</p>
                        <p className="font-semibold">Kiwify Secure</p>
                    </div>
                </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {!isPremium ? (
                     <a 
                     href="https://pay.kiwify.com.br/YfRpxeU"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-1 flex items-center justify-center gap-2"
                   >
                     Fazer Upgrade Agora
                     <ExternalLink size={18} />
                   </a>
                ) : (
                    <div className="flex items-center gap-2 text-sm opacity-70">
                        <AlertCircle size={16} />
                        <span>Sua assinatura está ativa e operando normalmente.</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ÁREA DE SUPORTE / CANCELAMENTO */}
      {isPremium && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                Suporte da Assinatura
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-2xl">
                Precisa alterar forma de pagamento, emitir nota fiscal ou cancelar sua recorrência? 
                Nossa equipe de suporte resolve isso diretamente para você para garantir a segurança dos seus dados.
            </p>
            
            <a 
                href={`mailto:suporte@ruralis.com?subject=Gestão de Assinatura Ruralis PRO&body=Olá, preciso de ajuda com minha assinatura vinculada ao email: ${userEmail}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg transition-colors bg-slate-50 hover:bg-white"
            >
                <Mail size={16} />
                Entrar em contato com Suporte
            </a>
          </div>
      )}
    </div>
  );
}

// Função auxiliar de tradução mantida
function translateStatus(status?: string) {
  if (!status) return 'Inativo';
  const map: Record<string, string> = {
    'paid': 'Ativo',
    'approved': 'Aprovado',
    'active': 'Ativo',
    'past_due': 'Pendente',
    'canceled': 'Cancelado',
    'refunded': 'Reembolsado',
    'suspended': 'Suspenso'
  };
  return map[status] || status;
}