// ==================== useVoiceRecognition — HOOK DE VOZ (Web Speech API, Chrome/Edge) ====================

import { useState, useEffect, useRef } from "react";

// data LOCAL no formato do <input type="date">: "YYYY-MM-DD" (toISOString usaria UTC e erraria à noite)
const formatarData = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function interpretarDataVoz(texto) {
  const fala = texto.toLowerCase().trim();
  const somarDias = (dias) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return formatarData(d);
  };
  // "depois de amanhã" ANTES de "amanhã", pois o primeiro contém o segundo
  if (fala.includes("depois de amanhã") || fala.includes("depois de amanha")) return somarDias(2);
  if (fala.includes("amanhã") || fala.includes("amanha")) return somarDias(1);
  if (fala.includes("hoje")) return somarDias(0);
  const m = fala.match(/daqui a (\d+) dias?/);
  if (m) return somarDias(parseInt(m[1], 10));
  return "";
}

export function useVoiceRecognition() {
  const [textoOuvido, setTextoOuvido] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const [suportado, setSuportado] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // Chrome/Edge
    if (!SpeechRecognition) {
      setSuportado(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;        // não para a cada pausa
    recognition.interimResults = true;    // trechos parciais enquanto fala
    recognition.lang = "pt-BR";
    recognition.onresult = (event) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
      }
      if (final) setTextoOuvido(final.trim());
    };
    recognition.onerror = () => setOuvindo(false);
    recognition.onend = () => setOuvindo(false);
    recognitionRef.current = recognition;
  }, []);

  // alternador liga/desliga
  const iniciarEscuta = () => {
    if (!recognitionRef.current) return;
    if (ouvindo) {
      recognitionRef.current.stop();
      setOuvindo(false);
    } else {
      setTextoOuvido("");
      setOuvindo(true);
      recognitionRef.current.start();
    }
  };

  // interpreta a frase e chama o setter do campo (os setters vêm por parâmetro: o hook não conhece o formulário)
  const processarComandoVoz = (fala, setTitulo, setDescricao, setDataLimite) => {
    if (!fala) return;
    const titulo = fala.match(/(?:título|titulo)\s+(.+)/i);
    if (titulo) return setTitulo(titulo[1].trim());
    const descricao = fala.match(/(?:descrição|descricao)\s+(.+)/i);
    if (descricao) return setDescricao(descricao[1].trim());
    const data = fala.match(/(?:data limite|data|prazo)\s+(.+)/i);
    if (data) {
      const formatada = interpretarDataVoz(data[1]);
      if (formatada) setDataLimite(formatada);
    }
  };

  return { textoOuvido, setTextoOuvido, ouvindo, iniciarEscuta, processarComandoVoz, suportado };
}
