import { 
  Sprout, 
  Beef, 
  Tractor, 
  Droplets, 
  Microscope, 
  TrendingUp, 
  Scale, 
  Zap, 
  Boxes,
  ThermometerSun,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const categorias = [
    {
      titulo: "Agronomia",
      cor: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: <Sprout size={24} />,
      calcs: [
        "Calagem e Gessagem",
        "Adubação N-P-K",
        "População de Plantas",
        "Estimativa de Produtividade",
        "Perda na Colheita",
        "Depleção de Água no Solo"
      ]
    },
    {
      titulo: "Pecuária & Zootecnia",
      cor: "text-amber-700",
      bg: "bg-amber-50",
      icon: <Beef size={24} />,
      calcs: [
        "Conversão Alimentar (GMD)",
        "Custo da Arroba Produzida",
        "Taxa de Lotação (UA/ha)",
        "Suplementação de Inverno",
        "Formulação de Rações",
        "Rendimento de Carcaça"
      ]
    },
    {
      titulo: "Máquinas & Engenharia",
      cor: "text-blue-600",
      bg: "bg-blue-50",
      icon: <Tractor size={24} />,
      calcs: [
        "Consumo de Combustível",
        "Capacidade Operacional",
        "Patinagem de Pneus",
        "Regulagem de Pulverizador",
        "Dimensionamento de Silos",
        "Eficiência de Irrigação"
      ]
    },
    {
      titulo: "Gestão & Mercado",
      cor: "text-slate-700",
      bg: "bg-slate-100",
      icon: <TrendingUp size={24} />,
      calcs: [
        "ROI por Cultura",
        "Ponto de Equilíbrio",
        "Conversão de Medidas",
        "Frete Agrícola",
        "Desconto de Umidade/Impureza",
        "Viabilidade de Crédito Rural"
      ]
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="text-center pt-10 px-4">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          A caixa de ferramentas do <br/>
          <span className="text-emerald-600">produtor moderno.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Acesse gratuitamente mais de 20 calculadoras técnicas para otimizar 
          sua produção, do plantio à comercialização.
        </p>
      </section>

      {/* GRID DE CATEGORIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {categorias.map((cat, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${cat.bg} ${cat.cor}`}>
                {cat.icon}
              </div>
              <h3 className="font-bold text-xl text-slate-800">{cat.titulo}</h3>
            </div>
            
            <ul className="space-y-3">
              {cat.calcs.map((calc, j) => (
                <li key={j}>
                  <a href="#" className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700">
                      {calc}
                    </span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CALL TO ACTION PARA CONTATO/SUGESTÃO */}
      <section className="bg-emerald-900 rounded-[32px] p-10 mx-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Sentiu falta de alguma calculadora?</h2>
        <p className="text-emerald-100 mb-6 max-w-md mx-auto">
          Nosso portal é colaborativo. Sugira uma nova ferramenta técnica e ajude a fortalecer o agro.
        </p>
        <button className="bg-emerald-400 text-emerald-950 px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
          Sugerir Calculadora
        </button>
      </section>
    </div>
  );
}