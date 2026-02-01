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

  // --- SKELETON LOADER (Refinado para não dar "pulo" na tela) ---
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-[300px] animate-pulse relative overflow-hidden">
            <div className="flex gap-6 items-center mb-8">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
                <div className="space-y-3 flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-8 w-64 bg-slate-200 rounded"></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="h-20 bg-slate-50 rounded-xl"></div>
                <div className="h-20 bg-slate-50 rounded-xl"></div>
                <div className="h-20 bg-slate-50 rounded-xl"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-24 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minha Assinatura</h1>
            <p className="text-slate-500 mt-2 font-medium">Gerencie seu plano e detalhes de acesso.</p>
        </div>
        {!isPremium && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-100">
                <Sparkles size={14} />
                Plano Gratuito
            </div>
        )}
      </header>

      {/* CARD PRINCIPAL */}
      <div className={`relative overflow-hidden rounded-3xl border shadow-xl transition-all duration-300 group ${
        isPremium 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* EFEITOS DE FUNDO (Background Blur/Glow) */}
        {isPremium ? (
            <>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </>
        ) : (
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60"></div>
        )}

        <div className="relative z-10 p-8 sm:p-10">
            {/* CABEÇALHO DO CARD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shadow-inner ${
                        isPremium 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-900/20 ring-4 ring-emerald-500/10' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                        {isPremium ? <Crown size={32} strokeWidth={1.5} /> : <User size={32} strokeWidth={1.5} />}
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${isPremium ? 'text-emerald-400' : 'text-slate-400'}`}>
                            Status da Conta
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                            {isPremium ? 'Ruralis PRO' : 'Conta Gratuita'}
                        </h2>
                    </div>
                </div>

                <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2.5 shadow-sm ${
                    subscription?.status === 'active' || subscription?.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-md'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}>
                    <span className={`relative flex h-2.5 w-2.5`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          subscription?.status === 'active' || subscription?.status === 'paid' ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          subscription?.status === 'active' || subscription?.status === 'paid' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}></span>
                    </span>
                    {translateStatus(subscription?.status)}
                </div>
            </div>

            {/* GRID DE INFORMAÇÕES */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-2 rounded-2xl ${isPremium ? 'bg-white/5 border border-white/10 backdrop-blur-sm' : 'bg-slate-50 border border-slate-100'}`}>
                
                {/* Info 1 */}
                <div className={`p-4 rounded-xl flex items-center gap-4 ${isPremium ? 'hover:bg-white/5 transition-colors' : ''}`}>
                    <div className={`p-2.5 rounded-lg ${isPremium ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Acesso</p>
                        <p className="font-bold text-sm">{isPremium ? 'Ilimitado' : 'Restrito'}</p>
                    </div>
                </div>

                {/* Info 2 */}
                <div className={`p-4 rounded-xl flex items-center gap-4 ${isPremium ? 'hover:bg-white/5 transition-colors' : ''}`}>
                    <div className={`p-2.5 rounded-lg ${isPremium ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Renovação</p>
                        <p className="font-bold text-sm">{subscription ? formatData(subscription.updatedAt) : 'Vitalício'}</p>
                    </div>
                </div>

                {/* Info 3 */}
                <div className={`p-4 rounded-xl flex items-center gap-4 ${isPremium ? 'hover:bg-white/5 transition-colors' : ''}`}>
                    <div className={`p-2.5 rounded-lg ${isPremium ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Pagamento</p>
                        <p className="font-bold text-sm">Kiwify Secure</p>
                    </div>
                </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="mt-8">
                {!isPremium ? (
                     <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                                Liberar todo o potencial
                            </h4>
                            <p className="text-sm text-slate-500 max-w-md">
                                Tenha acesso a todas as calculadoras, relatórios ilimitados e suporte prioritário.
                            </p>
                        </div>
                        <a 
                            href="https://pay.kiwify.com.br/YfRpxeU"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 group whitespace-nowrap"
                        >
                            Fazer Upgrade
                            <ArrowRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                        </a>
                     </div>
                ) : (
                    <div className="flex items-center gap-3 text-sm text-emerald-200/80 bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span className="font-medium">Parabéns! Você tem acesso à ferramenta mais completa do mercado.</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ÁREA DE SUPORTE (Refinada) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Mail size={18} className="text-slate-400" />
                Precisa de Ajuda?
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Para alterações cadastrais, 2ª via de nota fiscal ou cancelamento, nossa equipe processa sua solicitação manualmente para sua segurança.
            </p>
            <a 
                href={`mailto:suporte@ruralis.com?subject=Suporte Assinatura Ruralis&body=Email da conta: ${userEmail}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm group"
            >
                Falar com Suporte
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 flex items-center justify-center text-center">
             <p className="text-xs text-slate-400 font-medium max-w-xs">
                ID da Assinatura: <span className="font-mono text-slate-500 select-all">{subscription?.subscription_id || subscription?.kiwify_order_id || 'N/A'}</span>
                <br />
                Processado via Kiwify Payments
             </p>
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