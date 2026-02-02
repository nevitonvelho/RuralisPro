"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, X, CheckSquare, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!captchaChecked) {
            setError("Por favor, confirme que você não é um robô.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            if (isLoginTab) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onClose();
            setEmail("");
            setPassword("");
            // Redirecionar para o Dashboard após login
            window.location.href = "/dashboard";
        } catch (err: any) {
            console.error(err);
            setError(isLoginTab ? "Credenciais inválidas." : "Erro ao criar conta. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                {/* Dynamic Header */}
                {/* Dynamic Header */}
                <div className="relative px-8 pt-12 pb-6 text-center transition-colors duration-500 overflow-hidden bg-white">

                    {/* Icon/Logo area */}
                    <div className="relative z-10 flex justify-center mb-6">
                        <div className="p-2">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={200}
                                height={80}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <h2 className="relative z-10 text-2xl font-black text-slate-800 mb-2 tracking-tight">
                        {isLoginTab ? "Bem-vindo de volta!" : "Crie sua conta"}
                    </h2>
                    <p className="relative z-10 text-slate-500 text-sm font-medium">
                        {isLoginTab
                            ? "Acesse sua conta para gerenciar suas análises."
                            : "Comece agora e otimize sua produção rural."}
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">

                    {/* Tabs */}
                    <div className="flex p-1.5 bg-slate-100 rounded-xl mb-6 relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out`}
                            style={{ left: isLoginTab ? '6px' : 'calc(50% + 0px)' }}
                        />
                        <button
                            onClick={() => { setIsLoginTab(true); setError(""); }}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 ${isLoginTab ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => { setIsLoginTab(false); setError(""); }}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 ${!isLoginTab ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 ml-1" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5 group">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nome@exemplo.com"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 pl-11 pr-4 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</label>
                                    {isLoginTab && (
                                        <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                            Esqueceu?
                                        </a>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 pl-11 pr-4 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Recaptcha Placeholder */}
                            <div
                                onClick={() => setCaptchaChecked(!captchaChecked)}
                                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-between transition-all select-none hover:shadow-sm ${captchaChecked ? 'bg-emerald-50/50 border-emerald-500/30' : 'bg-white border-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${captchaChecked ? 'bg-emerald-500 shadow-sm' : 'bg-slate-200'}`}>
                                        {captchaChecked && <CheckSquare size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600">Não sou um robô</span>
                                </div>
                                <ShieldCheck size={18} className={captchaChecked ? "text-emerald-500" : "text-slate-300"} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isLoginTab ? "Acessar Plataforma" : "Criar Minha Conta"}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Sparkles size={10} />
                                Ruralis Pro Seguro
                                <Sparkles size={10} />
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
