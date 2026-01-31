"use client";

import { useState } from "react";
import { Search, Leaf as LeafIcon, Menu, User, Mail, Lock, X, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function Navbar() {
  const { user } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true); // Controla se mostra Login ou Cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <LeafIcon className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800 uppercase">
            Ruralis<span className="text-emerald-600">Pro</span>
          </span>
        </div>
        
        {/* BUSCA (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar calculadora..." 
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all text-sm outline-none"
            />
          </div>
        </div>

        {/* AUTH SECTION */}
        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-bold text-slate-800">{user.email}</p>
                <button onClick={() => signOut(auth)} className="text-[10px] text-red-500 font-bold hover:underline">SAIR</button>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-500/20">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsLoginTab(false); (document.getElementById('modal_auth') as any).showModal(); }}
                className="hidden sm:block text-slate-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-100 transition-all"
              >
                Criar conta
              </button>
              <button 
                onClick={() => { setIsLoginTab(true); (document.getElementById('modal_auth') as any).showModal(); }}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <User size={16} />
                Entrar
              </button>
            </div>
          )}
          <button className="p-2 hover:bg-slate-100 rounded-full md:hidden text-slate-600">
            <Menu size={24} />
          </button>
        </nav>
      </div>

      {/* MODAL DE AUTENTICAÇÃO (LOGIN / REGISTRO) */}
      <dialog id="modal_auth" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 bg-white overflow-hidden border-none shadow-2xl max-w-md">
          
          {/* HEADER DO MODAL */}
          <div className="bg-emerald-600 p-8 text-white relative">
            <form method="dialog">
              <button className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </form>
            <h3 className="font-black text-2xl tracking-tight">
              {isLoginTab ? "Bem-vindo de volta!" : "Crie sua conta gratuita"}
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              {isLoginTab ? "Acesse suas ferramentas de precisão." : "Junte-se a milhares de produtores."}
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="No mínimo 6 caracteres" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 mt-2 flex items-center justify-center gap-2">
              {isLoginTab ? <User size={18} /> : <UserPlus size={18} />}
              {isLoginTab ? "ENTRAR NO PORTAL" : "CRIAR MINHA CONTA"}
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
        <form method="dialog" className="modal-backdrop bg-slate-900/60 backdrop-blur-sm">
          <button>close</button>
        </form>
      </dialog>
    </header>
  );
}