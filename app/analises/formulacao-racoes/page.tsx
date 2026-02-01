"use client";

import { useState, useMemo } from "react";
import { 
  Wheat, 
  Leaf, 
  Database, 
  Coins,
  Beaker,
  Factory,
  Info,
  Lock,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

// 1. Tabela para Impressão (Aparece apenas no Ctrl+P)
const TechnicalTable = ({ title, rows }: { title: string; rows: any[] }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-4 mb-6 border border-black rounded-lg overflow-hidden avoid-break shadow-none break-inside-avoid">
      <div className="bg-slate-200 border-b border-black p-2 flex justify-between items-center print:bg-slate-200">
        <h3 className="font-bold text-xs uppercase text-black tracking-wider flex items-center gap-2">
           <ClipboardList size={14}/> {title}
        </h3>
      </div>
      <table className="w-full text-sm text-left">
        <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-xs uppercase text-slate-500">
                {Object.keys(rows[0] || {}).map((header, i) => (
                    <th key={i} className="p-2 font-bold">{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-300 last:border-0 bg-white">
              {Object.values(row).map((val: any, i) => (
                  <td key={i} className="p-2 text-black font-medium">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 2. Linha de Ingrediente (Input)
const IngredientRow = ({ label, icon, color, data, onChange }: any) => {
  const updateField = (field: string, val: string) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-2">
        <div className={`p-1.5 rounded-md ${color.bg} ${color.text}`}>
          {icon}
        </div>
        <span className="font-bold text-sm text-slate-700">{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
         {/* Quantidade na Batida */}
         <div className="col-span-2 md:col-span-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Qtd na Batida</label>
            <div className="relative">
                <input 
                  type="number" 
                  value={data.kg} 
                  onChange={(e) => updateField('kg', e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
            </div>
         </div>
         {/* Preço Unitário */}
         <div className="col-span-2 md:col-span-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Preço Unitário</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input 
                  type="number" 
                  value={data.preco} 
                  onChange={(e) => updateField('preco', e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2 pl-8 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0.00"
                />
            </div>
         </div>
         
         {/* Nutrientes (Mini inputs) */}
         <div className="col-span-2 flex gap-4 pt-1">
             <div className="flex-1 bg-slate-50 rounded px-2 py-1 flex items-center gap-2 border border-dashed border-slate-200">
                <label className="text-[9px] text-slate-500 uppercase font-bold">PB(%)</label>
                <input 
                   type="number" 
                   value={data.pb} 
                   onChange={(e) => updateField('pb', e.target.value)}
                   onWheel={(e) => e.currentTarget.blur()}
                   className="w-full text-xs font-mono bg-transparent text-slate-700 outline-none text-right"
                />
             </div>
             <div className="flex-1 bg-slate-50 rounded px-2 py-1 flex items-center gap-2 border border-dashed border-slate-200">
                <label className="text-[9px] text-slate-500 uppercase font-bold">NDT(%)</label>
                <input 
                   type="number" 
                   value={data.ndt} 
                   onChange={(e) => updateField('ndt', e.target.value)}
                   onWheel={(e) => e.currentTarget.blur()}
                   className="w-full text-xs font-mono bg-transparent text-slate-700 outline-none text-right"
                />
             </div>
         </div>
      </div>
    </div>
  );
};

export default function FormulacaoRacaoPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // INGREDIENTES (Estado Inicial com Médias Nacionais)
  const [ing1, setIng1] = useState({ kg: "70", preco: "1.00", pb: "9", ndt: "82" }); // Energético (Milho)
  const [ing2, setIng2] = useState({ kg: "25", preco: "2.50", pb: "46", ndt: "80" }); // Proteico (Soja)
  const [ing3, setIng3] = useState({ kg: "5", preco: "5.00", pb: "0", ndt: "0" }); // Núcleo/Mineral

  // CÁLCULOS
  const resultados = useMemo(() => {
    // Helper to parse
    const parse = (obj: any) => ({
        kg: Number(obj.kg) || 0,
        preco: Number(obj.preco) || 0,
        pb: Number(obj.pb) || 0,
        ndt: Number(obj.ndt) || 0,
    });

    const i1 = parse(ing1);
    const i2 = parse(ing2);
    const i3 = parse(ing3);

    const pesoTotal = i1.kg + i2.kg + i3.kg;

    // Evita divisão por zero e retorna objeto vazio seguro
    if (pesoTotal === 0) {
        return { 
            pbFinal: 0, 
            ndtFinal: 0, 
            custoKg: 0, 
            custoTon: 0, 
            pesoTotal: 0, 
            distribuicao: [],
            rowsIngredientes: [] 
        };
    }

    // 1. Médias Ponderadas Nutricionais
    const pbTotal = (i1.kg * i1.pb) + (i2.kg * i2.pb) + (i3.kg * i3.pb);
    const ndtTotal = (i1.kg * i1.ndt) + (i2.kg * i2.ndt) + (i3.kg * i3.ndt);

    const pbFinal = pbTotal / pesoTotal;
    const ndtFinal = ndtTotal / pesoTotal;

    // 2. Custos
    const custoTotalBatch = (i1.kg * i1.preco) + (i2.kg * i2.preco) + (i3.kg * i3.preco);
    const custoKg = custoTotalBatch / pesoTotal;
    const custoTon = custoKg * 1000;

    // 3. Distribuição Percentual (Para gráfico/info)
    const dist = [
        { label: "Energético", pct: (i1.kg / pesoTotal) * 100 },
        { label: "Proteico", pct: (i2.kg / pesoTotal) * 100 },
        { label: "Núcleo", pct: (i3.kg / pesoTotal) * 100 },
    ];

    return {
        pbFinal,
        ndtFinal,
        custoKg,
        custoTon,
        pesoTotal,
        distribuicao: dist,
        // DADOS PARA TABELA DE IMPRESSÃO (RESOLVE O ERRO)
        rowsIngredientes: [
            { Ingrediente: "Energético", Kg: i1.kg, "PB%": i1.pb, "NDT%": i1.ndt, "R$/kg": i1.preco.toFixed(2) },
            { Ingrediente: "Proteico", Kg: i2.kg, "PB%": i2.pb, "NDT%": i2.ndt, "R$/kg": i2.preco.toFixed(2) },
            { Ingrediente: "Núcleo/Outros", Kg: i3.kg, "PB%": i3.pb, "NDT%": i3.ndt, "R$/kg": i3.preco.toFixed(2) },
            { Ingrediente: "TOTAL BATIDA", Kg: pesoTotal, "PB%": pbFinal.toFixed(1), "NDT%": ndtFinal.toFixed(1), "R$/kg": custoKg.toFixed(2) }
        ]
    };
  }, [ing1, ing2, ing3]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  const shareText = `🧪 *Formulação de Ração*\n\n📊 *Níveis de Garantia:*\nPB: ${fmtNum(resultados.pbFinal)}% | NDT: ${fmtNum(resultados.ndtFinal)}%\n\n💰 *Custo:* ${fmtMoeda(resultados.custoTon)} / tonelada\n⚖️ *Base:* Batida de ${resultados.pesoTotal}kg`;

  return (
    <CalculatorLayout
      title="Formulação de Rações"
      subtitle="Balanceamento simplificado e custo de mistura (TMR/Concentrado)."
      category="Nutrição"
      icon={<Beaker size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- COLUNA ESQUERDA (INPUTS) --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* A. VISUAL TELA */}
           <div className="print:hidden">
               <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Factory size={20} /></div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">1. Misturador</h3>
                            <p className="text-xs text-slate-400">Defina os ingredientes (Kg na batida)</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 uppercase block">Peso Batida</span>
                        <span className="text-xl font-black text-slate-800">{resultados.pesoTotal} kg</span>
                    </div>
               </div>

               <div className="space-y-4">
                   <IngredientRow 
                     label="Fonte Energética (Ex: Milho)" 
                     icon={<Wheat size={18}/>} 
                     color={{bg: "bg-yellow-100", text: "text-yellow-700"}}
                     data={ing1} 
                     onChange={setIng1} 
                   />
                   <IngredientRow 
                     label="Fonte Proteica (Ex: Soja)" 
                     icon={<Leaf size={18}/>} 
                     color={{bg: "bg-emerald-100", text: "text-emerald-700"}}
                     data={ing2} 
                     onChange={setIng2} 
                   />
                   <IngredientRow 
                     label="Núcleo / Aditivo / Outro" 
                     icon={<Database size={18}/>} 
                     color={{bg: "bg-purple-100", text: "text-purple-700"}}
                     data={ing3} 
                     onChange={setIng3} 
                   />
               </div>

               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 text-xs text-blue-800 mt-4">
                   <Info className="shrink-0 mt-0.5" size={16} />
                   <p>
                       Você pode ajustar os valores de <strong>PB (Proteína Bruta)</strong> e <strong>NDT (Energia)</strong> nos campos pequenos abaixo de cada ingrediente para maior precisão conforme sua análise bromatológica.
                   </p>
               </div>
           </div>

           {/* B. VISUAL IMPRESSÃO (Tabela de Ingredientes) */}
           <div className="hidden print:block">
               <TechnicalTable 
                 title="1. Composição da Batida"
                 rows={resultados.rowsIngredientes}
               />
           </div>
        </div>

        {/* --- COLUNA DIREITA (RESULTADOS) --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                      <div className="bg-slate-900 text-purple-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Fórmula Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Resultado Final <ArrowRight size={16}/>
                      </button>
                    </div>
                 )}

                 {/* VISUAL TELA (Cards Coloridos) */}
                 <div className={`print:hidden space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: ETIQUETA NUTRICIONAL */}
                    <div className="bg-white border-2 border-slate-900 rounded-xl p-0 shadow-xl overflow-hidden relative">
                        <div className="bg-slate-900 p-4 text-center border-b-2 border-dashed border-slate-600">
                            <h4 className="text-white font-black uppercase tracking-widest text-sm">Níveis de Garantia</h4>
                            <p className="text-slate-400 text-[10px]">Cálculo estimado base matéria natural</p>
                        </div>
                        
                        <div className="p-6 grid grid-cols-2 gap-8 relative z-10">
                            {/* PB */}
                            <div className="text-center">
                                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Proteína (PB)</span>
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500 transition-all duration-1000" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * resultados.pbFinal) / 100} />
                                    </svg>
                                    <span className="absolute text-2xl font-black text-slate-800">{fmtNum(resultados.pbFinal)}%</span>
                                </div>
                            </div>

                            {/* NDT */}
                            <div className="text-center">
                                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Energia (NDT)</span>
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-yellow-500 transition-all duration-1000" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * (resultados.ndtFinal > 100 ? 100 : resultados.ndtFinal)) / 100} />
                                    </svg>
                                    <span className="absolute text-2xl font-black text-slate-800">{fmtNum(resultados.ndtFinal)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Composição Resumida */}
                        <div className="px-6 pb-6 pt-0">
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2 text-center">Composição da Mistura</div>
                            <div className="flex h-2 rounded-full overflow-hidden w-full">
                                {resultados.distribuicao.map((d: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        style={{ width: `${d.pct}%` }} 
                                        className={`${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                        title={`${d.label}: ${d.pct.toFixed(0)}%`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: CUSTO FINANCEIRO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-4">
                             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                <Coins size={20}/>
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Custo de Produção</h4>
                                <p className="text-[10px] text-slate-400">Quanto custa rodar esta fórmula</p>
                             </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 uppercase font-bold">Preço / kg</span>
                                <span className="text-lg font-bold text-slate-700">{fmtMoeda(resultados.custoKg)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs text-slate-800 uppercase font-bold flex items-center gap-2">
                                    <Factory size={16} className="text-slate-400"/>
                                    Custo / Tonelada
                                </span>
                                <span className="text-2xl font-black text-emerald-600">{fmtMoeda(resultados.custoTon)}</span>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* VISUAL IMPRESSÃO (Tabela de Resultados) */}
                 <div className="hidden print:block">
                    <TechnicalTable 
                      title="2. Análise Final & Custos"
                      rows={[
                        { "Parâmetro": "Proteína Bruta (PB)", "Valor": `${fmtNum(resultados.pbFinal)} %` },
                        { "Parâmetro": "Energia (NDT)", "Valor": `${fmtNum(resultados.ndtFinal)} %` },
                        { "Parâmetro": "Custo Final por Tonelada", "Valor": fmtMoeda(resultados.custoTon) },
                        { "Parâmetro": "Custo por Kg", "Valor": fmtMoeda(resultados.custoKg) },
                      ]}
                    />
                 </div>

            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}