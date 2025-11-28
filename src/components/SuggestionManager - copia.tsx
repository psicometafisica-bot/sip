import React, { useState } from 'react';
import Spinner from './common/Spinner';
import type { Suggestion, View } from '../types';

const SuggestionForm: React.FC<{addSuggestion: (s: Omit<Suggestion, 'id' | 'status' | 'submittedBy'>) => void}> = ({ addSuggestion }) => {
    const [originalSku, setOriginalSku] = useState('');
    const [substituteSku, setSubstituteSku] = useState('');
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!originalSku || !substituteSku || !justification) {
            setMessage('Por favor, complete todos los campos.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        // Simulate API call
        setTimeout(() => {
            addSuggestion({ originalSku, substituteSku, justification });
            setOriginalSku('');
            setSubstituteSku('');
            setJustification('');
            setIsSubmitting(false);
            setMessage('¡Sugerencia enviada! Ahora debe ser validada en el Catálogo (Sphera).');
            setTimeout(() => setMessage(''), 4000);
        }, 1000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-tec-gray mb-4">Sugerir un Nuevo Sustituto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="originalSku" className="block text-sm font-medium text-gray-700">SKU del Material Original</label>
                        <input type="text" id="originalSku" value={originalSku} onChange={e => setOriginalSku(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tec-blue focus:border-tec-blue"/>
                    </div>
                    <div>
                        <label htmlFor="substituteSku" className="block text-sm font-medium text-gray-700">SKU del Sustituto Sugerido</label>
                        <input type="text" id="substituteSku" value={substituteSku} onChange={e => setSubstituteSku(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tec-blue focus:border-tec-blue"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="justification" className="block text-sm font-medium text-gray-700">Justificación / Notas Técnicas</label>
                    <textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tec-blue focus:border-tec-blue"></textarea>
                </div>
                <div className="flex items-center justify-between">
                    <button type="submit" disabled={isSubmitting} className="bg-tec-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors disabled:bg-gray-400 flex items-center justify-center">
                        {isSubmitting ? <Spinner size="sm" /> : 'Enviar a Revisión'}
                    </button>
                    {message && <p className="text-sm text-luxen-green">{message}</p>}
                </div>
            </form>
        </div>
    );
};

interface SuggestionManagerProps {
    suggestions: Suggestion[];
    addSuggestion: (newSuggestion: Omit<Suggestion, 'id' | 'status' | 'submittedBy'>) => void;
    setActiveView: (view: View) => void;
}

const SuggestionManager: React.FC<SuggestionManagerProps> = ({ suggestions, addSuggestion, setActiveView }) => {

    const getStatusColor = (status: Suggestion['status']) => {
        switch (status) {
            case 'Pendiente de Validación en Sphera': return 'bg-yellow-100 text-yellow-800';
            case 'Aprobado': return 'bg-green-100 text-green-800';
            case 'Rechazado': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <SuggestionForm addSuggestion={addSuggestion} />
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-tec-gray mb-4">Sugerencias Pendientes y Pasadas</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sustituto</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {suggestions.map((s) => (
                                <tr key={s.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.originalSku}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{s.substituteSku}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {s.status === 'Pendiente de Validación en Sphera' && (
                                            <button 
                                                onClick={() => setActiveView('catalog')}
                                                className="bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded hover:bg-blue-700 transition-colors"
                                            >
                                                Verificar Cumplimiento
                                            </button>
                                        )}
                                     </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuggestionManager;