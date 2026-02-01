import React from 'react';

interface RowProps {
  label: string;
  value: string | number;
  unit?: string;
  isHeader?: boolean;
}

export const TechnicalTable = ({ title, rows }: { title: string, rows: RowProps[] }) => {
  return (
    // A classe 'no-break' garante que esta tabela inteira pule para a próxima
    // página se não couber na atual, em vez de ser cortada ao meio.
    <div className="no-break mt-6 mb-8 border border-black rounded-lg overflow-hidden">
      
      {/* Cabeçalho da Tabela */}
      <div className="bg-slate-100 border-b border-black p-3 flex justify-between items-center print:bg-slate-200">
        <h3 className="font-bold text-sm uppercase text-black tracking-wider">
          {title}
        </h3>
      </div>

      {/* Corpo da Tabela */}
      <table className="w-full text-sm text-left">
        <tbody>
          {rows.map((row, index) => (
            <tr 
              key={index} 
              className={`
                border-b border-slate-200 last:border-0 
                ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} // Efeito Zebra
                ${row.isHeader ? 'bg-slate-800 text-white print:bg-slate-800 print:text-white font-bold' : ''}
              `}
            >
              <td className={`p-3 w-2/3 ${row.isHeader ? 'text-white' : 'text-slate-600 font-medium'}`}>
                {row.label}
              </td>
              <td className={`p-3 w-1/3 text-right font-bold ${row.isHeader ? 'text-white' : 'text-black'}`}>
                {row.value} <span className="text-xs font-normal text-slate-500 ml-1">{row.unit}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};