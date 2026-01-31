"use client";

import { useState } from "react";
import { BadgeDollarSign, Tractor, Sprout, Droplets, Lock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { InputGroup } from "@/app/components/InputGroup";
import { ResultadoReal } from "@/app/components/ResultadoReal";
import { ResultadoPreview } from "@/app/components/ResultadoPreview";

export default function CustoHectare() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  const [sementes, setSementes] = useState(0);
  const [fertilizantes, setFertilizantes] = useState(0);
  const [defensivos, setDefensivos] = useState(0);
  const [mecanizacao, setMecanizacao] = useState(0);

  const insumos = sementes + fertilizantes + defensivos;
  const total = insumos + mecanizacao;

  if (loading) {
    return <p className="text-center">Carregando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <header className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-black">Custo de Implantação</h1>
        <p className="text-slate-500">
          Calcule o investimento por hectare da sua cultura.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* INPUTS */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border space-y-4">
            <InputGroup label="Sementes (R$/ha)" icon={<Sprout size={16} />} placeholder="850" value={sementes} onChange={setSementes} />
            <InputGroup label="Fertilizantes (R$/ha)" icon={<Droplets size={16} />} placeholder="1200" value={fertilizantes} onChange={setFertilizantes} />
            <InputGroup label="Defensivos (R$/ha)" icon={<BadgeDollarSign size={16} />} placeholder="600" value={defensivos} onChange={setDefensivos} />
            <InputGroup label="Mecanização (R$/ha)" icon={<Tractor size={16} />} placeholder="450" value={mecanizacao} onChange={setMecanizacao} />
          </div>
        </div>

        {/* RESULTADO */}
        <div className="relative bg-slate-900 rounded-3xl p-8 text-white min-h-[300px]">

          {!isAuthenticated && (
            <div className="absolute inset-0 z-10 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-3xl">
              <Lock className="mb-4" />
              <p className="font-bold mb-2">Resultado bloqueado</p>
              <p className="text-sm text-slate-300 mb-4">
                Faça login para ver o cálculo completo.
              </p>

              <button
                onClick={() =>
                  (document.getElementById("modal_auth") as HTMLDialogElement)?.showModal()
                }
                className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition"
              >
                Entrar agora
              </button>
            </div>
          )}

          {isAuthenticated ? (
            <ResultadoReal total={total} insumos={insumos} mecanizacao={mecanizacao} />
          ) : (
            <ResultadoPreview />
          )}
        </div>
      </div>
    </div>
  );
}
