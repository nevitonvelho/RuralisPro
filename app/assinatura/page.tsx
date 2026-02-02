"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, CheckCircle2, Crown, Calendar, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AssinaturaPage() {
    const { user, loading, plan } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/?login=true");
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-emerald-600"></span></div>;

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assinatura & Plano</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        Gerencie o status da sua conta e pagamentos.
                    </p>
                </div>

                {/* MAIN CARD - DARK THEME */}
                <div className="bg-[#0f172a] rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden mb-12">

                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${plan === 'free' ? 'bg-slate-700 shadow-slate-900/50' : 'bg-emerald-600 shadow-emerald-900/50'}`}>
                                    <Crown size={32} fill="currentColor" />
                                </div>
                                <div>
                                    <p className={`font-bold text-xs uppercase tracking-widest mb-1 ${plan === 'free' ? 'text-slate-400' : 'text-emerald-500'}`}>Plano Atual</p>
                                    <h2 className="text-4xl font-black text-white tracking-tight">
                                        {plan === 'pro' ? 'Ruralis PRO' : plan === 'corp' ? 'Ruralis CORP' : 'Plano Gratuito'}
                                    </h2>
                                </div>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${plan === 'free' ? 'bg-slate-700/50 text-slate-300 border-slate-600' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${plan === 'free' ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                                    {plan === 'free' ? 'Básico' : 'Ativo'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* Acesso */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <Shield size={14} /> Acesso
                                </div>
                                <p className="text-white font-bold text-lg">
                                    {plan === 'free' ? '5 Análises' : 'Ilimitado'}
                                </p>
                            </div>

                            {/* Renovação */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <Calendar size={14} /> Renovação
                                </div>
                                <p className="text-white font-bold text-lg">
                                    {plan === 'free' ? '-' : 'Mensal'}
                                </p>
                            </div>

                            {/* Pagamento */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <CreditCard size={14} /> Pagamento
                                </div>
                                <p className="text-white font-bold text-lg">
                                    {plan === 'free' ? '-' : 'Kiwify Secure'}
                                </p>
                            </div>
                        </div>

                        {/* Banner Inferior */}
                        {plan && plan !== 'free' ? (
                            <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-emerald-500" />
                                <span className="text-emerald-100 font-medium text-sm">Sua conta está ativa e operando com capacidade máxima.</span>
                            </div>
                        ) : (
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 group hover:border-emerald-500/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                                        <Crown size={18} />
                                    </div>
                                    <span className="text-slate-200 font-medium text-sm">Faça o upgrade para desbloquear todas as ferramentas.</span>
                                </div>
                                <Link href="/#planos" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">
                                    Ver Planos
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* HELPER CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Central de Ajuda */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer">
                        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Central de Ajuda</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Precisa de nota fiscal, alterar dados cadastrais ou cancelar? Nossa equipe de suporte resolve para você.
                        </p>
                        <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Entrar em contato <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* ID da Assinatura ou Upgrade Card */}
                    {plan === 'free' ? (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
                            {/* Efeito Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-all"></div>

                            <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                                <Crown size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Desbloquear Ruralis Pro</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                Assine agora para ter acesso ilimitado a todas as ferramentas e suporte prioritário.
                            </p>
                            <a href="https://pay.kiwify.com.br/YfRpxeU" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-900/20 block">
                                Ver Planos Disponíveis
                            </a>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-white text-slate-400 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                <Shield size={24} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ID da Assinatura</p>
                            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-mono text-sm text-slate-600 select-all">
                                {user.uid}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4">
                                Processado via Kiwify Payments
                            </p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
