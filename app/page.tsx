"use client";

import Link from "next/link";
import { 
  Sprout, 
  Beef, 
  Tractor, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  LayoutGrid, 
  BarChart3,
  FileText,
  Smartphone,
  History,
  MousePointerClick
} from "lucide-react";

export default function Home() {
  const categorias = [
    {
      titulo: "Agronomia",
      desc: "Manejo, solo e potencial produtivo",
      cor: "text-green-700",
      bgIcon: "bg-green-100",
      borderHover: "group-hover:border-green-300",
      bgHover: "group-hover:bg-green-50/50",
      icon: <Sprout size={24} />,
      calcs: [
        { name: "Correção de Solo", slug: "calagem" },
        { name: "Adubação NPK", slug: "adubacao" },
        { name: "Estande de Plantas", slug: "populacao-plantas" },
        { name: "Estimativa de Safra", slug: "estimativa-campo" },
        { name: "Perdas na Colheita", slug: "calculo-perdas-colheita" },
        { name: "Balanço Hídrico", slug: "deplecao-agua-solo" }
      ]
    },
    {
      titulo: "Pecuária",
      desc: "Zootecnia e eficiência animal",
      cor: "text-amber-700",
      bgIcon: "bg-amber-100",
      borderHover: "group-hover:border-amber-300",
      bgHover: "group-hover:bg-amber-50/50",
      icon: <Beef size={24} />,
      calcs: [
        { name: "Desempenho (GMD)", slug: "gmd" },
        { name: "Custo da Arroba", slug: "custo-arroba" },
        { name: "Taxa de Lotação", slug: "taxa-lotacao" },
        { name: "Estratégia Inverno", slug: "suplementacao_inverno" },
        { name: "Ração e Dieta", slug: "formulacao-racoes" },
        { name: "Rendimento Carcaça", slug: "rendimento-carcaca" }
      ]
    },
    {
      titulo: "Maquinário",
      desc: "Performance e dimensionamento",
      cor: "text-blue-700",
      bgIcon: "bg-blue-100",
      borderHover: "group-hover:border-blue-300",
      bgHover: "group-hover:bg-blue-50/50",
      icon: <Tractor size={24} />,
      calcs: [
        { name: "Gestão Combustível", slug: "consumo-combustivel" },
        { name: "Ritmo Operacional", slug: "capacidade-operacional" },
        { name: "Índice de Patinagem", slug: "patinagem-pneus" },
        { name: "Calibração Pulverizador", slug: "regulagem-pulverizador" },
        { name: "Silos e Armazenagem", slug: "dimensionamento-silos" },
        { name: "Eficiência Irrigação", slug: "eficiencia-irrigacao" }
      ]
    },
    {
      titulo: "Gestão",
      desc: "Inteligência de mercado",
      cor: "text-slate-700",
      bgIcon: "bg-slate-200",
      borderHover: "group-hover:border-slate-400",
      bgHover: "group-hover:bg-slate-50/50",
      icon: <TrendingUp size={24} />,
      calcs: [
        { name: "ROI e Viabilidade", slug: "roi" },
        { name: "Ponto de Equilíbrio", slug: "ponto-equilibrio" },
        { name: "Conversor Agrícola", slug: "conversao-medidas" },
        { name: "Frete e Logística", slug: "frete-agricola" },
        { name: "Descontos de Grãos", slug: "desconto-unidade" },
        { name: "Simulador Crédito", slug: "credito-rural" }
      ]
    }
  ];

  const features = [
    {
      icon: <FileText size={20} />,
      title: "Relatórios em PDF",
      desc: "Exporte laudos técnicos profissionais prontos para imprimir ou enviar no WhatsApp.",
      color: "bg-red-50 text-red-600"
    },
    {
      icon: <History size={20} />,
      title: "Histórico de Análises",
      desc: "Salve seus cálculos na nuvem e acesse quando quiser para comparar safras.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <Smartphone size={20} />,
      title: "Acesso Mobile",
      desc: "Interface 100% responsiva para usar no tablet ou celular, direto do campo.",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <div className="pb-20 bg-slate-50/50">
      
      {/* 1. HERO SECTION COM BACKGROUND GRID */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 border-b border-slate-200">
        
        {/* Background Pattern (Grid Tecnológico) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nova Versão 2.0 Disponível</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-[1.1]">
            Inteligência agronômica <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-green-600 to-lime-500">
              na palma da sua mão.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Substitua planilhas complexas por diagnósticos rápidos. 
            Mais de <span className="text-slate-900 font-bold">20 ferramentas validadas</span> para 
            tomada de decisão no campo e no escritório.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analises" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-slate-900/10 hover:shadow-green-900/20 hover:-translate-y-1 flex items-center justify-center gap-2">
              <LayoutGrid size={20} />
              Começar Agora
            </Link>
            <Link href="/planos" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
              Ver Planos e Preços
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="mt-12 pt-8 border-t border-slate-100/60 flex flex-wrap justify-center gap-8 md:gap-16">
             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Dados da Embrapa</span>
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Sem instalação (Web)</span>
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Suporte Especializado</span>
             </div>
          </div>

        </div>
      </section>

      {/* 2. SEÇÃO DE BENEFÍCIOS (NOVA) */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-slate-900">Muito mais que uma calculadora</h2>
                <p className="text-slate-500 mt-2">Um ecossistema completo para o profissional do agro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                            {feat.icon}
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">{feat.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. GRID DE FERRAMENTAS */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MousePointerClick className="text-green-600" size={28} />
                Catálogo de Soluções
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categorias.map((cat, i) => (
            <div key={i} className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              
              {/* Header do Card */}
              <div className="p-6 pb-4">
                <div className={`w-12 h-12 rounded-xl ${cat.bgIcon} ${cat.cor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-xl text-slate-900">{cat.titulo}</h3>
                <p className="text-sm text-slate-500 mt-1">{cat.desc}</p>
              </div>
              
              {/* Lista (Com design mais limpo) */}
              <div className="flex-1 px-2 pb-2">
                <div className="bg-slate-50/50 rounded-xl p-2 space-y-1">
                    {cat.calcs.map((calc, j) => (
                        <Link 
                            key={j}
                            href={`/analises/${calc.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 hover:text-green-700 transition-all text-sm font-medium group/item"
                        >
                            <span className="truncate">{calc.name}</span>
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-green-500" />
                        </Link>
                    ))}
                </div>
              </div>

              {/* Footer do Card */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                 <Link href="/analises" className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-green-700 flex items-center gap-1 transition-colors">
                    Ver todos <ArrowRight size={12} />
                 </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CALL TO ACTION FINAL */}
      <section className="mt-24 px-4">
        <div className="max-w-5xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-lime-600 rounded-[2.5rem] rotate-1 opacity-20 blur-sm"></div>
            <div className="relative bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center overflow-hidden shadow-2xl">
                
                {/* Efeitos de fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                        <BarChart3 className="text-lime-400" size={24} />
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                    Sua demanda não está listada?
                    </h2>
                    
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg">
                    Nosso ecossistema evolui com o produtor. Solicite o desenvolvimento de um novo <strong>modelo agronômico</strong> para nossa equipe.
                    </p>
                    
                    <a href="mailto:contato@ruralis.com" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-lime-400 transition-all shadow-lg active:scale-95">
                    <Zap size={20} className="fill-slate-900" />
                    Solicitar Nova Análise
                    </a>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}