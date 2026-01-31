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
  UserPlus, 
  LogOut, 
  Settings, 
  CreditCard, 
  ChevronDown,
  LayoutGrid
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
  
  // Estados para menus dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(isLoginTab ? "E-mail ou senha incorretos." : "Erro ao criar conta. Verifique os dados.");
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    signOut(auth);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* 1. ÁREA DA ESQUERDA: LOGO + MENU DESKTOP */}
          <div className="flex items-center gap-8">
            {/* LOGO OTIMIZADA */}
            <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
               {/* Ajuste o width conforme sua logo real para não distorcer */}
               <img src="/logo.png" alt="RuralisPro" className="h-20 w-auto object-contain" />
            </Link>

            {/* LINKS DE NAVEGAÇÃO (DESKTOP) */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Início
              </Link>
              <Link href="/calculadoras" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                Calculadoras
              </Link>
              <Link href="/planos" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Planos
              </Link>
            </nav>
          </div>
          
          {/* 2. ÁREA CENTRAL/DIREITA: BUSCA */}
          <div className="hidden md:flex flex-1 max-w-sm ml-auto mr-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Buscar ferramenta..." 
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 3. ÁREA DA DIREITA: AUTH E PERFIL */}
          <div className="flex items-center gap-3">
            {user ? (
              // --- USER DROPDOWN (Novo e Melhorado) ---
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Logado como</p>
                      <p className="text-sm font-semibold text-slate-800 truncate" title={user.email || ''}>
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <Link 
                        href="/configuracoes" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LayoutGrid size={16} className="text-slate-400" />
                        Minha Assinatura
                      </Link>
                      <Link 
                        href="/configuracoes" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Settings size={16} className="text-slate-400" />
                        Configurações
                      </Link>
                    </div>

                    <div className="p-2 border-t border-slate-100 mt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <LogOut size={16} />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // --- BOTOES DE LOGIN/CRIAR CONTA ---
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setIsLoginTab(false); (document.getElementById('modal_auth') as any).showModal(); }}
                  className="hidden sm:block text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                >
                  Criar conta
                </button>
                <button 
                  onClick={() => { setIsLoginTab(true); (document.getElementById('modal_auth') as any).showModal(); }}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 hover:shadow-emerald-200 active:scale-95"
                >
                  <User size={16} />
                  Entrar
                </button>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button 
              className="p-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU CONTENT --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 animate-in slide-in-from-top-5">
             <div className="space-y-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-slate-50 text-slate-800 font-medium">Início</Link>
                <Link href="/calculadoras" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">Calculadoras</Link>
                <Link href="/planos" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">Planos e Preços</Link>
             </div>
             {/* Busca Mobile */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Buscar..." className="w-full bg-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm outline-none" />
             </div>
          </div>
        )}
      </header>

      {/* --- MODAL DE AUTENTICAÇÃO (MANTIDO IGUAL, APENAS ESTILOS LEVES) --- */}
      <dialog id="modal_auth" className="modal modal-bottom sm:modal-middle backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm">
        <div className="modal-box p-0 bg-white overflow-hidden border-none shadow-2xl max-w-md rounded-3xl">
          
          <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>
            
            <form method="dialog">
              <button className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/10">
                <X size={18} />
              </button>
            </form>
            <h3 className="font-black text-2xl tracking-tight relative z-10">
              {isLoginTab ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h3>
            <p className="text-emerald-50 text-sm mt-1 relative z-10 font-medium">
              {isLoginTab ? "Acesse suas ferramentas de precisão." : "Junte-se a milhares de produtores."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2">
              {isLoginTab ? <User size={18} /> : <UserPlus size={18} />}
              {isLoginTab ? "Acessar Portal" : "Criar Conta Grátis"}
            </button>

            <div className="text-center pt-4 border-t border-slate-100 mt-6">
              <p className="text-slate-500 text-xs font-medium">
                {isLoginTab ? "Ainda não tem conta?" : "Já possui uma conta?"} {" "}
                <button 
                  type="button"
                  onClick={() => setIsLoginTab(!isLoginTab)}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  {isLoginTab ? "Cadastre-se aqui" : "Faça login agora"}
                </button>
              </p>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}