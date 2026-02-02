"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Technician, getTechnicians, saveTechnician, deleteTechnician } from "@/services/firestore";
import { UserCog, Plus, Trash2, Mail, CreditCard, Search, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TecnicosPage() {
    const { user, loading, plan } = useAuth();
    const router = useRouter();

    const [techs, setTechs] = useState<Technician[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // New Tech Form
    const [newName, setNewName] = useState("");
    const [newCrea, setNewCrea] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push("/?login=true");
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.uid) loadTechs();
    }, [user]);

    const loadTechs = async () => {
        if (user?.uid) {
            const data = await getTechnicians(user.uid);
            setTechs(data);
        }
    };

    const handleNewTechClick = () => {
        if (plan === 'free' && techs.length >= 1) {
            setShowUpgradeModal(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        setSaving(true);
        try {
            await saveTechnician(user.uid, newName, newCrea, newEmail);
            await loadTechs();
            setIsModalOpen(false);
            setNewName("");
            setNewCrea("");
            setNewEmail("");
        } catch (error) {
            alert("Erro ao salvar técnico.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este técnico?")) return;
        try {
            await deleteTechnician(id);
            await loadTechs();
        } catch (error) {
            alert("Erro ao deletar.");
        }
    };

    const filteredTechs = techs.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.crea?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-emerald-600"></span></div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2 transition-colors">
                            <ArrowLeft size={14} /> Voltar ao Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <UserCog className="text-purple-600" /> Responsáveis Técnicos
                        </h1>
                    </div>
                    <button
                        onClick={handleNewTechClick}
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                    >
                        <Plus size={20} /> Novo Técnico
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CREA..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                    />
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTechs.map(tech => (
                        <div key={tech.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{tech.name}</h3>
                                <div className="flex flex-col gap-1 mt-2">
                                    {tech.crea && (
                                        <p className="text-slate-500 text-sm flex items-center gap-2 font-mono">
                                            <CreditCard size={14} className="text-purple-400" /> {tech.crea}
                                        </p>
                                    )}
                                    {tech.email && (
                                        <p className="text-slate-500 text-sm flex items-center gap-2">
                                            <Mail size={14} className="text-purple-400" /> {tech.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => tech.id && handleDelete(tech.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {filteredTechs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            Nenhum técnico cadastrado.
                        </div>
                    )}
                </div>

            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Limite Atingido</h2>
                        <p className="text-slate-600 mb-6 font-medium">
                            O plano Grátis permite apenas <strong>1 Responsável Técnico</strong>. Faça o upgrade para cadastrar ilimitados.
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/assinatura"
                                className="block w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                            >
                                Ser Premium Agora
                            </Link>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="block w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Talvez Depois
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Novo Técnico</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="Ex: Dra. Ana Souza"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registro (CREA/CRMV)</label>
                                <input
                                    type="text"
                                    value={newCrea}
                                    onChange={(e) => setNewCrea(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="Ex: CREA-PR 12345"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                                >
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
