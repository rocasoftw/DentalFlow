import React, { useState } from 'react';

const ODONTOGRAM_CONDITIONS = {
  healthy: { label: 'Sano', color: 'fill-white' },
  restoration: { label: 'Obturado', color: 'fill-blue-500' },
  caries: { label: 'Caries', color: 'fill-red-500' },
  extraction_needed: { label: 'Exodoncia (X)', color: 'stroke-red-500', symbol: 'X' },
  missing: { label: 'Ausente (=)', color: 'stroke-blue-500', symbol: '=' },
  crown: { label: 'Corona', color: 'fill-yellow-400' },
  implant: { label: 'Implante', color: 'fill-purple-500' },
  root_canal: { label: 'Tto. Conducto', color: 'fill-orange-400' },
  sealant: { label: 'Sellante', color: 'fill-green-400' },
  fracture: { label: 'Fractura', color: 'fill-pink-500' },
};

const Tooth = ({ number, state, onClick, textPosition }) => {
    const C = 20; // Center
    const R = 18; // Outer Radius
    const r = 8;  // Inner Radius
    const k = 1 / Math.sqrt(2);
    const Rk = R * k;
    const rk = r * k;

    // Rotated points for 45-degree division
    const pNE_R = { x: C + Rk, y: C - Rk }; // North-East Outer
    const pSE_R = { x: C + Rk, y: C + Rk }; // South-East Outer
    const pSW_R = { x: C - Rk, y: C + Rk }; // South-West Outer
    const pNW_R = { x: C - Rk, y: C - Rk }; // North-West Outer

    const pNE_r = { x: C + rk, y: C - rk }; // North-East Inner
    const pSE_r = { x: C + rk, y: C + rk }; // South-East Inner
    const pSW_r = { x: C - rk, y: C + rk }; // South-West Inner
    const pNW_r = { x: C - rk, y: C - rk }; // North-West Inner

    const toothPaths = {
        occlusal: `M ${C - r},${C} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`,
        // Top quadrant (Vestibular)
        vestibular: `M ${pNW_r.x},${pNW_r.y} L ${pNW_R.x},${pNW_R.y} A ${R},${R} 0 0 1 ${pNE_R.x},${pNE_R.y} L ${pNE_r.x},${pNE_r.y} A ${r},${r} 0 0 0 ${pNW_r.x},${pNW_r.y} Z`,
        // Right quadrant (Mesial)
        mesial: `M ${pNE_r.x},${pNE_r.y} L ${pNE_R.x},${pNE_R.y} A ${R},${R} 0 0 1 ${pSE_R.x},${pSE_R.y} L ${pSE_r.x},${pSE_r.y} A ${r},${r} 0 0 0 ${pNE_r.x},${pNE_r.y} Z`,
        // Bottom quadrant (Lingual)
        lingual: `M ${pSE_r.x},${pSE_r.y} L ${pSE_R.x},${pSE_R.y} A ${R},${R} 0 0 1 ${pSW_R.x},${pSW_R.y} L ${pSW_r.x},${pSW_r.y} A ${r},${r} 0 0 0 ${pSE_r.x},${pSE_r.y} Z`,
        // Left quadrant (Distal)
        distal: `M ${pSW_r.x},${pSW_r.y} L ${pSW_R.x},${pSW_R.y} A ${R},${R} 0 0 1 ${pNW_R.x},${pNW_R.y} L ${pNW_r.x},${pNW_r.y} A ${r},${r} 0 0 0 ${pSW_r.x},${pSW_r.y} Z`,
    };

    const wholeToothCondition = state?.occlusal?.condition;
    const conditionInfo = ODONTOGRAM_CONDITIONS[wholeToothCondition];
    const textY = textPosition === 'top' ? -8 : (2*C) + 18;

    if (conditionInfo?.symbol) {
        return (
            <g className="cursor-pointer group" onClick={() => onClick('occlusal')}>
                <text x={C} y={textY} textAnchor="middle" fontSize="12" className="fill-gray-700 select-none font-semibold">{number}</text>
                <g>
                    <circle cx={C} cy={C} r={R} fill="none" className="stroke-gray-400 stroke-1" />
                    {conditionInfo.symbol === 'X' && (
                        <path d={`M ${C - R / 1.5},${C - R / 1.5} L ${C + R / 1.5},${C + R / 1.5} M ${C - R / 1.5},${C + R / 1.5} L ${C + R / 1.5},${C - R / 1.5}`} className={`${conditionInfo.color} stroke-[3px]`} />
                    )}
                    {conditionInfo.symbol === '=' && (
                        <path d={`M ${C - R / 1.5},${C - R / 4} L ${C + R / 1.5},${C - R / 4} M ${C - R / 1.5},${C + R / 4} L ${C + R / 1.5},${C + R / 4}`} className={`${conditionInfo.color} stroke-[3px]`} />
                    )}
                </g>
            </g>
        );
    }
    
    return (
        <g className="cursor-pointer group">
            <text x={C} y={textY} textAnchor="middle" fontSize="12" className="fill-gray-700 select-none font-semibold">{number}</text>
            <g>
              {Object.entries(toothPaths).map(([face, pathD]) => 
                  <path
                      key={face}
                      d={pathD}
                      onClick={(e) => { e.stopPropagation(); onClick(face); }}
                      className={`${(ODONTOGRAM_CONDITIONS[state?.[face]?.condition] || ODONTOGRAM_CONDITIONS.healthy).color} stroke-gray-700 stroke-1 group-hover:stroke-primary-500 transition-all`}
                  />
              )}
            </g>
        </g>
    );
};

