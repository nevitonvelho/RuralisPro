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
  CheckCircle2,
  Sparkles,
  ArrowRight
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
          // Prioriza o plano premium se houver duplicidade nos documentos
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
      return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    }
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const isPremium = subscription?.plan === 'premium';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-5 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-[400px] w-full bg-slate-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 pb-24 animate-in slide-in-from-bottom-4 duration-500">

      {/* HEADER DA PÁGINA */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assinatura & Plano</h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">Gerencie o status da sua conta e pagamentos.</p>
        </div>
      </header>

      {/* CARTÃO PRINCIPAL ( PREMIUM / GRATUITO ) */}
      <div className={`relative overflow-hidden rounded-[2rem] border transition-all duration-300 shadow-2xl ${isPremium
          ? 'bg-slate-900 border-slate-800 text-white shadow-emerald-900/10'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>

        {/* BACKGROUND EFFECTS */}
        {isPremium ? (
          <>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          </>
        ) : (
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-slate-50 to-white pointer-events-none"></div>
        )}

        <div className="relative z-10 p-8 md:p-10">

          {/* TOPO DO CARD: ÍCONE + TÍTULO + STATUS */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isPremium
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white ring-4 ring-emerald-500/20'
                  : 'bg-white border border-slate-100 text-slate-400 shadow-sm'
                }`}>
                {isPremium ? <Crown size={32} strokeWidth={2} /> : <User size={32} strokeWidth={1.5} />}
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isPremium ? 'text-emerald-400' : 'text-slate-400'}`}>
                  Plano Atual
                </p>
                <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isPremium ? 'text-white' : 'text-slate-800'}`}>
                  {isPremium ? 'Ruralis PRO' : 'Conta Gratuita'}
                </h2>
              </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm ${subscription?.status === 'active' || subscription?.status === 'paid'
                ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20 backdrop-blur-md'
                : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
              <span className={`relative flex h-2 w-2`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${subscription?.status === 'active' || subscription?.status === 'paid' ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${subscription?.status === 'active' || subscription?.status === 'paid' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}></span>
              </span>
              {translateStatus(subscription?.status)}
            </div>
          </div>

          {/* GRID DE DETALHES */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-10`}>
            {/* BLOCO 1 */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${isPremium ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} className={isPremium ? 'text-emerald-400' : 'text-slate-400'} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>Acesso</span>
              </div>
              <p className={`text-lg font-bold ${isPremium ? 'text-white' : 'text-slate-800'}`}>
                {isPremium ? 'Ilimitado' : 'Restrito'}
              </p>
            </div>

            {/* BLOCO 2 */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${isPremium ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className={isPremium ? 'text-emerald-400' : 'text-slate-400'} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>Renovação</span>
              </div>
              <p className={`text-lg font-bold ${isPremium ? 'text-white' : 'text-slate-800'}`}>
                {subscription ? formatData(subscription.updatedAt) : 'Vitalício'}
              </p>
            </div>

            {/* BLOCO 3 */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${isPremium ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className={isPremium ? 'text-emerald-400' : 'text-slate-400'} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>Pagamento</span>
              </div>
              <p className={`text-lg font-bold ${isPremium ? 'text-white' : 'text-slate-800'}`}>
                Kiwify Secure
              </p>
            </div>
          </div>

          {/* RODAPÉ DO CARD: UPGRADE OU MENSAGEM */}
          <div className="border-t border-white/10 pt-8">
            {!isPremium ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-lg">Faça o Upgrade para o PRO</h4>
                  <p className="text-sm text-slate-500">Desbloqueie todas as ferramentas agrícolas avançadas.</p>
                </div>
                <a
                  href="https://pay.kiwify.com.br/YfRpxeU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 group"
                >
                  Quero ser PRO
                  <ArrowRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-emerald-200/90 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <div className="bg-emerald-500 rounded-full p-1"><CheckCircle2 size={14} className="text-white" /></div>
                <span className="font-medium">Sua conta está ativa e operando com capacidade máxima.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ÁREA DE SUPORTE E SEGURANÇA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 sm:p-8 hover:border-slate-300 transition-colors shadow-sm">
          <div className="bg-slate-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-slate-600">
            <Mail size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">Central de Ajuda</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Precisa de nota fiscal, alterar dados cadastrais ou cancelar? Nossa equipe de suporte resolve para você.
          </p>
          <a
            href={`mailto:suporte@ruralis.com?subject=Suporte Assinatura Ruralis&body=Email da conta: ${userEmail}`}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-emerald-700 font-bold text-sm group transition-colors"
          >
            Entrar em contato
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </a>
        </div>

        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[1.5rem] p-6 sm:p-8 flex flex-col justify-center items-center text-center">
          <div className="mb-3 p-2 bg-white rounded-lg shadow-sm border border-slate-100">
            <ShieldCheck size={20} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">ID da Assinatura</p>
          <code className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-mono text-sm mb-4 select-all">
            {subscription?.subscription_id || subscription?.kiwify_order_id || 'N/A'}
          </code>
          <p className="text-[10px] text-slate-400">Processado via Kiwify Payments</p>
        </div>
      </div>
    </div>
  );
}

function translateStatus(status?: string) {
  if (!status) return 'Gratuito';
  const map: Record<string, string> = {
    'paid': 'Ativo',
    'approved': 'Aprovado',
    'active': 'Ativo',
    'past_due': 'Pagamento Pendente',
    'canceled': 'Cancelado',
    'refunded': 'Reembolsado',
    'suspended': 'Suspenso'
  };
  return map[status] || status;
}