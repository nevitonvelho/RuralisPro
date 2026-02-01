"use client";

import Link from "next/link";
import {
    Sprout,
    FlaskConical,
    Wheat,
    Timer,
    Fuel,
    Ruler,
    Banknote,
    Calculator,
    DollarSign,
    Droplets,
    Percent,
    Box,
    ShowerHead,
    TrendingUp,
    Utensils,
    Truck,
    Scale,
    CircleDashed,
    Flower2,
    SprayCan,
    Beef,
    LineChart,
    Snowflake,
    Footprints,
    LayoutDashboard,
    ArrowRight
} from "lucide-react";

// Lista de todas as 25 ferramentas disponíveis
const tools = [
    { id: "adubacao", name: "Adubação NPK e Fosfatagem", icon: <Sprout size={24} />, desc: "Cálculo de dosagem de corretivos e fertilizantes." },
    { id: "calagem", name: "Calagem e Gessagem", icon: <FlaskConical size={24} />, desc: "Correção de acidez e alumínio do solo." },
    { id: "calculo-perdas-colheita", name: "Perdas na Colheita", icon: <Wheat size={24} />, desc: "Monitoramento de desperdício na plataforma." },
    { id: "capacidade-operacional", name: "Capacidade Operacional", icon: <Timer size={24} />, desc: "Eficiência de campo (Ha/h) e rendimento." },
    { id: "consumo-combustivel", name: "Consumo de Combustível", icon: <Fuel size={24} />, desc: "Estimativa de gasto diesel e autonomia." },
    { id: "conversao-medidas", name: "Conversor Agrícola", icon: <Ruler size={24} />, desc: "Conversão de áreas, pesos e volumes." },
    { id: "credito-rural", name: "Crédito Rural", icon: <Banknote size={24} />, desc: "Simulação de parcelas e juros (Plano Safra)." },
    { id: "custo-arroba", name: "Custo da Arroba", icon: <Calculator size={24} />, desc: "Custo de produção pecuária por @." },
    { id: "custo-hectare", name: "Custo por Hectare", icon: <DollarSign size={24} />, desc: "Fechamento de custo de produção agrícola." },
    { id: "deplecao-agua-solo", name: "Água no Solo (CAD)", icon: <Droplets size={24} />, desc: "Balanço hídrico e disponibilidade atual." },
    { id: "desconto-unidade", name: "Desconto de Umidade", icon: <Percent size={24} />, desc: "Cálculo de quebra técnica na entrega." },
    { id: "dimensionamento-silos", name: "Dimensionamento de Silos", icon: <Box size={24} />, desc: "Cálculo de volume e capacidade estática." },
    { id: "eficiencia-irrigacao", name: "Eficiência de Irrigação", icon: <ShowerHead size={24} />, desc: "Uniformidade de lâmina e perdas." },
    { id: "estimativa-campo", name: "Estimativa de Produtividade", icon: <TrendingUp size={24} />, desc: "Cálculo de componentes de rendimento." },
    { id: "formulacao-racoes", name: "Formulação de Rações", icon: <Utensils size={24} />, desc: "Balanceamento básico de dieta animal." },
    { id: "frete-agricola", name: "Frete Agrícola", icon: <Truck size={24} />, desc: "Cálculo de custo de transporte por km/ton." },
    { id: "gmd", name: "GMD e Conversão", icon: <Scale size={24} />, desc: "Monitoramento de ganho de peso diário." },
    { id: "patinagem-pneus", name: "Patinagem de Tratores", icon: <CircleDashed size={24} />, desc: "Diagnóstico de tração e lastragem." },
    { id: "ponto-equilibrio", name: "Ponto de Equilíbrio", icon: <Scale size={24} />, desc: "Metas de produtividade para cobrir custos." },
    { id: "populacao-plantas", name: "População de Plantas", icon: <Flower2 size={24} />, desc: "Estande inicial e cálculo de sementes." },
    { id: "regulagem-pulverizador", name: "Pulverização", icon: <SprayCan size={24} />, desc: "Calibração de pontas e volume de calda." },
    { id: "rendimento-carcaca", name: "Rendimento de Carcaça", icon: <Beef size={24} />, desc: "Estimativa de abate e aproveitamento." },
    { id: "roi", name: "ROI e Lucratividade", icon: <LineChart size={24} />, desc: "Análise de retorno sobre investimento." },
    { id: "suplementacao_inverno", name: "Suplementação (Seca)", icon: <Snowflake size={24} />, desc: "Estratégia nutricional de inverno." },
    { id: "taxa-lotacao", name: "Taxa de Lotação", icon: <Footprints size={24} />, desc: "Ajuste de carga animal (UA/ha)." },
];

export default function AnalisesPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-12 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">
                    <LayoutDashboard size={14} /> Ferramentas
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                    Central de Análises
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl text-balance">
                    Selecione uma das ferramentas abaixo para iniciar um novo cálculo ou relatório técnico.
                    Todas as ferramentas utilizam dados em nuvem para segurança e histórico.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/analises/${tool.id}`}
                        className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            {tool.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                            {tool.name}
                        </h3>
                        <p className="text-slate-500 text-sm mb-6 flex-grow">
                            {tool.desc}
                        </p>
                        <div className="flex items-center text-emerald-600 font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all mt-auto">
                            Acessar Ferramenta <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