const Odontogram = ({ dentalState, onToothFaceClick }) => {
    const [selected, setSelected] = useState(null);
    const [condition, setCondition] = useState('healthy');
    const [view, setView] = useState('adult');
    
    const TOOTH_WIDTH = 45;

    const adultQuadrants = {
        q1: [18, 17, 16, 15, 14, 13, 12, 11],
        q2: [21, 22, 23, 24, 25, 26, 27, 28],
        q3: [31, 32, 33, 34, 35, 36, 37, 38],
        q4: [48, 47, 46, 45, 44, 43, 42, 41],
    };

    const childQuadrants = {
        q5: [55, 54, 53, 52, 51],
        q6: [61, 62, 63, 64, 65],
        q7: [71, 72, 73, 74, 75],
        q8: [85, 84, 83, 82, 81],
    };

    const renderQuadrant = (numbers, textPos) => 
        numbers.map((num, index) => (
            <g key={num} transform={`translate(${index * TOOTH_WIDTH}, 0)`}>
                <Tooth 
                    number={num} 
                    state={dentalState[num.toString()]} 
                    onClick={(face) => setSelected({ tooth: num, face })}
                    textPosition={textPos}
                />
            </g>
        ));

    const handleSaveCondition = () => {
        if (selected) {
            onToothFaceClick(selected.tooth, selected.face, condition);
            setSelected(null);
        }
    };
    
    const AdultOdontogram = () => (
      <svg viewBox="0 0 810 220" className="min-w-[760px]">
          <line x1="0" y1="110" x2="810" y2="110" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
          <line x1="405" y1="0" x2="405" y2="220" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
          <g transform="translate(10, 50)">{renderQuadrant(adultQuadrants.q1, 'top')}</g>
          <g transform="translate(445, 50)">{renderQuadrant(adultQuadrants.q2, 'top')}</g>
          <g transform="translate(10, 115)">{renderQuadrant(adultQuadrants.q4, 'bottom')}</g>
          <g transform="translate(445, 115)">{renderQuadrant(adultQuadrants.q3, 'bottom')}</g>
      </svg>
    );

    const ChildOdontogram = () => (
      <svg viewBox="0 0 540 220" className="min-w-[500px]">
          <line x1="0" y1="110" x2="540" y2="110" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
          <line x1="270" y1="0" x2="270" y2="220" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
          <g transform="translate(10, 50)">{renderQuadrant(childQuadrants.q5, 'top')}</g>
          <g transform="translate(280, 50)">{renderQuadrant(childQuadrants.q6, 'top')}</g>
          <g transform="translate(10, 115)">{renderQuadrant(childQuadrants.q8, 'bottom')}</g>
          <g transform="translate(280, 115)">{renderQuadrant(childQuadrants.q7, 'bottom')}</g>
      </svg>
    );


    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200">
             <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
                    Odontograma {view === 'adult' ? 'Adulto' : 'Infantil'}
                </h3>
                <button 
                    onClick={() => setView(view === 'adult' ? 'child' : 'adult')} 
                    className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline transition-all"
                >
                    Ver Odontograma {view === 'adult' ? 'Infantil' : 'Adulto'}
                </button>
            </div>
            <div className="flex justify-center overflow-x-auto p-4 bg-gray-50 rounded-lg">
                {view === 'adult' ? <AdultOdontogram /> : <ChildOdontogram />}
            </div>

            {selected && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200 shadow-md">
                    <h4 className="font-semibold text-gray-800">Modificar: Pieza <span className="font-bold">{selected.tooth}</span>, Cara <span className="font-bold capitalize">{selected.face}</span></h4>
                    <div className="flex items-center space-x-4 mt-3">
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                            {Object.entries(ODONTOGRAM_CONDITIONS).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button onClick={handleSaveCondition} className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm transition-colors">Guardar</button>
                        <button onClick={() => setSelected(null)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors">Cancelar</button>
                    </div>
                </div>
            )}
            
            <div className="mt-6 p-2 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Referencias</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-1 text-xs">
                    {Object.entries(ODONTOGRAM_CONDITIONS).map(([key, { label, color, symbol }]) => (
                        <div key={key} className="flex items-center">
                            {symbol ? (
                                <span className={`font-mono font-bold text-lg w-4 text-center mr-1.5 ${symbol === '=' ? 'text-blue-500' : 'text-red-500'}`}>{symbol}</span>
                            ) : (
                                <div className={`w-3 h-3 rounded-sm ${color.replace('fill-', 'bg-')} mr-1.5 border border-gray-400`}></div>
                            )}
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Odontogram;
