"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Menu, 
  User, 
  Mail, 
  Lock, 
  X, 
  LogOut, 
  Settings, 
  ChevronDown,
  LayoutGrid,
  ArrowRight,
  LogIn,
  CheckSquare,
  ShieldCheck,
  Sparkles // Adicionei um ícone de brilho para dar um charme no texto
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function Navbar() {
  const { user } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openAuthModal = () => {
    const modal = document.getElementById('modal_auth') as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
        setError("Por favor, confirme que você não é um robô.");
        return;
    }
    setError("");
    try {
      if (isLoginTab) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      (document.getElementById('modal_auth') as any).close();
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(isLoginTab ? "Credenciais inválidas." : "Erro ao criar conta.");
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    signOut(auth);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* 1. LOGO NAVBAR */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
               <img src="/logo.png" alt="RuralisPro" className="h-10 w-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg transition-all">
                Início
              </Link>
              <Link href="/analises" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1">
                Análises
              </Link>
              <Link href="/planos" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg transition-all">
                Planos
              </Link>
            </nav>
          </div>
          
          {/* 2. BUSCA */}
          <div className="hidden md:flex flex-1 max-w-xs ml-auto mr-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-lime-600 transition-colors" size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Buscar análise..." 
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* 3. AUTH */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all border ${isProfileOpen ? 'bg-slate-50 border-slate-200' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded bg-gradient-to-br from-green-700 to-lime-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-green-200 ring-2 ring-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-green-700' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Conta Conectada</p>
                      <p className="text-sm font-semibold text-slate-800 truncate" title={user.email || ''}>
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <Link href="/assinatura" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-green-800 hover:bg-green-50 rounded bg-transparent transition-colors">
                        <LayoutGrid size={16} className="text-slate-400" />
                        Minha Assinatura
                      </Link>
                      <Link href="/configuracoes" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-green-800 hover:bg-green-50 rounded bg-transparent transition-colors">
                        <Settings size={16} className="text-slate-400" />
                        Configurações
                      </Link>
                    </div>

                    <div className="p-2 border-t border-slate-100 mt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors font-medium">
                        <LogOut size={16} />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-slate-200 hover:shadow-green-900/20 active:scale-95 group"
              >
                <span>Acessar Conta</span>
                <LogIn size={16} className="text-slate-400 group-hover:text-lime-300 transition-colors" />
              </button>
            )}

            <button className="p-2 hover:bg-slate-100 rounded-lg md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MODAL DE AUTENTICAÇÃO --- */}
      <dialog id="modal_auth" className="modal modal-bottom sm:modal-middle backdrop:backdrop-blur-2xl backdrop:bg-slate-900/70">
        
        <div className="modal-box p-0 bg-white overflow-hidden shadow-2xl max-w-[400px] rounded-2xl relative border border-slate-100">
          
          {/* --- CABEÇALHO MODERNO (Atualizado) --- */}
          <div className="bg-gradient-to-br from-green-700 to-lime-600 p-8 pb-10 text-white relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* Efeitos de fundo (luzes) */}
            <div className="absolute top-0 right-0 w-full h-full bg-white/5 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-lime-400/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <form method="dialog">
              <button className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors z-20 bg-white/10 hover:bg-white/20 p-1 rounded-full backdrop-blur-sm">
                <X size={18} />
              </button>
            </form>
            
            <div className="relative z-10 flex flex-col items-center gap-4">
                {/* LOGO */}
                <img 
                  src="/logo.png" 
                  alt="Ruralis Logo" 
                  className="h-14 w-auto object-contain brightness-0 invert drop-shadow-lg" 
                />
                
                {/* BADGE / PÍLULA (Substituindo o texto solto) */}
                {/* Isso cria uma caixinha translúcida que organiza o texto */}
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 shadow-sm">
                  <Sparkles size={10} className="text-lime-200" />
                  <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                    Plataforma de Inteligência
                  </span>
                </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 bg-white">
            
            <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                    type="button"
                    onClick={() => setIsLoginTab(true)}
                    className={`flex-1 py-2 text-sm font-bold rounded transition-all ${isLoginTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Entrar
                </button>
                <button
                    type="button"
                    onClick={() => setIsLoginTab(false)}
                    className={`flex-1 py-2 text-sm font-bold rounded transition-all ${!isLoginTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Cadastrar
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 ml-1"></span>
                    {error}
                </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@exemplo.com" 
                    className="w-full bg-white border border-slate-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-700">Senha</label>
                  {isLoginTab && (
                    <a href="#" className="text-xs font-semibold text-green-700 hover:underline">
                        Esqueceu a senha?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-white border border-slate-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div 
                onClick={() => setCaptchaChecked(!captchaChecked)}
                className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all select-none ${captchaChecked ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
              >
                 <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${captchaChecked ? 'bg-green-600 border-green-600' : 'bg-white border-slate-300'}`}>
                        {captchaChecked && <CheckSquare size={16} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-600">Não sou um robô</span>
                 </div>
                 <ShieldCheck size={20} className="text-slate-300" />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-slate-900/10 hover:shadow-green-900/20 active:translate-y-0.5 mt-2 flex items-center justify-center gap-2">
              <span>{isLoginTab ? "Entrar" : "Criar Conta"}</span>
              <ArrowRight size={16} />
            </button>
            
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-wide">
                Protegido por reCAPTCHA
            </p>
          </form>
        </div>
        
        <form method="dialog" className="modal-backdrop bg-transparent">
          <button className="cursor-default">close</button>
        </form>
      </dialog>
    </>
  );
}