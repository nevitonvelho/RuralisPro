"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompanySettings, getCompanySettings, saveCompanySettings } from "@/services/firestore";
import { Building2, Save, MapPin, Phone, Globe, FileText, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: "",
    cnpjOrCpf: "",
    address: "",
    phone: "",
    website: "",
    logoUrl: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?login=true");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      getCompanySettings(user.uid).then((data) => {
        if (data) setSettings(data);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setSuccess(false);
    try {
      await saveCompanySettings(user.uid, settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-emerald-600"></span></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações da Empresa</h1>
            <p className="text-slate-500 mt-2">
              Seus dados aparecerão automaticamente no cabeçalho dos relatórios técnicos.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-100">
          <div className="p-8 space-y-6">

            {/* Nome e Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={14} /> Nome da Fazenda / Empresa
                </label>
                <input
                  type="text"
                  required
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="Ex: Agropecuária Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} /> CNPJ ou CPF
                </label>
                <input
                  type="text"
                  value={settings.cnpjOrCpf}
                  onChange={(e) => setSettings({ ...settings, cnpjOrCpf: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} /> Endereço Completo
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Rodovia BR-163, Km 500 - Zona Rural, Sorriso - MT"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            {/* Contato e Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="(00) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe size={14} /> Website (Opcional)
                </label>
                <input
                  type="text"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  placeholder="www.suafazenda.com.br"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Logo URL (PREMIUM ONLY) */}
            <div className="space-y-2 relative opacity-75">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  Link do Logo (URL da Imagem)
                </label>
                <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> Premium
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={settings.logoUrl}
                  placeholder="Disponível no plano PRO"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed select-none"
                />
                <div className="absolute inset-0 flex items-center justify-end px-4 pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
              </div>
              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                <Lock size={12} />
                Faça o upgrade para personalizar o logo dos seus relatórios.
              </p>
            </div>

          </div>

          <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {success && (
                <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-pulse">
                  <CheckCircle2 size={18} /> Salvo com sucesso!
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}