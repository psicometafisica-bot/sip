
import React, { useState, useCallback, useEffect } from 'react';
import { findSubstitutes, getTechnicalSpecifications } from '../services/geminiService';
import type { SubstitutionResult, Material, Substitute } from '../types';
import Spinner from './common/Spinner';

interface SubstitutionMatrixProps {
  inventory: Material[];
  updateStock: (sku: string, quantityToDecrement: number) => void;
}

const TechnicalSpecModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, content, isLoading }) => {
    if (!isOpen) return null;

    const formatContent = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-tec-gray">$1</strong>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-tec-blue">FICHA TÉCNICA DE MATERIAL – TECPETROL</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <p className="mt-3 text-tec-gray">Consultando a la IA...</p>
                    </div>
                ) : (
                    <div 
                      className="max-h-[60vh] overflow-y-auto pr-2 text-gray-700 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                    />
                )}
            </div>
        </div>
    );
};


const IntegrationModal: React.FC<{
  material: Material | null;
  action: 'used' | 'integrated';
  isOpen: boolean;
  onClose: () => void;
}> = ({ material, action, isOpen, onClose }) => {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsActionLoading(false);
            setActionMessage('');
        }
    }, [isOpen]);

    if (!isOpen || !material) return null;

    const handleIntegrationAction = (system: string) => {
        setIsActionLoading(true);
        setActionMessage('');
        setTimeout(() => {
            setActionMessage(`Acción para SKU ${material.sku} registrada en ${system}.`);
            setIsActionLoading(false);
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg font-bold text-tec-blue">{action === 'used' ? 'Confirmar Uso de Material' : 'Integrar Sustituto'}</h3>
                    <button onClick={onClose} disabled={isActionLoading} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                {!actionMessage && !isActionLoading && (
                    <>
                        <p className="mb-2"><strong>Material a utilizar:</strong></p>
                        <p className="mb-4 text-sm bg-gray-100 p-2 rounded">{material.description} (SKU: {material.sku})</p>
                        <p className="mb-4">
                          {action === 'used' 
                            ? 'Esto descontará 1 unidad del stock. Puede registrar esta acción en otros sistemas.'
                            : 'Seleccione el sistema de destino para registrar el uso del sustituto:'
                          }
                        </p>
                        <div className="space-y-3">
                            <button onClick={() => handleIntegrationAction('SAP FIORI')} className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors">Crear Reserva en SAP</button>
                            <button onClick={() => handleIntegrationAction('COUPA')} className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">Notificar a Compras (COUPA)</button>
                            <button onClick={onClose} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors mt-2">Cerrar</button>
                        </div>
                    </>
                )}
                {isActionLoading && (
                    <div className="flex flex-col items-center justify-center h-24">
                        <Spinner />
                        <p className="mt-2 text-tec-gray">Procesando integración...</p>
                    </div>
                )}
                {actionMessage && (
                    <div className="flex flex-col items-center justify-center h-24 text-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-luxen-green mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="font-semibold text-tec-gray">{actionMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const MaterialCard: React.FC<{ 
    material: Material; 
    title: string; 
    onUse: (mat: Material) => void; 
    onShowSpecs: (mat: Material) => void;
}> = ({ material, title, onUse, onShowSpecs }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-tec-blue flex flex-col justify-between">
    <div>
      <h3 className="text-lg font-bold text-tec-blue mb-2">{title}</h3>
      <p><strong>SKU:</strong> {material.sku}</p>
      <p><strong>Descripción:</strong> {material.description}</p>
      <p><strong>Stock:</strong> <span className={`font-semibold ${material.stock === 0 ? 'text-luxen-red' : ''}`}>{material.stock.toLocaleString()} unidades</span></p>
      <p><strong>Ubicación:</strong> {material.location}</p>
    </div>
    <div className="mt-4 space-y-2">
      <button onClick={() => onShowSpecs(material)} className="w-full bg-tec-gray text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
        Ver Especificaciones Técnicas
      </button>
      <button onClick={() => onUse(material)} disabled={material.stock === 0} className="w-full bg-tec-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
        Usar Material Original
      </button>
    </div>
  </div>
);

const SubstituteCard: React.FC<{ substitute: Substitute; onUse: (sub: Substitute) => void; }> = ({ substitute, onUse }) => {
    const compatibilityColor = substitute.compatibility > 80 ? 'bg-luxen-green' : substitute.compatibility > 50 ? 'bg-luxen-yellow' : 'bg-luxen-red';
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 transition-transform hover:scale-105">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-tec-gray">{substitute.description}</h4>
                    <p className="text-sm text-gray-500">SKU: {substitute.sku}</p>
                </div>
                <div className={`text-white text-sm font-bold px-3 py-1 rounded-full ${compatibilityColor}`}>
                    {substitute.compatibility}%
                </div>
            </div>
            <p className="text-sm my-2 text-gray-600"><em>{substitute.justification}</em></p>
            <div className="flex justify-between items-center text-sm mt-3">
                <span><strong>Stock:</strong> <span className={substitute.stock === 0 ? 'text-luxen-red font-bold' : ''}>{substitute.stock.toLocaleString()}</span></span>
                <span><strong>Ubicación:</strong> {substitute.location}</span>
                <button onClick={() => onUse(substitute)} disabled={substitute.stock === 0} className="bg-tec-green text-white px-3 py-1 rounded-md hover:bg-opacity-80 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Usar Sustituto
                </button>
            </div>
        </div>
    );
};


const SubstitutionMatrix: React.FC<SubstitutionMatrixProps> = ({ inventory, updateStock }) => {
  const [mode, setMode] = useState<'list' | 'search'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SubstitutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [modalAction, setModalAction] = useState<'used' | 'integrated'>('used');

  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specModalContent, setSpecModalContent] = useState('');
  const [isSpecLoading, setIsSpecLoading] = useState(false);


  const handleUseMaterial = (material: Material | Substitute) => {
    if (material.stock > 0) {
      updateStock(material.sku, 1);
      setSelectedMaterial(material);
      // Check if it's a substitute to decide modal type
      const isSubstitute = 'compatibility' in material;
      setModalAction(isSubstitute ? 'integrated' : 'used');
      setIsModalOpen(true);
    }
  };

  const handleShowSpecs = async (material: { description: string }) => {
    setIsSpecModalOpen(true);
    setIsSpecLoading(true);
    setSpecModalContent('');
    try {
        const specs = await getTechnicalSpecifications(material.description);
        setSpecModalContent(specs);
    } catch (err) {
        setSpecModalContent('Error al obtener las especificaciones técnicas. Por favor, intente de nuevo.');
        console.error(err);
    } finally {
        setIsSpecLoading(false);
    }
  };

  const fetchSubstitutes = useCallback(async (query: string, originalMaterialFromList?: Material) => {
    if (!query.trim()) {
        setError("Por favor, ingrese o seleccione un material.");
        return;
    };

    setLoading(true);
    setError(null);
    setResults(null);
    setSearchTerm(query);

    try {
      const data = await findSubstitutes(query);
      
      // Determine the source of truth for the original material.
      // If an original material is passed from the inventory list, use it directly.
      // Otherwise, use the one from the AI and try to sync its stock.
      const original = originalMaterialFromList ? originalMaterialFromList : {
        ...data.original,
        stock: inventory.find(i => i.sku === data.original.sku)?.stock ?? data.original.stock
      };

      // Always synchronize substitute stocks with the central inventory.
      const updatedSubstitutes = data.substitutes.map(sub => ({
        ...sub,
        stock: inventory.find(i => i.sku === sub.sku)?.stock ?? sub.stock
      }));

      setResults({ original, substitutes: updatedSubstitutes });

    } catch (err) {
      setError('Error al buscar sustitutos. El modelo de IA puede estar desconectado. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [inventory]);

  useEffect(() => {
    if (results) {
      const updatedOriginal = {
        ...results.original,
        stock: inventory.find(i => i.sku === results.original.sku)?.stock ?? results.original.stock
      };
      const updatedSubstitutes = results.substitutes.map(sub => ({
        ...sub,
        stock: inventory.find(i => i.sku === sub.sku)?.stock ?? sub.stock
      }));
      setResults({ original: updatedOriginal, substitutes: updatedSubstitutes });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory]);
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchSubstitutes(searchTerm);
  };

  return (
    <div className="space-y-6">
       <IntegrationModal 
        material={selectedMaterial}
        action={modalAction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
       <TechnicalSpecModal 
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        content={specModalContent}
        isLoading={isSpecLoading}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-tec-gray mb-4">Buscar Sustitutos de Materiales</h2>
        
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setMode('list')}
                    className={`${ mode === 'list' ? 'border-tec-blue text-tec-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    Explorar Lista
                </button>
                 <button
                    onClick={() => setMode('search')}
                    className={`${ mode === 'search' ? 'border-tec-blue text-tec-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    Búsqueda Manual
                </button>
            </nav>
        </div>

        <div className="mt-6">
            {mode === 'search' && (
                 <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ingrese descripción o SKU del material (ej: 'tornillo de acero...')"
                        className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-tec-blue focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-tec-blue text-white font-bold py-3 px-6 rounded-md hover:bg-blue-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {loading ? <Spinner size="sm" /> : 'Buscar'}
                    </button>
                </form>
            )}
            {mode === 'list' && (
                <div>
                     <h3 className="text-md font-semibold text-tec-gray mb-3">Seleccione un material del inventario para analizar:</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-2">
                        {inventory.map((item) => (
                            <div key={item.sku} className="text-left p-4 bg-gray-50 rounded-lg shadow-sm flex flex-col justify-between">
                                <div>
                                    <p className="font-bold text-sm text-tec-gray">{item.sku}</p>
                                    <p className="text-xs text-gray-600">{item.description}</p>
                                </div>
                                <div className="mt-3 flex items-center space-x-2">
                                    <button onClick={() => fetchSubstitutes(item.description, item)} className="flex-1 text-xs text-center bg-tec-blue text-white font-semibold py-2 px-2 rounded-md hover:bg-blue-800 transition-colors">
                                        Buscar Sustitutos
                                    </button>
                                    <button onClick={() => handleShowSpecs(item)} className="flex-1 text-xs text-center bg-tec-gray text-white font-semibold py-2 px-2 rounded-md hover:bg-gray-700 transition-colors">
                                        Ver Especificaciones
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {error && <div className="text-center text-luxen-red p-4 bg-red-100 rounded-md mt-4">{error}</div>}
      
      {loading && (
        <div className="text-center p-4">
            <div className="flex justify-center mb-2"><Spinner /></div>
            <p className="text-tec-gray font-semibold">La IA está analizando los materiales...</p>
            <p className="text-sm text-gray-500">Buscando sustitutos para "{searchTerm}"</p>
        </div>
      )}

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MaterialCard 
              material={results.original} 
              title="Material Original" 
              onUse={handleUseMaterial}
              onShowSpecs={handleShowSpecs}
          />
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-tec-blue mb-4">Sustitutos Compatibles ({results.substitutes.length})</h3>
            <div className="max-h-[25rem] overflow-y-auto pr-2">
                {results.substitutes.length > 0 ? (
                    results.substitutes.map((sub, index) => <SubstituteCard key={index} substitute={sub} onUse={handleUseMaterial}/>)
                ) : (
                    <p className="text-center text-gray-500 p-4">No se encontraron sustitutos para este material.</p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubstitutionMatrix;
