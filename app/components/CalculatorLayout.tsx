"use client";

import React, { ReactNode } from "react";
import {
  Printer,
  MapPin,
  Lock,
  User,
  ChevronRight,
  PenLine,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Interface para o usuário do contexto
interface AuthUser {
  name?: string;
  email?: string;
}

interface CalculatorLayoutProps {
  produtor: string;
  setProdutor: (v: string) => void;
  talhao: string;
  setTalhao: (v: string) => void;
  responsavelTecnico?: string;
  setResponsavelTecnico?: (v: string) => void;
  registroProfissional?: string;
  setRegistroProfissional?: (v: string) => void;
  title: string;
  subtitle: string;
  category: string;
  icon: ReactNode;
  shareText: string;
  children: ReactNode;
  onSave?: () => void;
  saved?: boolean;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

import { getClients, Client } from "@/services/firestore";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

export function CalculatorLayout({
  produtor,
  setProdutor,
  talhao,
  setTalhao,
  responsavelTecnico,
  setResponsavelTecnico,
  registroProfissional,
  setRegistroProfissional,
  title,
  subtitle,
  category,
  icon,
  shareText,
  children,
  onSave,
  saved
}: CalculatorLayoutProps) {

  const { user } = useAuth() as { user: AuthUser & { uid: string } | null };
  const isAuthenticated = !!user;
  const dataRelatorio = new Date().toLocaleDateString('pt-BR');

  const [clients, setClients] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      getClients(user.uid).then(setClients).catch(console.error);
    }
  }, [user]);

  const handleShare = () => {
    const header = `🌱 *Ruralis PRO* | Relatório Técnico\n📂 *Ferramenta:* ${title}\n👤 *Produtor:* ${produtor || 'Não informado'}\n📍 *Talhão:* ${talhao || 'Geral'}\n📅 *Data:* ${dataRelatorio}\n━━━━━━━━━━━━━━━━━━\n\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━\n🔗 _Gerado via Plataforma Ruralis PRO_`;
    const finalMessage = header + shareText + footer;
    window.open(`https://wa.me/?text=${encodeURIComponent(finalMessage)}`, '_blank');
  };

  const handlePrint = () => window.print();

  const handleAction = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      const modal = document.getElementById("modal_auth") as HTMLDialogElement | null;
      modal?.showModal();
    }
  };

  // Autocomplete Logic
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(produtor.toLowerCase()) &&
    c.name !== produtor
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        @media print {
          @page { margin: 0.8cm; size: A4; }
          #print-area { width: 100%; margin: 0; padding: 0; background: white; color: black; }
          input { border: none !important; padding: 0 !important; font-weight: bold !important; background: transparent !important; color: black !important; box-shadow: none !important; }
          .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm { box-shadow: none !important; }
        }
      `}} />

      <div id="print-area" className="max-w-6xl mx-auto pt-8 pb-20 print:pb-0 px-4 md:px-8">

        {/* === CABEÇALHO IMPRESSÃO === */}
        <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-5">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
              <div className="h-10 w-[1px] bg-slate-300"></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ferramenta</p>
                <p className="text-xl font-black uppercase text-black">{category}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-black">{title}</h2>
              <p className="text-xs text-slate-600 font-medium">Emitido em: {dataRelatorio}</p>
            </div>
          </div>

          <div className="flex border border-slate-300 rounded overflow-hidden">
            <div className="flex-1 p-2 border-r border-slate-300">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Produtor</span>
              <span className="text-sm font-bold text-black truncate block">{produtor || '—'}</span>
            </div>
            <div className="flex-1 p-2 border-r border-slate-300">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Talhão / Área</span>
              <span className="text-sm font-bold text-black truncate block">{talhao || '—'}</span>
            </div>
            <div className="flex-1 p-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Responsável Técnico</span>
              <span className="text-sm font-bold text-black truncate block">{responsavelTecnico || user?.name || '_______________________'}</span>
              {(!!registroProfissional) && <span className="text-[9px] font-bold text-slate-500 uppercase block">{registroProfissional}</span>}
            </div>
          </div>
        </div>

        {/* === CABEÇALHO DA TELA === */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10 no-print">
          <div className="flex-1">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm mb-6 transition-colors no-print">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                {icon} {category}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-slate-500 mt-3 text-lg leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            {onSave && (
              <button
                onClick={() => handleAction(onSave)}
                className={`group flex items-center justify-center gap-3 border-2 font-bold text-sm px-6 py-3.5 rounded-xl transition-all active:scale-[0.98] ${saved
                  ? "bg-emerald-100 border-emerald-200 text-emerald-700 cursor-default"
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                  }`}
              >
                {saved ? (
                  <><span>Salvo!</span></>
                ) : (
                  <><Save size={18} /> <span>Salvar Análise</span></>
                )}
              </button>
            )}

            <button
              onClick={() => handleAction(handlePrint)}
              className="group flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm px-6 py-3.5 rounded-xl hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              {isAuthenticated ? (
                <> <Printer size={18} /> <span>Imprimir</span> </>
              ) : (
                <> <Lock size={16} /> <span>Login p/ Imprimir</span> </>
              )}
            </button>

            <button
              onClick={() => handleAction(handleShare)}
              className={`group flex items-center justify-center gap-3 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] ${isAuthenticated
                ? "bg-[#25D366] text-white"
                : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
            >
              {isAuthenticated ? (
                <> <WhatsAppIcon className="w-5 h-5 fill-white" /> <span>WhatsApp</span> <ChevronRight size={16} /> </>
              ) : (
                <> <Lock size={16} /> <span>Login p/ Compartilhar</span> </>
              )}
            </button>
          </div>
        </header>

        {/* === PAINEL DE IDENTIFICAÇÃO === */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 no-print">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 relative">
              <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700"><User size={20} /></div>
              <div className="flex-1 relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Produtor</label>
                <input
                  type="text"
                  value={produtor}
                  onChange={(e) => {
                    setProdutor(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Nome do cliente..."
                  className="w-full text-slate-900 font-bold outline-none bg-transparent"
                />
                {/* Autocomplete Dropdown */}
                {showSuggestions && filteredClients.length > 0 && produtor.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-2 z-50 max-h-48 overflow-y-auto">
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setProdutor(client.name);
                          if (client.location && setTalhao) setTalhao(client.location);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm font-medium text-slate-700 border-b border-slate-50 last:border-0"
                      >
                        {client.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <PenLine size={16} className="text-slate-300" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
              <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700"><MapPin size={20} /></div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Localização</label>
                <input
                  type="text"
                  value={talhao}
                  onChange={(e) => setTalhao(e.target.value)}
                  placeholder="Ex: Piquete 01..."
                  className="w-full text-slate-900 font-bold outline-none bg-transparent"
                />
              </div>
              <PenLine size={16} className="text-slate-300" />
            </div>

            {/* NOVOS CAMPOS: RESPONSÁVEL TÉCNICO - SÓ APARECEM SE A FUNÇÃO SET EXISTIR */}
            {setResponsavelTecnico && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="bg-purple-100 p-2.5 rounded-lg text-purple-700"><User size={20} /></div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resp. Técnico (Opcional)</label>
                  <input
                    type="text"
                    value={responsavelTecnico || ""}
                    onChange={(e) => setResponsavelTecnico(e.target.value)}
                    placeholder={user?.name || "Nome do profissional..."}
                    className="w-full text-slate-900 font-bold outline-none bg-transparent"
                  />
                </div>
                <PenLine size={16} className="text-slate-300" />
              </div>
            )}

            {setRegistroProfissional && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="bg-purple-100 p-2.5 rounded-lg text-purple-700"><Lock size={20} /></div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Registro (CREA/CRMV/Outro)</label>
                  <input
                    type="text"
                    value={registroProfissional || ""}
                    onChange={(e) => setRegistroProfissional(e.target.value)}
                    placeholder="Ex: CREA-PR 123456"
                    className="w-full text-slate-900 font-bold outline-none bg-transparent"
                  />
                </div>
                <PenLine size={16} className="text-slate-300" />
              </div>
            )}

          </div>
        </div>

        <main className="w-full space-y-6">
          {children}
        </main>

        {/* RODAPÉ IMPRESSÃO */}
        <div className="hidden print:flex flex-col justify-end mt-12 pt-8 border-t border-slate-200 avoid-break">
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div className="text-center pt-4 border-t border-black">
              <p className="text-sm font-bold uppercase text-black">{produtor || 'Produtor'}</p>
              <p className="text-xs text-slate-500">Assinatura</p>
            </div>
            <div className="text-center pt-4 border-t border-black">
              <p className="text-sm font-bold uppercase text-black">{responsavelTecnico || user?.name || 'Responsável Técnico'}</p>
              <p className="text-xs text-slate-500">Assinatura / Registro {registroProfissional ? `(${registroProfissional})` : ''}</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest">
            Gerado por Ruralis PRO - A validação técnica presencial é obrigatória.
          </p>
        </div>
      </div>
    </>
  );
}