import React from 'react';

export interface GuerrerosLogoProps {
  className?: string;
  size?: number;
  customLogoPngUrl?: string;
}

/**
 * Emblema e Ícono Oficial de la Fraternidad Guerreros de la Luz A.C.
 * Representa con máxima fidelidad heráldica el logotipo oficial:
 * - Aro exterior dorado con filigrana y lemas "FRATERNIDAD DE LA LUZ" y "POR EL HONOR DE SERVIR VIVIMOS"
 * - Flor de la vida en geometría sagrada dorada
 * - Los medallones concéntricos de las zonas y fraternidades hermanas
 * - Escudo central "GUERREROS DE LA LUZ A.C." con la paloma de la paz dentro del triángulo de 12 pasos
 * 
 * Si la administradora sube un archivo PNG nuevo, este componente lo muestra dinámicamente;
 * de lo contrario, conserva de forma fija y permanente este emblema oficial.
 */
export const GuerrerosLogo: React.FC<GuerrerosLogoProps> = ({
  className = 'w-10 h-10',
  size = 48,
  customLogoPngUrl,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Si la administradora subió un PNG nuevo y no hay error, usarlo
  if (customLogoPngUrl && !imgError) {
    return (
      <img
        src={customLogoPngUrl}
        alt="Emblema Oficial Fraternidad Guerreros de la Luz A.C."
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`${className} shrink-0 select-none object-contain drop-shadow-md`}
        style={{
          width: size ? `${size}px` : undefined,
          height: size ? `${size}px` : undefined,
          maxWidth: '100%',
        }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 select-none`}
      role="img"
      aria-label="Emblema Oficial Fraternidad Guerreros de la Luz A.C. • Por el honor de servir vivimos"
    >
      <defs>
        {/* Gradientes dorados con efecto 3D metálico en relieve */}
        <radialGradient id="goldPlate" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#eab308" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="goldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="75%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="80%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="shieldGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="blueMedallionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Sombras para volumen heráldico */}
        <filter id="goldDrop" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
        </filter>
        <filter id="shieldShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.5" />
        </filter>

        {/* Rutas curvas para los textos en el arco superior e inferior */}
        {/* Arco superior para "FRATERNIDAD DE LA LUZ" */}
        <path
          id="arcTopText"
          d="M 68,300 A 232,232 0 1,1 532,300"
          fill="none"
        />
        {/* Arco inferior para "POR EL HONOR DE SERVIR VIVIMOS" */}
        <path
          id="arcBottomText"
          d="M 532,300 A 232,232 0 0,1 68,300"
          fill="none"
        />
      </defs>

      {/* 1. Fondo suave circular */}
      <circle cx="300" cy="300" r="280" fill="url(#goldPlate)" />

      {/* 2. GEOMETRÍA SAGRADA: FLOR DE LA VIDA (Lattice dorado de fondo) */}
      <g stroke="#ca8a04" strokeWidth="1.2" strokeOpacity="0.45" fill="none">
        <circle cx="300" cy="300" r="185" strokeWidth="1.8" />
        <circle cx="300" cy="300" r="120" />
        <circle cx="300" cy="300" r="60" />
        {/* Círculos superpuestos de la flor de la vida */}
        <circle cx="300" cy="240" r="60" />
        <circle cx="352" cy="270" r="60" />
        <circle cx="352" cy="330" r="60" />
        <circle cx="300" cy="360" r="60" />
        <circle cx="248" cy="330" r="60" />
        <circle cx="248" cy="270" r="60" />

        <circle cx="300" cy="180" r="120" />
        <circle cx="404" cy="240" r="120" />
        <circle cx="404" cy="360" r="120" />
        <circle cx="300" cy="420" r="120" />
        <circle cx="196" cy="360" r="120" />
        <circle cx="196" cy="240" r="120" />
      </g>

      {/* 3. ARO EXTERIOR DORADO ORNAMENTADO (Heráldica Oficial) */}
      <g filter="url(#goldDrop)">
        {/* Borde exterior con moldura de cuentas y filigrana */}
        <circle cx="300" cy="300" r="282" stroke="url(#goldBevel)" strokeWidth="4" />
        <circle cx="300" cy="300" r="275" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 3" />
        
        {/* Banda ancha exterior dorada que contiene los textos */}
        <circle cx="300" cy="300" r="248" stroke="url(#goldBevel)" strokeWidth="32" fill="none" opacity="0.12" />
        <circle cx="300" cy="300" r="264" stroke="#ca8a04" strokeWidth="1.5" fill="none" />
        <circle cx="300" cy="300" r="232" stroke="#ca8a04" strokeWidth="2" fill="none" />
        <circle cx="300" cy="300" r="226" stroke="#eab308" strokeWidth="1" strokeDasharray="2 2" fill="none" />

        {/* Nudos heráldicos / Triskelion a las 9 y a las 3 */}
        {/* Nudo Izquierdo (9 en punto) */}
        <g transform="translate(68, 300)">
          <path
            d="M -10,-8 C -18,-14 -18,14 -10,8 C -4,3 4,3 10,8 C 18,14 18,-14 10,-8 C 4,-3 -4,-3 -10,-8 Z"
            fill="none"
            stroke="url(#goldBevel)"
            strokeWidth="2.5"
          />
          <circle cx="0" cy="0" r="3" fill="#ca8a04" />
        </g>
        {/* Nudo Derecho (3 en punto) */}
        <g transform="translate(532, 300)">
          <path
            d="M -10,-8 C -18,-14 -18,14 -10,8 C -4,3 4,3 10,8 C 18,14 18,-14 10,-8 C 4,-3 -4,-3 -10,-8 Z"
            fill="none"
            stroke="url(#goldBevel)"
            strokeWidth="2.5"
          />
          <circle cx="0" cy="0" r="3" fill="#ca8a04" />
        </g>

        {/* Ornamentos de volutas barrocas superiores e inferiores */}
        <g stroke="url(#goldBevel)" strokeWidth="2" fill="none" opacity="0.8">
          <path d="M 280,45 C 290,40 310,40 320,45" />
          <path d="M 270,555 C 290,560 310,560 330,555" />
        </g>

        {/* TEXTO EN ARCO SUPERIOR: "FRATERNIDAD DE LA LUZ" */}
        <text
          fill="url(#goldTextGrad)"
          fontFamily="'Cinzel', 'Times New Roman', 'Georgia', serif"
          fontSize="24"
          fontWeight="bold"
          letterSpacing="5"
        >
          <textPath href="#arcTopText" startOffset="50%" textAnchor="middle">
            FRATERNIDAD DE LA LUZ
          </textPath>
        </text>

        {/* TEXTO EN ARCO INFERIOR: "POR EL HONOR DE SERVIR VIVIMOS" */}
        <text
          fill="url(#goldTextGrad)"
          fontFamily="'Cinzel', 'Times New Roman', 'Georgia', serif"
          fontSize="20"
          fontWeight="bold"
          letterSpacing="4"
        >
          <textPath href="#arcBottomText" startOffset="50%" textAnchor="middle">
            POR EL HONOR DE SERVIR VIVIMOS
          </textPath>
        </text>
      </g>

      {/* 4. MEDALLONES CIRCULARES RADIALES (Zonas y Fraternidades) */}
      <g filter="url(#goldDrop)">
        {/* 12:00: Negro y Plata - "D" / Fraternidad */}
        <g transform="translate(300, 192)">
          <circle cx="0" cy="0" r="22" fill="#18181b" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#94a3b8" strokeWidth="0.8" fill="none" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="15" fontWeight="bold">D</text>
        </g>

        {/* 1:15: Plata / Negro - "CSG" */}
        <g transform="translate(390, 204)">
          <circle cx="0" cy="0" r="22" fill="#334155" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#cbd5e1" strokeWidth="0.8" fill="none" />
          <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="11" fontWeight="bold">CSG</text>
        </g>

        {/* 2:15: Plata - TC */}
        <g transform="translate(442, 260)">
          <circle cx="0" cy="0" r="22" fill="#475569" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#e2e8f0" strokeWidth="0.8" fill="none" />
          <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="11" fontWeight="bold">TC</text>
        </g>

        {/* 3:00: Azul Zafiro - Monograma D */}
        <g transform="translate(450, 326)">
          <circle cx="0" cy="0" r="22" fill="#0284c7" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#bae6fd" strokeWidth="0.8" fill="none" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="14" fontWeight="bold">D</text>
        </g>

        {/* 4:00: Púrpura / Violeta - Árbol de la Vida */}
        <g transform="translate(440, 392)">
          <circle cx="0" cy="0" r="22" fill="#86198f" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#f0abfc" strokeWidth="0.8" fill="none" />
          <path d="M 0,8 L 0,-3 M -7,-9 C -12,-3 -5,5 0,7 C 5,5 12,-3 7,-9 C 3,-13 -3,-13 -7,-9 Z" fill="#ffffff" />
        </g>

        {/* 5:00: Negro - Árbol Legión */}
        <g transform="translate(390, 442)">
          <circle cx="0" cy="0" r="22" fill="#09090b" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#d4d4d8" strokeWidth="0.8" fill="none" />
          <path d="M 0,8 L 0,-3 M -7,-9 C -12,-3 -5,5 0,7 C 5,5 12,-3 7,-9 C 3,-13 -3,-13 -7,-9 Z" fill="#ffffff" />
        </g>

        {/* 5:45: Azul Celeste - Despertar */}
        <g transform="translate(348, 474)">
          <circle cx="0" cy="0" r="20" fill="#0284c7" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="16" stroke="#e0f2fe" strokeWidth="0.8" fill="none" />
          <path d="M 0,6 L 0,-2 M -6,-7 C -10,-2 -4,4 0,6 C 4,4 10,-2 6,-7 C 2,-11 -2,-11 -6,-7 Z" fill="#ffffff" />
        </g>

        {/* 6:15: Ámbar / Oro - Monograma TL */}
        <g transform="translate(300, 468)">
          <circle cx="0" cy="0" r="22" fill="#c2410c" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#fed7aa" strokeWidth="0.8" fill="none" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="13" fontWeight="bold">TL</text>
        </g>

        {/* 7:00: Verde Esmeralda - Gladiadores */}
        <g transform="translate(252, 474)">
          <circle cx="0" cy="0" r="20" fill="#059669" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="16" stroke="#a7f3d0" strokeWidth="0.8" fill="none" />
          <path d="M 0,6 L 0,-2 M -6,-7 C -10,-2 -4,4 0,6 C 4,4 10,-2 6,-7 C 2,-11 -2,-11 -6,-7 Z" fill="#ffffff" />
        </g>

        {/* 7:45: Rojo Fuego - Fénix / Águila */}
        <g transform="translate(204, 442)">
          <circle cx="0" cy="0" r="22" fill="#dc2626" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#fecaca" strokeWidth="0.8" fill="none" />
          {/* Alas doradas del fénix */}
          <path d="M 0,4 Q -6,-3 -11,1 Q -7,-8 0,-6 Q 7,-8 11,1 Q 6,-3 0,4 Z" fill="#fde047" />
          <circle cx="0" cy="-6" r="2" fill="#fde047" />
        </g>

        {/* 8:30: Rosa / Fucsia - Amazonas */}
        <g transform="translate(160, 392)">
          <circle cx="0" cy="0" r="22" fill="#f43f5e" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#ffe4e6" strokeWidth="0.8" fill="none" />
          <path d="M 0,8 L 0,-3 M -7,-9 C -12,-3 -5,5 0,7 C 5,5 12,-3 7,-9 C 3,-13 -3,-13 -7,-9 Z" fill="#ffffff" />
        </g>

        {/* 9:00: Verde Lima - Monograma */}
        <g transform="translate(150, 326)">
          <circle cx="0" cy="0" r="22" fill="#65a30d" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#ecfccb" strokeWidth="0.8" fill="none" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="13" fontWeight="bold">D</text>
        </g>

        {/* 10:00: Bronce Marrón - Monograma */}
        <g transform="translate(160, 260)">
          <circle cx="0" cy="0" r="22" fill="#78350f" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#fef3c7" strokeWidth="0.8" fill="none" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="13" fontWeight="bold">PL</text>
        </g>

        {/* 11:00: Naranja Ámbar - Monograma */}
        <g transform="translate(204, 204)">
          <circle cx="0" cy="0" r="22" fill="#ea580c" stroke="url(#goldBevel)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" stroke="#ffedd5" strokeWidth="0.8" fill="none" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="14" fontWeight="bold">J</text>
        </g>
      </g>

      {/* 5. ESCUDO CENTRAL HERALDICO ("GUERREROS DE LA LUZ A.C.") */}
      <g filter="url(#shieldShadow)">
        {/* Contorno exterior del escudo con reborde dorado biselado */}
        <path
          d="M 235,230 C 235,230 300,218 365,230 C 365,335 348,390 300,432 C 252,390 235,335 235,230 Z"
          fill="#ffffff"
          stroke="url(#shieldGoldRim)"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Moldura interior dorada fina */}
        <path
          d="M 242,238 C 242,238 300,227 358,238 C 358,330 342,380 300,420 C 258,380 242,330 242,238 Z"
          fill="none"
          stroke="#ca8a04"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Placa superior gris metálica: "GUERREROS DE LA LUZ" */}
        <path
          d="M 240,235 C 240,235 300,225 360,235 L 360,274 C 330,270 270,270 240,274 Z"
          fill="#64748b"
        />
        <path
          d="M 240,235 C 240,235 300,225 360,235 L 360,274 C 330,270 270,270 240,274 Z"
          fill="none"
          stroke="url(#goldBevel)"
          strokeWidth="2"
        />

        {/* Textos placa superior */}
        <text
          x="300"
          y="253"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="12.5"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          GUERREROS
        </text>
        <text
          x="300"
          y="267"
          textAnchor="middle"
          fill="#fef08a"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="1"
        >
          DE LA LUZ
        </text>

        {/* Letras intermedias: A    C */}
        <text
          x="263"
          y="312"
          textAnchor="middle"
          fill="#0f172a"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="26"
          fontWeight="bold"
        >
          A
        </text>

        {/* Distintivo central / Flor de lis pequeña entre A y C */}
        <path
          d="M 300,288 C 298,282 302,282 300,288 C 296,286 295,291 298,293 C 296,295 300,296 300,298 C 300,296 304,295 302,293 C 305,291 304,286 300,288 Z"
          fill="#d97706"
        />

        <text
          x="337"
          y="312"
          textAnchor="middle"
          fill="#0f172a"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="26"
          fontWeight="bold"
        >
          C
        </text>

        {/* MEDALLÓN AZUL DE LOS 12 PASOS (Parte inferior del escudo) */}
        <circle cx="300" cy="358" r="33" fill="url(#blueMedallionGrad)" stroke="url(#goldBevel)" strokeWidth="3" />
        <circle cx="300" cy="358" r="28" stroke="#ffffff" strokeWidth="1.2" fill="none" />

        {/* Triángulo equilátero blanco de Recuperación */}
        <polygon
          points="300,336 276,375 324,375"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Paloma de la Paz en vuelo blanca dentro del triángulo */}
        <g transform="translate(300, 357) scale(0.95)">
          <path
            d="M 0,-6 C -4,-12 -12,-8 -9,-2 C -11,-1 -13,3 -15,7 C -10,6 -5,3 -2,1 C -3,5 -4,9 -4,13 C 0,9 4,4 5,0 C 9,3 13,6 16,8 C 14,4 12,0 9,-2 C 12,-6 6,-11 0,-6 Z"
            fill="#ffffff"
          />
          {/* Pequeño olivo verde */}
          <path d="M 0,-6 Q 4,-9 7,-7" stroke="#86efac" strokeWidth="1.2" fill="none" />
        </g>
      </g>
    </svg>
  );
};
