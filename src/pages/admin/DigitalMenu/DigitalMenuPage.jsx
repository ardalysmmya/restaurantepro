import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Plus, Image, Pencil, Trash2, Eye,
  Smartphone, Upload, Globe, Save, X,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';

const initialDishes = [
  { id: '1', name: 'Tartar de Atún', category: 'Entradas', price: 320, image: null, description: 'Atún fresco con aguacate y salsa ponzu', available: true },
  { id: '2', name: 'Risotto de Trufa Negra', category: 'Platos Fuertes', price: 480, image: null, description: 'Arroz cremoso con trufa negra italiana y parmesano', available: true },
  { id: '3', name: 'Salmón Real Glaseado', category: 'Platos Fuertes', price: 520, image: null, description: 'Salmón real con glaseado de miso y espárragos', available: true },
  { id: '4', name: 'Soufflé de Chocolate', category: 'Postres', price: 280, image: null, description: 'Chocolate belga 70% con helado de vainilla', available: true },
  { id: '5', name: 'Vieiras a la Parrilla', category: 'Entradas', price: 340, image: null, description: 'Vieiras frescas con puré de coliflor trufado', available: false },
];

const categories = ['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas', 'Chef\'s Special'];

export default function DigitalMenuPage() {
  const [dishes, setDishes] = useState(initialDishes);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const toggleAvailability = (id) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, available: !d.available } : d))
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Menú Digital QR</h1>
          <p className="text-white/40 text-sm mt-1">
            Actualiza tu menú y se refleja al instante en el celular de tus clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm text-white/60 hover:text-white transition-colors"
          >
            <QrCode size={16} /> QR del Menú
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all',
              previewMode
                ? 'bg-brand-500 text-white'
                : 'glass-card text-white/60 hover:text-white'
            )}
          >
            <Smartphone size={16} /> {previewMode ? 'Salir Preview' : 'Vista Móvil'}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
            <Plus size={16} /> Agregar Platillo
          </button>
        </div>
      </div>

      {!previewMode ? (
        <>
          {/* Dish Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const catDishes = dishes.filter((d) => d.category === cat);
              if (catDishes.length === 0) return null;

              return (
                <div key={cat} className="space-y-3">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/30">
                    {cat}
                  </h3>
                  {catDishes.map((dish, i) => (
                    <motion.div
                      key={dish.id}
                      variants={ANIMATION_VARIANTS.fadeUp}
                      transition={{ delay: i * 0.05 }}
                    >
                      <GlassCard className={cn(
                        'p-4 flex gap-4',
                        !dish.available && 'opacity-40'
                      )}>
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          {dish.image ? (
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Image size={20} className="text-white/10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{dish.name}</h4>
                            <span className="font-mono text-sm font-bold text-brand-400">
                              {formatCurrency(dish.price)}
                            </span>
                          </div>
                          <p className="text-xs text-white/30 line-clamp-2 mb-2">{dish.description}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleAvailability(dish.id)}
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full',
                                dish.available
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-white/5 text-white/30'
                              )}
                            >
                              {dish.available ? 'Visible' : 'Oculto'}
                            </button>
                            <button className="p-1 hover:text-white transition-colors">
                              <Upload size={12} className="text-white/30" />
                            </button>
                            <button className="p-1 hover:text-red-400 transition-colors ml-auto">
                              <Trash2 size={12} className="text-white/30 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Mobile Preview */
        <div className="flex justify-center">
          <div className="w-[375px] h-[700px] bg-premium-card rounded-[3rem] border-4 border-white/[0.08] p-4 overflow-hidden shadow-2xl">
            <div className="h-full rounded-[2rem] bg-premium-dark p-5 overflow-y-auto space-y-5">
              <div className="text-center pt-6 pb-4">
                <h3 className="font-display font-bold text-lg">La Maison</h3>
                <p className="text-white/30 text-xs">Menú Digital</p>
              </div>
              {categories.map((cat) => {
                const catDishes = dishes.filter((d) => d.category === cat && d.available);
                if (catDishes.length === 0) return null;
                return (
                  <div key={cat}>
                    <h4 className="text-xs uppercase tracking-widest text-white/30 mb-3 pb-1.5 border-b border-white/5">
                      {cat}
                    </h4>
                    <div className="space-y-3">
                      {catDishes.map((dish) => (
                        <div key={dish.id} className="flex justify-between items-start gap-3">
                          <div>
                            <p className="text-sm font-medium">{dish.name}</p>
                            <p className="text-[11px] text-white/30 leading-snug mt-0.5">{dish.description}</p>
                          </div>
                          <span className="text-sm font-mono text-brand-400 shrink-0">
                            {formatCurrency(dish.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 text-center max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 mb-4">
              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                <QrCode size={120} className="text-white" />
              </div>
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Menú Digital QR</h3>
            <p className="text-white/40 text-sm mb-4">
              Escanea este código para ver el menú actualizado en tiempo real.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-sm font-medium transition-colors">
                Descargar QR
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 py-2.5 rounded-xl glass-card text-sm text-white/40 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
