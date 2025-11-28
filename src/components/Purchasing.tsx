import React, { useState } from 'react';
import type { PurchaseRequest } from '../types';
import Spinner from './common/Spinner';

interface PurchasingProps {
    purchaseRequest: PurchaseRequest | null;
}

const Purchasing: React.FC<PurchasingProps> = ({ purchaseRequest }) => {
    const [quantity, setQuantity] = useState(100);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseRequest) return;

        setIsSubmitting(true);
        setMessage('');

        // Simulate API call to Coupa
        setTimeout(() => {
            setIsSubmitting(false);
            setMessage(`Solicitud de compra para ${quantity} unidades de ${purchaseRequest.sku} enviada a COUPA exitosamente.`);
        }, 1500);
    };

    if (!purchaseRequest) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-tec-gray mb-4">Módulo de Compras (Simulación COUPA)</h2>
                <p className="text-gray-500">No hay ninguna solicitud de compra activa. Por favor, inicie una desde la pantalla de Inventario (WMS) para un material sin stock.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-tec-gray mb-1">Nueva Solicitud de Compra</h2>
            <p className="text-sm text-gray-500 mb-6">Simulación de envío a COUPA</p>
            
            {!message ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU del Material</label>
                        <input type="text" id="sku" value={purchaseRequest.sku} readOnly className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="description" value={purchaseRequest.description} readOnly rows={3} className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                     <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad a Solicitar</label>
                        <input 
                            type="number" 
                            id="quantity" 
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))} 
                            min="1"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-tec-blue focus:border-tec-blue"
                        />
                    </div>
                    <div className="flex items-center justify-end">
                        <button type="submit" disabled={isSubmitting} className="bg-tec-blue text-white font-bold py-2 px-6 rounded-md hover:bg-blue-800 transition-colors disabled:bg-gray-400 flex items-center justify-center">
                            {isSubmitting ? <Spinner size="sm" /> : 'Enviar a COUPA'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-luxen-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-semibold text-tec-gray">{message}</p>
                </div>
            )}
        </div>
    );
};

export default Purchasing;