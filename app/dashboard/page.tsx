'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { getRecentReports, getClients, deleteReport, Report } from "@/services/firestore";
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    Users,
    FileText,
    Plus,
    ArrowRight,
    Trash2,
    SquarePen,
    Leaf,
    Scale,
    Tractor,
    DollarSign,
    Droplets
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [recentAnalyses, setRecentAnalyses] = useState<Report[]>([]);
    const [clientsCount, setClientsCount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        if (user?.uid) {
            loadDashboardData(user.uid);
        }
    }, [user, authLoading, router]);

    const loadDashboardData = async (uid: string) => {
        setLoadingData(true);
        setError(null);
        try {
            console.log("Dashboard: Iniciando busca para UID:", uid);
            const [reports, clients] = await Promise.all([
                getRecentReports(uid),
                getClients(uid)
            ]);
            console.log("Dashboard: Relatórios encontrados:", reports.length);
            setRecentAnalyses(reports);
            setClientsCount(clients.length);
        } catch (error: any) {
            console.error("Erro ao carregar dashboard:", error);
            setError(error.message || "Erro desconhecido");
        } finally {
            setLoadingData(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (confirm("Tem certeza que deseja excluir esta análise?")) {
            try {
                await deleteReport(id);
                // Otimistic update or reload
                if (user?.uid) loadDashboardData(user.uid);
            } catch (error) {
                alert("Erro ao excluir. Tente novamente.");
            }
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'adubacao': return <Leaf size={20} className="text-emerald-600" />;
            case 'calagem': return <Scale size={20} className="text-stone-600" />;
            case 'consumo-combustivel': return <Tractor size={20} className="text-amber-600" />;
            case 'custo-hectare': return <DollarSign size={20} className="text-green-600" />;
            case 'eficiencia-irrigacao': return <Droplets size={20} className="text-blue-600" />;
            default: return <FileText size={20} className="text-slate-400" />;
        }
    };

    const formatType = (type: string) => {
        switch (type) {
            case 'adubacao': return 'Adubação NPK';
            case 'calagem': return 'Calagem';
            case 'consumo-combustivel': return 'Combustível';
            case 'custo-hectare': return 'Custo/ha';
            case 'populacao-plantas': return 'Pop. Plantas';
            case 'eficiencia-irrigacao': return 'Irrigação';
            default: return type;
        }
    }

    if (authLoading || (loadingData && !user)) {
        return (
            <div className="max-w-7xl mx-auto p-8 animate-pulse">
                <div className="h-8 w-64 bg-slate-200 rounded mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="h-32 bg-slate-200 rounded-xl"></div>
                    <div className="h-32 bg-slate-200 rounded-xl"></div>
                    <div className="h-32 bg-slate-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen pb-24">

            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-500">Bem-vindo de volta, {user?.displayName || 'Produtor'}.</p>
                    </div>
                </div>
                <Link href="/analises" className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                    <Plus size={20} />
                    Nova Análise
                </Link>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold">
                        <span>⚠️ Erro ao carregar dados</span>
                    </div>
                    <p className="text-sm">{error}</p>
                    {error.includes("index") && (
                        <p className="text-sm bg-white/50 p-2 rounded mt-1">
                            <strong>Ação necessária:</strong> O Firebase precisa criar um índice para esta consulta.
                            Abra o console do navegador (F12), procure pelo erro em vermelho e clique no link fornecido pelo Firebase.
                        </p>
                    )}
                    <button
                        onClick={() => user?.uid && loadDashboardData(user.uid)}
                        className="text-sm font-bold underline self-start hover:text-red-900 mt-2"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total de Análises</p>
                            <h3 className="text-2xl font-black text-slate-900">{recentAnalyses.length}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Relatórios gerados na plataforma</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Clientes Cadastrados</p>
                            <h3 className="text-2xl font-black text-slate-900">{clientsCount}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Produtores e propriedades</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Economia Estimada</p>
                            <h3 className="text-2xl font-black text-slate-900">R$ 0,00</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Otimização de recursos</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Análises Recentes</h2>
                        <button onClick={() => user?.uid && loadDashboardData(user.uid)} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Atualizar</button>
                    </div>

                    {recentAnalyses.length === 0 && !error ? (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <FileText size={24} className="text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-700 mb-1">Nenhuma análise encontrada</h3>
                            <p className="text-slate-500 text-sm max-w-xs mb-6">Seus relatórios salvos aparecerão aqui.</p>
                            <Link href="/analises" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                Começar Agora
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                            {recentAnalyses.map((report) => (
                                <Link
                                    href={`/analises/${report.type}?id=${report.id}`}
                                    key={report.id}
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                                        {getIconForType(report.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 truncate pr-2 group-hover:text-emerald-700 transition-colors">{report.title}</h4>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-full">
                                                {report.createdAt?.seconds ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'Hoje'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-slate-500 truncate">{report.clientName || 'Sem cliente'}</p>
                                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-auto">{formatType(report.type)}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pl-2 border-l border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            title="Editar"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <SquarePen size={16} />
                                        </button>
                                        <button
                                            title="Excluir"
                                            onClick={(e) => handleDelete(report.id!, e)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Quick Actions / Clients */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Ruralis PRO</h3>
                            <p className="text-slate-400 text-sm mb-6">Acesse recursos avançados e suporte prioritário.</p>
                            <Link href="/configuracoes" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
                                Gerenciar Assinatura <ArrowRight size={16} />
                            </Link>
                        </div>
                        {/* Decorative BG */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Acesso Rápido</h3>
                        <div className="space-y-2">
                            <Link href="/analises/adubacao" className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-medium text-slate-600">
                                🌱 Recomendação de Adubação
                            </Link>
                            <Link href="/analises/calagem" className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-medium text-slate-600">
                                🧪 Cálculo de Calagem
                            </Link>
                            <Link href="/analises/populacao-plantas" className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-medium text-slate-600">
                                🌽 População de Plantas
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
