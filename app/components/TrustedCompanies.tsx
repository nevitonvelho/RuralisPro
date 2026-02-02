"use client";

import { Feather, Hexagon, Layers, ShieldCheck, Sun, Tractor, Wheat, Trees, Sprout, Leaf } from "lucide-react";

export default function TrustedCompanies() {
    const companies = [
        { name: "AgroTech", icon: <Tractor size={32} /> },
        { name: "RuralBank", icon: <ShieldCheck size={32} /> },
        { name: "SoloFértil", icon: <Layers size={32} /> },
        { name: "BioMilho", icon: <Wheat size={32} /> },
        { name: "VerdeVida", icon: <Leaf size={32} /> },
        { name: "FazendaSolar", icon: <Sun size={32} /> },
        { name: "EcoLog", icon: <Hexagon size={32} /> },
        { name: "SafraForte", icon: <Sprout size={32} /> },
        { name: "TecnoCampo", icon: <Feather size={32} /> },
        { name: "AgroPlus", icon: <Trees size={32} /> },
    ];

    return (
        <section className="py-12 bg-white border-b border-slate-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 text-center mb-8">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Quem confia na Ruralis PRO
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                    {[...companies, ...companies].map((company, index) => (
                        <div key={index} className="flex items-center gap-3 text-slate-300 hover:text-slate-500 transition-colors grayscale hover:grayscale-0">
                            {company.icon}
                            <span className="text-xl font-black">{company.name}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8 ml-8">
                    {[...companies, ...companies].map((company, index) => (
                        <div key={index} className="flex items-center gap-3 text-slate-300 hover:text-slate-500 transition-colors grayscale hover:grayscale-0">
                            {company.icon}
                            <span className="text-xl font-black">{company.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
