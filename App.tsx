
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SubstitutionMatrix from './components/SubstitutionMatrix';
import SuggestionManager from './components/SuggestionManager';
import Alerts from './components/Alerts';
import Reports from './components/Reports';
import Inventory from './components/Inventory';
import Purchasing from './components/Purchasing';
import Catalog from './components/Catalog';
import Spinner from './components/common/Spinner';
import { generateInitialInventory } from './services/geminiService';
import type { View, Material, PurchaseRequest, Suggestion } from './types';

const initialSuggestions: Suggestion[] = [
    { id: 1, originalSku: 'TEC000015', substituteSku: 'TEC000001', justification: 'Misma función, pero el TEC000001 está sobreeestocado.', status: 'Aprobado', submittedBy: 'A. Rodriguez'},
    { id: 2, originalSku: 'TEC000011', substituteSku: 'TEC000018', justification: 'Versión genérica no superó las pruebas de estrés.', status: 'Rechazado', submittedBy: 'J. Pesoa'},
    { id: 3, originalSku: 'TEC000004', substituteSku: 'TEC000009', justification: 'Material con mejor rendimiento en pruebas de campo.', status: 'Pendiente de Validación en Sphera', submittedBy: 'C. Jordan'},
];


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [inventory, setInventory] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const initialInventory = await generateInitialInventory();
        setInventory(initialInventory);
        setError(null);
      } catch (err) {
        setError('Error fatal al cargar el inventario inicial. La simulación no puede continuar.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, []);

  const updateStock = (sku: string, quantityToDecrement: number) => {
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.sku === sku
          ? { ...item, stock: Math.max(0, item.stock - quantityToDecrement) }
          : item
      )
    );
  };
  
  const navigateToPurchaseOrder = (material: Material) => {
    setPurchaseRequest({ sku: material.sku, description: material.description });
    setActiveView('purchasing');
  };

  const addSuggestion = (newSuggestion: Omit<Suggestion, 'id' | 'status' | 'submittedBy'>) => {
    const suggestion: Suggestion = {
        ...newSuggestion,
        id: suggestions.length + 1,
        status: 'Pendiente de Validación en Sphera',
        submittedBy: 'Usuario Actual'
    };
    setSuggestions([suggestion, ...suggestions]);
  };

  const updateSuggestionAndMaterialStatus = (skuToApprove: string) => {
     // Update material status in inventory
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.sku === skuToApprove ? { ...item, complianceStatus: 'Validado' } : item
      )
    );
    // Update status of related suggestions
    setSuggestions(prevSuggestions =>
      prevSuggestions.map(s =>
        (s.substituteSku === skuToApprove || s.originalSku === skuToApprove) && s.status === 'Pendiente de Validación en Sphera'
          ? { ...s, status: 'Aprobado' }
          : s
      )
    );
  };


  const renderContent = () => {
    if (loading) {
      return <div className="flex flex-col justify-center items-center h-64"><Spinner size="lg" /><p className="mt-4 font-semibold text-tec-gray">Cargando simulación de inventario...</p></div>;
    }
    if (error) {
      return <div className="text-center text-luxen-red p-4 bg-red-100 rounded-md">{error}</div>;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'matrix':
        return <SubstitutionMatrix inventory={inventory} updateStock={updateStock} />;
      case 'inventory':
        return <Inventory 
                    inventory={inventory} 
                    onPurchaseRequest={navigateToPurchaseOrder}
                    setActiveView={setActiveView} 
                />;
      case 'purchasing':
        return <Purchasing purchaseRequest={purchaseRequest} />;
      case 'suggestions':
        return <SuggestionManager 
                    suggestions={suggestions} 
                    addSuggestion={addSuggestion}
                    setActiveView={setActiveView}
                />;
      case 'catalog':
          return <Catalog 
                      inventory={inventory} 
                      onApproveMaterial={updateSuggestionAndMaterialStatus} 
                  />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-tec-light-gray text-tec-gray">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;