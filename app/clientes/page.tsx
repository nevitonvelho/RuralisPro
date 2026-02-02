"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Client, getClients, saveClient, deleteClient } from "@/services/firestore";
import { Users, Plus, Trash2, MapPin, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Client Form
    const [newName, setNewName] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push("/?login=true");
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.uid) loadClients();
    }, [user]);

    const loadClients = async () => {
        if (user?.uid) {
            const data = await getClients(user.uid);
            setClients(data);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        setSaving(true);
        try {
            await saveClient(user.uid, newName, newLocation);
            await loadClients();
            setIsModalOpen(false);
            setNewName("");
            setNewLocation("");
        } catch (error) {
            alert("Erro ao salvar cliente.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
        try {
            await deleteClient(id);
            await loadClients();
        } catch (error) {
            alert("Erro ao deletar.");
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <Users className="text-emerald-600" /> Meus Clientes
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                        <Plus size={20} /> Novo Cliente
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou fazenda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                    />
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClients.map(client => (
                        <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                                {client.location && (
                                    <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                        <MapPin size={14} /> {client.location}
                                    </p>
                                )}
                                <p className="text-xs text-slate-400 mt-4 font-mono">
                                    Cadastrado em {new Date(client.createdAt?.seconds * 1000).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => client.id && handleDelete(client.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {filteredClients.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            Nenhum cliente encontrado.
                        </div>
                    )}
                </div>

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Novo Cliente</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Produtor / Cliente</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Localização (Opcional)</label>
                                <input
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Ex: Fazenda Santa Maria"
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
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
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
