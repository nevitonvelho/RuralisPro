export function ResultadoPreview() {
  return (
    <div className="space-y-6 opacity-30">
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
        Resumo do Investimento
      </p>

      <div>
        <span className="text-4xl font-black">R$ 0,00</span>
        <p className="text-slate-400 text-sm">Total por hectare</p>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-800 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Insumos</span>
          <span className="font-bold">R$ 0,00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Mecanização</span>
          <span className="font-bold">R$ 0,00</span>
        </div>
      </div>
    </div>
  );
}
