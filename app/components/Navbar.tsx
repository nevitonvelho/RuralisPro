// ... (imports remain mostly the same, ensuring all icons are available)
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
  Sparkles,
  Home,
  FileText,
  CreditCard,
  ChevronRight
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
  const [scrolled, setScrolled] = useState(false);

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

  const openAuthModal = () => {
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
    signOut(auth);
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
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-white/50 shadow-inner">
            <NavLink href="/">Início</NavLink>
            <NavLink href="/analises">Análises</NavLink>
            <NavLink href="/planos">Planos</NavLink>
          </nav>

          {/* 3. BUSCA PREMIUM (Desktop) */}
          <div className="hidden md:block relative w-full max-w-xs group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
            </div>
            <input
              type="text"
              placeholder="O que você procura hoje?"
              className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

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

            {/* 1. Busca Mobile */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar ferramenta..."
                className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            {/* 2. Links Principais */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Navegação</p>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Home size={20} /></div> Início
              </Link>
              <Link href="/analises" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><FileText size={20} /></div> Análises
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

      {/* --- MODAL DE AUTENTICAÇÃO (MANTIDO IGUAL) --- */}
      <dialog id="modal_auth" className="modal modal-bottom sm:modal-middle backdrop:backdrop-blur-2xl backdrop:bg-slate-900/70 z-[60]">
        {/* ... (Conteúdo do Modal Mantido, apenas garantindo z-index alto) ... */}
        <div className="modal-box p-0 bg-white overflow-hidden shadow-2xl max-w-[400px] rounded-2xl relative border border-slate-100">

          {/* --- CABEÇALHO MODERNO --- */}
          <div className="bg-gradient-to-br from-emerald-700 to-lime-600 p-8 pb-10 text-white relative overflow-hidden flex flex-col items-center justify-center">

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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@exemplo.com"
                    className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-700">Senha</label>
                  {isLoginTab && (
                    <a href="#" className="text-xs font-semibold text-emerald-700 hover:underline">
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div
                onClick={() => setCaptchaChecked(!captchaChecked)}
                className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all select-none ${captchaChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${captchaChecked ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'}`}>
                    {captchaChecked && <CheckSquare size={16} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-600">Não sou um robô</span>
                </div>
                <ShieldCheck size={20} className="text-slate-300" />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-slate-900/10 hover:shadow-emerald-900/20 active:translate-y-0.5 mt-2 flex items-center justify-center gap-2">
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