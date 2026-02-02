"use client";

// ... (imports remain mostly the same, ensuring all icons are available)
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import {
  Search,
  Menu,
  User,
  X,
  LogOut,
  Settings,
  ChevronDown,
  LayoutGrid,
  LogIn,
  CheckSquare,
  Sparkles,
  Home,
  FileText,
  CreditCard,
  ChevronRight,
  Sprout,
  Crown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import { useSearchParams } from "next/navigation";

export default function Navbar() {
  const { user, plan } = useAuth();
  const searchParams = useSearchParams();


  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Efeito de Scroll para Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Handle URL query param for login
  useEffect(() => {
    if (searchParams.get('login') === 'true' && !user) {
      openAuthModal();
    }
  }, [searchParams, user]);

  const openAuthModal = () => {
    setIsMobileMenuOpen(false);
    setIsLoginOpen(true);
  };



  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    await signOut(auth);
    window.location.href = "/";
  };

  const NavLink = ({ href, children, icon: Icon, onClick }: any) => (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
    >
      {Icon && <Icon size={18} />}
      {children}
    </Link>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
          : "bg-white/50 backdrop-blur-sm border-b border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">

          {/* 1. LOGO */}
          <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity z-50 relative">
            <img src="/logo.png" alt="RuralisPro" className="h-8 sm:h-10 w-auto object-contain" />
          </Link>

          {/* 2. DESKTOP NAV */}
          {/* 2. DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-white/50 shadow-inner">
            {user ? (
              // NAVEGAÇÃO LOGADO
              <>
                <NavLink href="/dashboard" icon={LayoutGrid}>Dashboard</NavLink>
                <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
                <NavLink href="/clientes" icon={User}>Clientes</NavLink>
                <NavLink href="/tecnicos" icon={CheckSquare}>Técnicos</NavLink>

                {plan === 'free' && (
                  <a
                    href="https://pay.kiwify.com.br/YfRpxeU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-wide rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <Crown size={14} fill="currentColor" />
                    Assinar Pro
                  </a>
                )}
              </>
            ) : (
              // NAVEGAÇÃO PÚBLICA
              <>
                <NavLink href="/">Início</NavLink>
                <NavLink href="/#analises">Análises</NavLink>
                <NavLink href="/#planos">Planos</NavLink>
              </>
            )}
          </nav>


          {/* 4. ACTIONS & PROFILE */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-lg z-50 relative active:scale-95 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-all ${isProfileOpen ? 'bg-white border-emerald-200 shadow-md ring-2 ring-emerald-100' : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-200'}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right overflow-hidden">
                    <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Conectado como</p>
                      <p className="text-sm font-bold text-slate-800 truncate" title={user.email || ''}>
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link href="/assinatura" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                        <CreditCard size={18} className="text-slate-400" />
                        Minha Assinatura
                      </Link>
                      <Link href="/configuracoes" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                        <Settings size={18} className="text-slate-400" />
                        Configurações
                      </Link>
                    </div>

                    <div className="p-2 border-t border-slate-100 mt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold">
                        <LogOut size={18} />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-900/20 transition-all active:scale-95 group"
              >
                <span>Entrar</span>
                <div className="bg-white/20 p-1 rounded-full">
                  <ChevronRight size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- MENU MOBILE RESPONSIVO (SLIDE-OVER) --- */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible delay-300'}`}>
        {/* Backdrop desfoque */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Painel lateral */}
        <div className={`absolute top-0 right-0 w-[85%] max-w-[320px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out border-l border-slate-100 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
            <span className="font-black text-slate-900 text-lg">Menu</span>
            {/* O botão X está no header fixo, mas aqui deixamos espaço ou duplicamos se necessário. O header fixo cobre. */}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* 2. Links Principais */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Navegação</p>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Home size={20} /></div> Início
              </Link>
              <Link href="/analises" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><FileText size={20} /></div> Análises
              </Link>
              <Link href="/sobre" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <div className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Sprout size={20} /></div> Sobre
              </Link>
              <Link href="/planos" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Sparkles size={20} /></div> Planos
              </Link>
            </div>

            {/* 3. Área do Usuário */}
            <div className="pt-6 border-t border-slate-100">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-white font-bold shadow-md">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-500 uppercase">Logado como</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/configuracoes" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition-all">
                      Configurações
                    </Link>
                    <button onClick={handleLogout} className="p-3 bg-white border border-red-100 rounded-xl text-center text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-4 px-4">Faça login para salvar seus relatórios e acessar recursos exclusivos.</p>
                  <button
                    onClick={openAuthModal}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} /> Acessar Conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}