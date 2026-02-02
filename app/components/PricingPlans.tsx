"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";

export default function PricingPlans() {
    const plans = [
        {
            name: "Free",
            price: "0",
            desc: "Para pequenos produtores iniciantes.",
            color: "border-slate-200",
            btnColor: "bg-slate-100 text-slate-600 hover:bg-slate-200",
            features: [
                { name: "Acesso a 5 análises básicas", included: true },
                { name: "Histórico de 30 dias", included: true },
                { name: "Relatórios básicos (tela)", included: true },
                { name: "Suporte por e-mail", included: false },
                { name: "Personalização de relatórios", included: false },
                { name: "Acesso API", included: false },
            ]
        },
        {
            name: "RuraPro",
            price: "49,90",
            popular: true,
            desc: "Para agrônomos e produtores profissionais.",
            color: "border-emerald-500 ring-4 ring-emerald-500/10",
            btnColor: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30",
            features: [
                { name: "Acesso total a 25+ ferramentas", included: true },
                { name: "Histórico ilimitado", included: true },
                { name: "Relatórios PDF profissionais", included: true },
                { name: "Suporte prioritário WhatsApp", included: true },
                { name: "Personalização de relatórios", included: true },
                { name: "Acesso API", included: false },
            ]
        },
        {
            name: "RuraCorp",
            price: "Sob Consulta",
            desc: "Para cooperativas e grandes empresas.",
            color: "border-purple-200",
            btnColor: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30",
            features: [
                { name: "Acesso total a 25+ ferramentas", included: true },
                { name: "Histórico ilimitado", included: true },
                { name: "Relatórios PDF White-label", included: true },
                { name: "Gerente de conta dedicado", included: true },
                { name: "Múltiplos usuários", included: true },
                { name: "Integração via API", included: true },
            ]
        }
    ];

    return (
        <section id="planos" className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Escolha o plano ideal para sua safra
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Comece gratuitamente e evolua conforme sua necessidade. Sem contratos de fidelidade.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <div key={i} className={`relative bg-white rounded-2xl p-8 border hover:border-emerald-300 transition-all duration-300 hover:shadow-xl ${plan.color} ${plan.popular ? 'md:-translate-y-4' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                                    Mais Popular
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 h-10">{plan.desc}</p>

                            <div className="flex items-end gap-1 mb-8">
                                <span className="text-4xl font-black text-slate-900">
                                    {plan.price === "Sob Consulta" ? "" : "R$"}
                                    {plan.price}
                                </span>
                                <span className="text-slate-400 font-medium mb-1">
                                    {plan.price === "Sob Consulta" ? "" : "/mês"}
                                </span>
                            </div>

                            <a
                                href={plan.name === 'RuraPro' ? 'https://pay.kiwify.com.br/YfRpxeU' : '#'}
                                target={plan.name === 'RuraPro' ? '_blank' : '_self'}
                                className={`block w-full py-3.5 rounded-xl font-bold text-center transition-all mb-8 ${plan.btnColor}`}
                            >
                                {plan.price === "Sob Consulta" ? "Falar com Vendas" : "Começar Agora"}
                            </a>

                            <div className="space-y-4">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-start gap-3">
                                        {feat.included ? (
                                            <div className="bg-emerald-100 text-emerald-600 p-0.5 rounded-full mt-0.5">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="bg-slate-100 text-slate-300 p-0.5 rounded-full mt-0.5">
                                                <X size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feat.included ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                            {feat.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
