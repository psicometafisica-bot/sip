
import React, { useState } from 'react';
import type { Material, View } from '../types';

interface InventoryProps {
    inventory: Material[];
    onPurchaseRequest: (material: Material) => void;
    setActiveView: (view: View) => void;
}

const DecisionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGoToMatrix: () => void;
    onProceedToPurchase: () => void;
    material: Material | null;
}> = ({ isOpen, onClose, onGoToMatrix, onProceedToPurchase, material }) => {
    if (!isOpen || !material) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg text-center" onClick={(e) => e.stopPropagation()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-luxen-yellow mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="text-xl font-bold text-tec-gray mb-2">¡Atención!</h3>
                <p className="text-gray-600 mb-4">
                    Está a punto de crear una solicitud de compra para el material <strong className="text-tec-gray">{material.sku}</strong>.
                </p>
                <p className="mb-6 bg-yellow-50 p-3 rounded-md">
                    Antes de continuar, le recomendamos verificar si existen <strong>materiales sustitutos</strong> disponibles en el inventario. Esto puede optimizar costos y agilizar el abastecimiento.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onGoToMatrix} className="bg-tec-blue text-white font-bold py-2 px-6 rounded-md hover:bg-blue-800 transition-colors">
                        Ir a Matriz de Sustitutos
                    </button>
                    <button onClick={onProceedToPurchase} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-700 transition-colors">
                        Continuar a Solicitud de Compra
                    </button>
                </div>
            </div>
        </div>
    );
};


const Inventory: React.FC<InventoryProps> = ({ inventory, onPurchaseRequest, setActiveView }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

    const handlePurchaseClick = (material: Material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMaterial(null);
    };

    const handleGoToMatrix = () => {
        setActiveView('matrix');
        handleCloseModal();
    };

    const handleProceedToPurchase = () => {
        if (selectedMaterial) {
            onPurchaseRequest(selectedMaterial);
        }
        handleCloseModal();
    };

    const getRowClass = (stock: number) => {
        if (stock === 0) return 'bg-red-100 hover:bg-red-200';
        if (stock > 0 && stock <= 10) return 'bg-yellow-100 hover:bg-yellow-200';
        return 'bg-white hover:bg-gray-50';
    };

    const getButtonForStock = (material: Material) => {
        const baseClasses = "font-bold py-1 px-3 rounded-md transition-colors text-white text-xs sm:text-sm";
        if (material.stock === 0) {
            return (
                <button onClick={() => handlePurchaseClick(material)} className={`${baseClasses} bg-luxen-red hover:bg-red-700`}>
                    Crear Solicitud de Compra
                </button>
            );
        }
        if (material.stock > 0 && material.stock <= 10) {
            return (
                <button onClick={() => handlePurchaseClick(material)} className={`${baseClasses} bg-orange-500 hover:bg-orange-600`}>
                    Crear Solicitud de Compra
                </button>
            );
        }
        return (
            <button onClick={() => handlePurchaseClick(material)} className={`${baseClasses} bg-tec-green hover:bg-opacity-80`}>
                Crear Solicitud de Compra
            </button>
        );
    };

    return (
        <>
            <DecisionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onGoToMatrix={handleGoToMatrix}
                onProceedToPurchase={handleProceedToPurchase}
                material={selectedMaterial}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-tec-gray mb-4">Inventario de Almacén (Simulación WMS)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inventory.map((material) => (
                                <tr key={material.sku} className={getRowClass(material.stock)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{material.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getButtonForStock(material)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center"><span className="h-4 w-4 bg-red-100 border border-red-300 rounded-sm mr-2"></span> Sin Stock</div>
                    <div className="flex items-center"><span className="h-4 w-4 bg-yellow-100 border border-yellow-300 rounded-sm mr-2"></span> Stock Bajo</div>
                    <div className="flex items-center"><span className="h-4 w-4 bg-white border border-gray-300 rounded-sm mr-2"></span> Stock Saludable</div>
                </div>
            </div>
        </>
    );
};

export default Inventory;