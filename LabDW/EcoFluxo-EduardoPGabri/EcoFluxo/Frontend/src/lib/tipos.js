import { Cog, Leaf, Newspaper, Recycle, Trash2, Wine } from "lucide-react";

export const TIPOS = {
  PLASTICO: { label: "Plástico", Icon: Recycle },
  VIDRO: { label: "Vidro", Icon: Wine },
  PAPEL: { label: "Papel", Icon: Newspaper },
  METAL: { label: "Metal", Icon: Cog },
  ORGANICO: { label: "Orgânico", Icon: Leaf },
};

export function infoTipo(tipo) {
  return TIPOS[tipo] ?? { label: tipo, Icon: Trash2 };
}
