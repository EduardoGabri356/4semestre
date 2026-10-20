// ==================== GraficoSituacao.jsx — gráfico pizza/barras (react-apexcharts) ====================

import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const SITUACOES = ["Pendente", "Finalizada", "Cancelada"];
const CORES = ["#EAB308", "#16A34A", "#DC2626"];   // mesma ordem das situações

export default function GraficoSituacao({ itens }) {
  const [tipo, setTipo] = useState("pie");          // "pie" ou "bar"

  // dado derivado: conta por situação a cada render
  const contagem = SITUACOES.map((s) => itens.filter((i) => i.situacao === s).length);
  const total = contagem.reduce((soma, n) => soma + n, 0);
  if (total === 0) return null;                     // nada para desenhar

  const optionsPizza = { chart: { type: "pie" }, labels: SITUACOES, colors: CORES, legend: { position: "bottom" } };
  const optionsBarras = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: CORES,
    plotOptions: { bar: { distributed: true, borderRadius: 4 } },   // distributed: uma cor por barra
    xaxis: { categories: SITUACOES },
    yaxis: { labels: { formatter: (v) => Math.round(v) } },         // só inteiros
    legend: { show: false },
    dataLabels: { enabled: true },
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Itens por situação ({total})</h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTipo("pie")} className={`px-3 py-1.5 text-xs rounded-lg border ${tipo === "pie" ? "bg-blue-600 text-white" : "bg-white"}`}>Pizza</button>
          <button type="button" onClick={() => setTipo("bar")} className={`px-3 py-1.5 text-xs rounded-lg border ${tipo === "bar" ? "bg-blue-600 text-white" : "bg-white"}`}>Barras</button>
        </div>
      </div>
      {/* key força recriar o gráfico ao trocar o tipo */}
      {tipo === "pie" ? (
        <ReactApexChart key="pie" type="pie" height={300} options={optionsPizza} series={contagem} />
      ) : (
        <ReactApexChart key="bar" type="bar" height={300} options={optionsBarras} series={[{ name: "Itens", data: contagem }]} />
      )}
    </div>
  );
}
