import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import {
  QrCode, Plus, Image, Trash2, Smartphone, Upload, X, Save, Pencil,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import { menuService } from '../../../services/menuService';

export default function DigitalMenuPage() {
  const { storeId } = useParams();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDish, setNewDish] = useState({ name: '', category_id: '', price: 0, description: '', available: true });

  useEffect(() => { loadData(); }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: d }, { data: c }] = await Promise.all([
        menuService.getDishes(storeId),
        menuService.getCategories(storeId),
      ]);
      setDishes(d || []);
      setCategories(c || []);
    } catch (e) {
      toast.error('Error al cargar menú');
    }
    setLoading(false);
  };

  const handleToggle = async (id, available) => {
    try {
      await menuService.toggleDishAvailability(id, !available);
      toast.success(available ? 'Platillo ocultado' : 'Platillo visible');
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await menuService.deleteDish(id);
      toast.success('Platillo eliminado');
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const handleCreate = async () => {
    try {
      await menuService.upsertDish({ ...newDish, restaurant_id: storeId });
      toast.success('Platillo creado');
      setShowNew(false);
      setNewDish({ name: '', category_id: '', price: 0, description: '', available: true });
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const grouped = {};
  categories.forEach((c) => { grouped[c.id] = { ...c, dishes: [] }; });
  dishes.forEach((d) => {
    const catId = d.category_id || '__uncategorized';
    if (!grouped[catId]) grouped[catId] = { id: catId, name: d.category?.name || 'Sin categoría', dishes: [] };
    grouped[catId].dishes.push(d);
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Menú Digital QR</h1>
          <p className="text-white/40 text-sm mt-1">{dishes.length} platillos · actualización en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowQR(true)} className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm text-white/60 hover:text-white">
            <QrCode size={16} /> QR
          </button>
          <button onClick={() => setPreviewMode(!previewMode)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all', previewMode ? 'bg-brand-500 text-white' : 'glass-card text-white/60 hover:text-white')}>
            <Smartphone size={16} /> {previewMode ? 'Editor' : 'Preview'}
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
            <Plus size={16} /> Platillo
          </button>
        </div>
      </div>

      {!previewMode ? (
        loading ? (
          <div className="text-center py-12 text-white/20">Cargando menú...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(grouped).map((cat) => (
              <div key={cat.id} className="space-y-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/30">{cat.name}</h3>
                {cat.dishes.map((dish) => (
                  <GlassCard key={dish.id} className={cn('p-4 flex gap-4', !dish.available && 'opacity-40')}>
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {dish.image_url ? (
                        <img src={dish.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Image size={20} className="text-white/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{dish.name}</h4>
                        <span className="font-mono text-sm font-bold text-brand-400 shrink-0 ml-2">{formatCurrency(dish.price)}</span>
                      </div>
                      <p className="text-xs text-white/30 line-clamp-2 mb-2">{dish.description}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(dish.id, dish.available)}
                          className={cn('text-[10px] px-2 py-0.5 rounded-full', dish.available ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30')}>
                          {dish.available ? 'Visible' : 'Oculto'}
                        </button>
                        <button onClick={() => handleDelete(dish.id)} className="p-1 text-white/20 hover:text-red-400 ml-auto">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex justify-center">
          <div className="w-[375px] h-[700px] bg-premium-card rounded-[3rem] border-4 border-white/[0.08] p-4 overflow-hidden shadow-2xl">
            <div className="h-full rounded-[2rem] bg-premium-dark p-5 overflow-y-auto space-y-5">
              <div className="text-center pt-6 pb-4">
                <h3 className="font-display font-bold text-lg">Menú Digital</h3>
                <p className="text-white/30 text-xs">Escanea y ordena</p>
              </div>
              {Object.values(grouped).map((cat) => (
                <div key={cat.id}>
                  <h4 className="text-xs uppercase tracking-widest text-white/30 mb-3 pb-1.5 border-b border-white/5">{cat.name}</h4>
                  <div className="space-y-3">
                    {cat.dishes.filter((d) => d.available).map((dish) => (
                      <div key={dish.id} className="flex justify-between items-start gap-3">
                        <div>
                          <p className="text-sm font-medium">{dish.name}</p>
                          <p className="text-[11px] text-white/30 leading-snug mt-0.5">{dish.description}</p>
                        </div>
                        <span className="text-sm font-mono text-brand-400 shrink-0">{formatCurrency(dish.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowQR(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-8 text-center max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 mb-4">
                <canvas
                  ref={(el) => { if (el) QRCode.toCanvas(el, `${window.location.origin}/menu/${storeId}`, { width: 160, margin: 1, color: { dark: '#000', light: '#fff' } }); }}
                  className="w-full h-full rounded-lg"
                />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Menú QR</h3>
              <p className="text-white/40 text-sm mb-4">Escanea para ver el menú actualizado</p>
              <div className="flex gap-2">
                <button onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL();
                    a.download = `menu-qr-${storeId}.png`;
                    a.click();
                    toast.success('QR descargado');
                  }
                }} className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-400 rounded-xl text-sm font-medium">Descargar</button>
                <button onClick={() => setShowQR(false)} className="flex-1 py-2.5 glass-card rounded-xl text-sm">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-96 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Nuevo Platillo</h3>
                <button onClick={() => setShowNew(false)} className="p-1 text-white/30 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <input value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} placeholder="Nombre del platillo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                <select value={newDish.category_id} onChange={(e) => setNewDish({ ...newDish, category_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                  <option value="">Categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: +e.target.value })} placeholder="Precio" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                <textarea value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} placeholder="Descripción" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none" />
                <button onClick={handleCreate} disabled={!newDish.name || !newDish.price} className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-30 rounded-xl text-sm font-medium">Crear Platillo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
