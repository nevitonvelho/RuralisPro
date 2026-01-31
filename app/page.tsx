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
  Calculator
} from "lucide-react";

export default function Home() {
  const categorias = [
    {
      titulo: "Agronomia",
      desc: "Plantio, solo e colheita",
      cor: "text-emerald-600",
      bgIcon: "bg-emerald-100",
      borderHover: "hover:border-emerald-300",
      icon: <Sprout size={22} />,
      calcs: [
        { name: "Calagem e Gessagem", slug: "calagem" },
        { name: "Adubação N-P-K", slug: "adubacao" },
        { name: "População de Plantas", slug: "populacao-plantas" },
        { name: "Estimativa de Produtividade", slug: "estimativa-campo" },
        { name: "Perda na Colheita", slug: "calculo-perdas-colheita" },
        { name: "Depleção de Água no Solo", slug: "deplecao-agua-solo" }
      ]
    },
    {
      titulo: "Pecuária",
      desc: "Nutrição e rebanho",
      cor: "text-amber-700",
      bgIcon: "bg-amber-100",
      borderHover: "hover:border-amber-300",
      icon: <Beef size={22} />,
      calcs: [
        { name: "Conversão Alimentar (GMD)", slug: "gmd" },
        { name: "Custo da Arroba", slug: "custo-arroba" },
        { name: "Taxa de Lotação (UA/ha)", slug: "taxa-lotacao" },
        { name: "Suplementação de Inverno", slug: "suplementacao_inverno" },
        { name: "Formulação de Rações", slug: "formulacao-racoes" },
        { name: "Rendimento de Carcaça", slug: "rendimento-carcaca" }
      ]
    },
    {
      titulo: "Maquinário",
      desc: "Eficiência operacional",
      cor: "text-blue-600",
      bgIcon: "bg-blue-100",
      borderHover: "hover:border-blue-300",
      icon: <Tractor size={22} />,
      calcs: [
        { name: "Consumo de Combustível", slug: "consumo-combustivel" },
        { name: "Capacidade Operacional", slug: "capacidade-operacional" },
        { name: "Patinagem de Pneus", slug: "patinagem-pneus" },
        { name: "Regulagem de Pulverizador", slug: "regulagem-pulverizador" },
        { name: "Dimensionamento de Silos", slug: "dimensionamento-silos" },
        { name: "Eficiência de Irrigação", slug: "eficiencia-irrigacao" }
      ]
    },
    {
      titulo: "Gestão",
      desc: "Financeiro e mercado",
      cor: "text-slate-700",
      bgIcon: "bg-slate-200",
      borderHover: "hover:border-slate-400",
      icon: <TrendingUp size={22} />,
      calcs: [
        { name: "ROI por Cultura", slug: "roi" },
        { name: "Ponto de Equilíbrio", slug: "ponto-equilibrio" },
        { name: "Conversão de Medidas", slug: "conversao-medidas" },
        { name: "Frete Agrícola", slug: "frete-agricola" },
        { name: "Desconto de Umidade", slug: "desconto-unidade" },
        { name: "Crédito Rural", slug: "credito-rural" }
      ]
    }
  ];

  return (
    <div className="pb-20">
      
      {/* 1. HERO SECTION COM DEGRADÊ SUAVE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white pt-16 pb-20 px-4">
        {/* Elemento decorativo de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-200/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Plataforma 100% Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-[1.1]">
            Decisões baseadas em <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              dados, não em palpites.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A caixa de ferramentas definitiva para agrônomos e produtores. 
            Mais de 20 calculadoras de precisão para otimizar sua lavoura e pecuária.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/calculadoras" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-1 flex items-center justify-center gap-2">
              <Calculator size={20} />
              Acessar Calculadoras
            </Link>
            <Link href="/planos" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
              Ver Planos e Preços
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE BENEFÍCIOS (CONFIDENCE STRIP) */}
      <div className="border-y border-slate-100 bg-white/50 backdrop-blur-sm mb-16">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                    <Zap size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Cálculos Instantâneos</h4>
                    <p className="text-sm text-slate-500">Resultados em tempo real</p>
                </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Metodologia Validada</h4>
                    <p className="text-sm text-slate-500">Baseado em Embrapa/Esalq</p>
                </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Fácil de Usar</h4>
                    <p className="text-sm text-slate-500">Interface limpa e intuitiva</p>
                </div>
            </div>
        </div>
      </div>

      {/* 3. GRID DE FERRAMENTAS */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Catálogo de Ferramentas</h2>
            <p className="text-slate-500 mt-2">Selecione uma categoria para começar.</p>
          </div>
          <Link href="/calculadoras" className="hidden md:flex items-center gap-1 text-emerald-600 font-bold hover:underline">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categorias.map((cat, i) => (
            <div key={i} className="flex flex-col h-full">
              {/* Cabeçalho da Categoria */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className={`p-2.5 rounded-xl ${cat.bgIcon} ${cat.cor}`}>
                  {cat.icon}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-none">{cat.titulo}</h3>
                    <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                </div>
              </div>
              
              {/* Lista de Calculadoras */}
              <ul className="space-y-3 flex-1">
                {cat.calcs.map((calc, j) => (
                  <li key={j}>
                    <Link 
                      href={`/calculadoras/${calc.slug}`}
                      className={`group flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all ${cat.borderHover}`}
                    >
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {calc.name}
                      </span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CALL TO ACTION - SUGGESTION */}
      <section className="mt-24 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Círculos decorativos */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Não encontrou o que precisa?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg">
              Nosso portal é construído por e para produtores. Sugira uma nova ferramenta técnica e nossa equipe de engenharia irá desenvolver.
            </p>
            <a href="mailto:contato@ruralis.com" className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1">
              Sugerir Nova Calculadora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}