"use client";

import { useState, useMemo } from "react";
import { 
  Database, // Representando Silo
  ArrowRight, 
  Lock, 
  Coins,
  Scale,
  Ruler,
  Wheat,
  LayoutDashboard,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS (TELA) ---

interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  step?: string;
  suffix?: string;
}

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1", suffix }: InputGroupProps) => (
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
        onWheel={(e) => e.currentTarget.blur()}
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

// --- COMPONENTE VISUAL (IMPRESSÃO - TABELA TÉCNICA) ---
interface TechnicalTableRow {
  label: string;
  value: string | number;
  unit?: string;
  isHeader?: boolean;
}

const TechnicalTable = ({ title, rows }: { title: string; rows: TechnicalTableRow[] }) => {
  return (
    <div className="mt-4 mb-6 border border-black rounded-lg overflow-hidden avoid-break shadow-none break-inside-avoid">
      <div className="bg-slate-200 border-b border-black p-2 flex justify-between items-center print:bg-slate-200">
        <h3 className="font-bold text-xs uppercase text-black tracking-wider flex items-center gap-2">
           <ClipboardList size={14}/> {title}
        </h3>
      </div>
      <table className="w-full text-sm text-left">
        <tbody>
          {rows.map((row, index) => (
            <tr 
              key={index} 
              className={`
                border-b border-slate-300 last:border-0 
                ${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'} 
                ${row.isHeader ? 'bg-slate-800 text-white print:bg-slate-900 print:text-white font-bold' : ''}
              `}
            >
              <td className={`p-2 w-2/3 ${row.isHeader ? 'text-white' : 'text-slate-700 font-medium'}`}>
                {row.label}
              </td>
              <td className={`p-2 w-1/3 text-right font-bold ${row.isHeader ? 'text-white' : 'text-black'}`}>
                {row.value} {row.unit && <span className="text-[10px] font-normal text-slate-500 ml-1 uppercase">{row.unit}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function DimensionamentoSiloPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Identificação do Silo

  // INPUTS - DIMENSÕES
  const [diametro, setDiametro] = useState<number | string>(""); // m
  const [altura, setAltura] = useState<number | string>(""); // m 

  // INPUTS - GRÃO
  const [densidade, setDensidade] = useState<number | string>(750); // kg/m3 
  
  // INPUTS - COMERCIAL
  const [precoSaca, setPrecoSaca] = useState<number | string>(""); // R$/sc
  const [produtividade, setProdutividade] = useState<number | string>(""); // sc/ha 

  // CÁLCULOS
  const resultados = useMemo(() => {
    const d = Number(diametro) || 0;
    const h = Number(altura) || 0;
    const dens = Number(densidade) || 0;
    const preco = Number(precoSaca) || 0;
    const prod = Number(produtividade) || 0;

    if (d === 0 || h === 0) return { volM3: 0, pesoTon: 0, sacas: 0, valorTotal: 0, haCobertos: 0 };

    // 1. Volume (Cilindro Base) - V = pi * r^2 * h
    const raio = d / 2;
    const volM3 = Math.PI * Math.pow(raio, 2) * h;

    // 2. Peso Total
    const pesoTotalKg = volM3 * dens;
    const pesoTon = pesoTotalKg / 1000;

    // 3. Capacidade em Sacas
    const sacas = pesoTotalKg / 60;

    // 4. Valor Financeiro
    const valorTotal = sacas * preco;

    // 5. Cobertura de Área
    const haCobertos = prod > 0 ? sacas / prod : 0;

    return {
        volM3,
        pesoTon,
        sacas,
        valorTotal,
        haCobertos
    };
  }, [diametro, altura, densidade, precoSaca, produtividade]);

  // PRESETS DE DENSIDADE
  const setPreset = (val: number) => setDensidade(val);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v); 
  const fmtDec = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🏭 *Capacidade de Silo*\n\n📏 *Dimensões:* ${diametro}m x ${altura}m\n⚖️ *Capacidade:* ${fmtNum(resultados.sacas)} sc (${fmtDec(resultados.pesoTon)} ton)\n💰 *Valor Estocado:* ${fmtMoeda(resultados.valorTotal)}\n\n(Base: ${densidade} kg/m³)`.trim();

  return (
    <CalculatorLayout
      title="Dimensionamento de Silos"
      subtitle="Cálculo de volume estático, tonelagem e capacidade financeira de armazenagem."
      category="Pós-Colheita"
      icon={<Database size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- COLUNA ESQUERDA (INPUTS) --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">
           
           {/* ========================================================
               SEÇÃO 1: GEOMETRIA
           ======================================================== */}
           

           {/* A. VISUAL DE TELA */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Ruler size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dimensões do Silo</h3>
                    <p className="text-xs text-slate-400">Medidas internas da estrutura</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Diâmetro (m)" icon={<Database size={16}/>} value={diametro} onChange={setDiametro} placeholder="Ex: 18" suffix="m" />
                 <InputGroup label="Altura da Chaparia (m)" icon={<Ruler size={16} className="rotate-90"/>} value={altura} onChange={setAltura} placeholder="Ex: 15" suffix="m" />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-right">
                  *Cálculo baseado no volume cilíndrico (chaparia).
              </p>
           </section>

           {/* B. VISUAL IMPRESSÃO */}
           <div className="hidden print:block">
              <TechnicalTable 
                 title="1. Geometria do Silo"
                 rows={[
                    { label: "Diâmetro", value: Number(diametro), unit: "m" },
                    { label: "Altura da Chaparia", value: Number(altura), unit: "m" },
                    { label: "Volume Calculado (Cilindro)", value: fmtDec(resultados.volM3), unit: "m³" },
                 ]}
              />
           </div>

           {/* ========================================================
               SEÇÃO 2: DENSIDADE
           ======================================================== */}

           {/* A. VISUAL DE TELA */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Wheat size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Densidade do Grão</h3>
                    <p className="text-xs text-slate-400">Peso específico (kg/m³)</p>
                 </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                  <button onClick={() => setPreset(750)} className={`p-2 rounded border text-xs font-bold transition-all ${densidade == 750 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      Soja (750)
                  </button>
                  <button onClick={() => setPreset(720)} className={`p-2 rounded border text-xs font-bold transition-all ${densidade == 720 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      Milho (720)
                  </button>
                  <button onClick={() => setPreset(780)} className={`p-2 rounded border text-xs font-bold transition-all ${densidade == 780 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      Trigo (780)
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                 <InputGroup label="Densidade (kg/m³)" icon={<Scale size={16}/>} value={densidade} onChange={setDensidade} placeholder="Ex: 750" suffix="kg/m³" />
              </div>
           </section>

           {/* B. VISUAL IMPRESSÃO */}
           <div className="hidden print:block">
              <TechnicalTable 
                 title="2. Parâmetros Físicos"
                 rows={[
                    { label: "Densidade Utilizada", value: Number(densidade), unit: "kg/m³" },
                 ]}
              />
           </div>

           {/* ========================================================
               SEÇÃO 3: COMERCIAL
           ======================================================== */}
           
           {/* A. VISUAL DE TELA */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">3. Dados Comerciais (Opcional)</h3>
                    <p className="text-xs text-slate-400">Para valuation do estoque</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Preço da Saca (R$)" icon={<Coins size={16}/>} value={precoSaca} onChange={setPrecoSaca} placeholder="Ex: 120.00" suffix="R$" />
                 <InputGroup label="Produtividade Média" icon={<LayoutDashboard size={16}/>} value={produtividade} onChange={setProdutividade} placeholder="Ex: 70" suffix="sc/ha" />
              </div>
           </section>

           {/* B. VISUAL IMPRESSÃO */}
           <div className="hidden print:block">
              <TechnicalTable 
                 title="3. Parâmetros Comerciais"
                 rows={[
                    { label: "Preço de Referência", value: fmtMoeda(Number(precoSaca)), unit: "/ sc" },
                    { label: "Produtividade Média", value: Number(produtividade), unit: "sc/ha" },
                 ]}
              />
           </div>

        </div>

        {/* --- COLUNA DIREITA (RESULTADOS) --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                      <div className="bg-slate-900 text-blue-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Resultado Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Capacidade <ArrowRight size={16}/>
                      </button>
                    </div>
                 )}

                 {/* --- ÁREA DE RESULTADOS VISUAIS (TELA - print:hidden) --- */}
                 <div className={`print:hidden space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: CAPACIDADE EM SACAS */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Detail */}
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-slate-700/30 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Capacidade Estática
                            </p>
                            
                            <div className="relative inline-block mb-2">
                                <span className="text-5xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.sacas)}
                                </span>
                                <span className="block text-xl font-medium text-slate-400 mt-1">Sacas (60kg)</span>
                            </div>

                            <div className="mt-6 flex justify-center gap-8 border-t border-slate-800 pt-6">
                                <div>
                                    <span className="block text-xl font-bold text-white">{fmtDec(resultados.pesoTon)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Toneladas</span>
                                </div>
                                <div>
                                    <span className="block text-xl font-bold text-white">{fmtDec(resultados.volM3)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Metros Cúbicos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: FINANCEIRO DO ESTOQUE */}
                    <div className="print-card bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-lg relative">
                        <div className="flex items-center justify-between mb-4 border-b border-emerald-100 pb-4">
                             <div className="flex items-center gap-2">
                                <Coins className="text-emerald-600" size={20}/>
                                <h4 className="font-bold text-emerald-900 text-sm">Valor em Estoque</h4>
                             </div>
                        </div>
                        
                        <div className="text-center py-2">
                            {resultados.valorTotal > 0 ? (
                                <span className="block text-3xl font-black text-emerald-700">{fmtMoeda(resultados.valorTotal)}</span>
                            ) : (
                                <span className="text-sm text-emerald-400 italic">Defina o preço da saca</span>
                            )}
                            <span className="text-[10px] text-emerald-600 uppercase mt-1 block">Capital Imobilizado no Silo</span>
                        </div>
                    </div>

                    {/* Card Terciário: COBERTURA DE ÁREA */}
                    {resultados.haCobertos > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden shadow-sm">
                            <div className="flex gap-3 items-center">
                                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                    <LayoutDashboard size={20}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase">Capacidade de Recebimento</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        Este silo comporta a colheita de aprox:
                                    </p>
                                    <p className="text-2xl font-black text-blue-600 mt-1">
                                        {fmtDec(resultados.haCobertos)} <span className="text-sm font-normal text-slate-400">hectares</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>

                 {/* --- TABELA DE RESULTADOS (IMPRESSÃO - hidden print:block) --- */}
                 <div className="hidden print:block">
                    <TechnicalTable 
                      title="4. Capacidade Calculada"
                      rows={[
                        { label: "Peso Total Suportado", value: fmtDec(resultados.pesoTon), unit: "ton" },
                        { label: "Capacidade em Sacas (60kg)", value: fmtNum(resultados.sacas), unit: "sc", isHeader: true },
                        { label: "Valor Monetário Estimado", value: fmtMoeda(resultados.valorTotal), isHeader: true },
                        { label: "Área de Colheita Equivalente", value: fmtDec(resultados.haCobertos), unit: "ha" },
                      ]}
                    />
                 </div>

            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}