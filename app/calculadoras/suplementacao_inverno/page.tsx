"use client";

import { useState, useMemo } from "react";
import { 
  Snowflake, // Representando Inverno/Frio/Seca
  ShoppingBag, 
  Scale, 
  ArrowRight, 
  Lock, 
  Coins,
  Truck,
  TrendingUp,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Interface para tipagem
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  step?: string;
  suffix?: string;
}

// Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.01", suffix }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function SuplementacaoInvernoPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Lote

  // INPUTS - REBANHO
  const [qtdAnimais, setQtdAnimais] = useState<number | string>(""); 
  const [pesoMedio, setPesoMedio] = useState<number | string>(""); // kg

  // INPUTS - PRODUTO
  const [precoSaco, setPrecoSaco] = useState<number | string>(""); // R$
  const [pesoSaco, setPesoSaco] = useState<number | string>(30); // kg (Padrão 30kg)
  
  // ESTRATÉGIA (Consumo)
  const [consumoAlvo, setConsumoAlvo] = useState<number | string>(""); // gramas/dia por cabeça
  const [tipoEstrategia, setTipoEstrategia] = useState<"ureia" | "01" | "03" | "custom">("custom");

  // PRESETS DE ESTRATÉGIA
  const aplicarPreset = (tipo: "ureia" | "01" | "03") => {
      const peso = Number(pesoMedio) || 450;
      setTipoEstrategia(tipo);
      
      if (tipo === "ureia") {
          // Sal Ureia: ~30g a 50g fixo (aprox) - Consideramos manutenção
          setConsumoAlvo(50); 
      } else if (tipo === "01") {
          // Proteinado de Baixo Consumo (0.1% PV)
          setConsumoAlvo((peso * 0.001 * 1000).toFixed(0));
      } else if (tipo === "03") {
          // Proteico Energético (0.3% PV)
          setConsumoAlvo((peso * 0.003 * 1000).toFixed(0));
      }
  };

  // CÁLCULOS
  const resultados = useMemo(() => {
    const qtd = Number(qtdAnimais) || 0;
    const consDia = Number(consumoAlvo) || 0; // gramas
    const prcSaco = Number(precoSaco) || 0;
    const kgSaco = Number(pesoSaco) || 30;

    // CORREÇÃO: O objeto retornado aqui deve ter as MESMAS chaves do retorno final
    if (consDia === 0 || kgSaco === 0) {
        return { 
            custoDia: 0, 
            custoMes: 0, 
            sacosMes: 0, 
            custoTotalSeca: 0,
            consumoLoteMesKg: 0 // Adicionado pois faltava
        };
    }

    // 1. Preço por kg do suplemento
    const precoKg = prcSaco / kgSaco;

    // 2. Custo por Cabeça/Dia
    // consumo (g) / 1000 = kg * precoKg
    const custoDia = (consDia / 1000) * precoKg;

    // 3. Consumo Total do Lote (kg/dia)
    const consumoLoteDiaKg = (consDia * qtd) / 1000;

    // 4. Logística Mensal (30 dias)
    const consumoLoteMesKg = consumoLoteDiaKg * 30;
    const sacosMes = consumoLoteMesKg / kgSaco;
    const custoMes = custoDia * qtd * 30;

    // 5. Custo Safra (90 dias de seca)
    const custoTotalSeca = custoMes * 3;

    return {
        custoDia,
        custoMes,
        sacosMes,
        custoTotalSeca,
        consumoLoteMesKg
    };
  }, [qtdAnimais, consumoAlvo, precoSaco, pesoSaco]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  const shareText = `❄️ *Suplementação de Inverno*\n\n💊 *Estratégia:* ${tipoEstrategia === '01' ? 'Proteinado 0.1%' : tipoEstrategia === '03' ? 'Prot. Energético 0.3%' : 'Sal/Ureia'}\n💰 *Custo:* ${fmtMoeda(resultados.custoDia)} /cab/dia\n📦 *Logística:* ${Math.ceil(resultados.sacosMes)} sacos/mês\n\n📊 *Orçamento Mensal:* ${fmtMoeda(resultados.custoMes)}`;

  return (
    <CalculatorLayout
      title="Suplementação de Inverno"
      subtitle="Planejamento de custo nutricional e logística para o período da seca."
      category="Nutrição"
      icon={<Snowflake size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Definição do Lote */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Scale size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dados do Lote</h3>
                    <p className="text-xs text-slate-400">Quantidade e peso para cálculo de dose</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <InputGroup label="Qtd Animais" icon={<span className="font-bold text-xs">Nº</span>} value={qtdAnimais} onChange={setQtdAnimais} placeholder="Ex: 50" />
                 <InputGroup label="Peso Médio (kg)" icon={<Scale size={16}/>} value={pesoMedio} onChange={setPesoMedio} placeholder="Ex: 400" suffix="kg" />
              </div>
           </section>

           {/* Seção 2: Estratégia e Produto */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Snowflake size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Estratégia Nutricional</h3>
                    <p className="text-xs text-slate-400">Escolha o nível de suplementação</p>
                 </div>
              </div>

              {/* Botões de Estratégia */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                  <button 
                    onClick={() => aplicarPreset("ureia")}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${tipoEstrategia === 'ureia' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                  >
                      <span>Sal c/ Ureia</span>
                      <span className="text-[9px] font-normal opacity-70">Manutenção</span>
                  </button>
                  <button 
                    onClick={() => aplicarPreset("01")}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${tipoEstrategia === '01' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                  >
                      <span>Proteinado 0.1%</span>
                      <span className="text-[9px] font-normal opacity-70">Baixo Ganho</span>
                  </button>
                  <button 
                    onClick={() => aplicarPreset("03")}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${tipoEstrategia === '03' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                  >
                      <span>Energético 0.3%</span>
                      <span className="text-[9px] font-normal opacity-70">Ganho Moderado</span>
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-4">
                 <InputGroup label="Consumo (g/dia)" icon={<TrendingUp size={16}/>} value={consumoAlvo} onChange={(v: string) => {setConsumoAlvo(v); setTipoEstrategia('custom');}} placeholder="Ex: 400" suffix="g" />
                 <InputGroup label="Preço Saco (R$)" icon={<Coins size={16}/>} value={precoSaco} onChange={setPrecoSaco} placeholder="Ex: 90.00" suffix="R$" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <InputGroup label="Peso do Saco (kg)" icon={<ShoppingBag size={16}/>} value={pesoSaco} onChange={setPesoSaco} placeholder="30" suffix="kg" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-blue-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Custo Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Orçamento <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: CUSTO DIA */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <p className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-1">
                                Custo Nutricional
                            </p>
                            <p className="text-slate-400 text-[10px] mb-6">
                                Investimento diário por animal no cocho
                            </p>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-5xl font-black tracking-tighter text-white">
                                    {fmtMoeda(resultados.custoDia)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-lg font-medium text-slate-300 block">/dia</span>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-blue-400"/>
                                    <span className="text-sm font-medium text-slate-300">Consumo Lote</span>
                                </div>
                                <span className="text-xs font-bold text-white">{fmtNum(resultados.consumoLoteMesKg)} kg / mês</span>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: LOGÍSTICA DE COMPRA */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Truck size={18} className="text-emerald-600"/> Logística Mensal
                            </h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase">Compras</span>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            <div className="bg-slate-50 p-4 rounded-lg text-center min-w-[100px]">
                                <span className="block text-3xl font-black text-slate-900">{Math.ceil(resultados.sacosMes)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Sacos</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Custo Mensal do Lote:</p>
                                <p className="text-xl font-black text-emerald-600">{fmtMoeda(resultados.custoMes)}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Para {qtdAnimais || 0} animais</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Terciário: PREVISÃO SECA (90 DIAS) */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                            <Info size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800 uppercase mb-1">Planejamento de Seca (90 dias)</p>
                            <p className="text-[10px] text-amber-700 leading-relaxed">
                                Você precisará de aprox. <strong>{Math.ceil(resultados.sacosMes * 3)} sacos</strong> para atravessar o período crítico. 
                                Orçamento total estimado: <strong>{fmtMoeda(resultados.custoTotalSeca)}</strong>.
                            </p>
                        </div>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}