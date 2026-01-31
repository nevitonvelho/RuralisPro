interface ResultadoRealProps {
  total: number;
  insumos: number;
  mecanizacao: number;
}

export function ResultadoReal({
  total,
  insumos,
  mecanizacao,
}: ResultadoRealProps) {
  return (
    <div className="space-y-6">
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
        Resumo do Investimento
      </p>

      <div>
        <span className="text-4xl font-black">
          R$ {total.toFixed(2)}
        </span>
        <p className="text-slate-400 text-sm">Total por hectare</p>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-800 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Insumos</span>
          <span className="font-bold">
            R$ {insumos.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Mecanização</span>
          <span className="font-bold">
            R$ {mecanizacao.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
