import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const SITUACOES = ["Pendente", "Finalizada", "Cancelada"];
// mesmas cores das etiquetas de situação do TodoItem
const CORES = ["#EAB308", "#16A34A", "#DC2626"];

export default function GraficoSituacao({ todos }) {
  const [tipo, setTipo] = useState("pie"); // "pie" (pizza) ou "bar" (barras)

  // quantidade de tarefas para cada situação
  const contagem = SITUACOES.map(
    (situacao) => todos.filter((t) => t.situacao === situacao).length
  );
  const total = contagem.reduce((soma, n) => soma + n, 0);

  if (total === 0) {
    return null;
  }

  const optionsPizza = {
    chart: { type: "pie" },
    labels: SITUACOES,
    colors: CORES,
    legend: { position: "bottom" },
  };

  const optionsBarras = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: CORES,
    plotOptions: { bar: { distributed: true, borderRadius: 4 } },
    xaxis: { categories: SITUACOES },
    yaxis: { labels: { formatter: (v) => Math.round(v) } },
    legend: { show: false },
    dataLabels: { enabled: true },
  };

  const botao = (valor, texto) => (
    <button
      type="button"
      onClick={() => setTipo(valor)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
        tipo === valor
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {texto}
    </button>
  );

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-800">
          Tarefas por situação ({total})
        </h3>
        <div className="flex items-center gap-2">
          {botao("pie", "Pizza")}
          {botao("bar", "Barras")}
        </div>
      </div>

      {/* key força recriar o gráfico ao trocar entre pizza e barras */}
      {tipo === "pie" ? (
        <ReactApexChart
          key="pie"
          type="pie"
          height={300}
          options={optionsPizza}
          series={contagem}
        />
      ) : (
        <ReactApexChart
          key="bar"
          type="bar"
          height={300}
          options={optionsBarras}
          series={[{ name: "Tarefas", data: contagem }]}
        />
      )}
    </div>
  );
}
