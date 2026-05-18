import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users, Search, Star, Heart, Cake, Gift, Plus,
  Mail, Phone, Tag, X, Save, UserPlus, ChevronRight,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import { crmService } from '../../../services/crmService';
import { calculateTier, pointsToNextTier } from '../../../lib/loyalty-engine';

const tierConfig = {
  diamond: { label: 'Diamante', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  platinum: { label: 'Platino', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  gold: { label: 'Oro', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  silver: { label: 'Plata', color: 'text-slate-300', bg: 'bg-slate-500/10' },
  bronze: { label: 'Bronce', color: 'text-amber-600', bg: 'bg-amber-500/10' },
};

export default function CRMPage() {
  const { storeId } = useParams();
  const [diners, setDiners] = useState([]);
  const [selectedDiner, setSelectedDiner] = useState(null);
  const [search, setSearch] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showNewDiner, setShowNewDiner] = useState(false);
  const [newDiner, setNewDiner] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: d }, { data: c }] = await Promise.all([
        crmService.getDiners(storeId),
        crmService.getCampaigns(storeId),
      ]);
      setDiners(d || []);
      setCampaigns(c || []);
    } catch (e) {
      toast.error('Error al cargar datos');
    }
    setLoading(false);
  };

  const handleSelectDiner = async (diner) => {
    try {
      const { data } = await crmService.getDinerById(diner.id);
      setSelectedDiner(data);
    } catch (e) {
      setSelectedDiner(diner);
    }
  };

  const handleCreateDiner = async () => {
    try {
      await crmService.upsertDiner({ ...newDiner, restaurant_id: storeId });
      toast.success('Comensal registrado');
      setShowNewDiner(false);
      setNewDiner({ name: '', email: '', phone: '', notes: '' });
      loadData();
    } catch (e) {
      toast.error('Error al crear');
    }
  };

  const handleToggleCampaign = async (id, active) => {
    try {
      await crmService.toggleCampaign(id, !active);
      toast.success(active ? 'Campaña desactivada' : 'Campaña activada');
      loadData();
    } catch (e) {
      toast.error('Error');
    }
  };

  const filtered = diners.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">CRM & Fidelización</h1>
          <p className="text-white/40 text-sm mt-1">{diners.length} comensales</p>
        </div>
        <button
          onClick={() => setShowNewDiner(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all"
        >
          <UserPlus size={16} /> Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar comensal..."
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/20">Cargando...</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((diner, i) => {
                const tier = calculateTier(diner.loyalty?.points || 0);
                return (
                  <motion.div key={diner.id} variants={ANIMATION_VARIANTS.fadeUp} transition={{ delay: i * 0.03 }}>
                    <GlassCard
                      className={cn(
                        'p-4 flex items-center gap-4 cursor-pointer transition-all hover:border-white/20',
                        selectedDiner?.id === diner.id && 'border-brand-500/50 bg-brand-500/5'
                      )}
                      onClick={() => handleSelectDiner(diner)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-sm shrink-0">
                        {diner.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{diner.name}</span>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', tier.color, tier.bg)}>
                            {tier.name}
                          </span>
                        </div>
                        <p className="text-xs text-white/30">
                          {diner.visit_count || 0} visitas · {diner.loyalty?.points || 0} pts
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-white/10" />
                    </GlassCard>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Users size={32} className="text-white/10 mx-auto" />
                  <p className="text-white/20 text-sm">Sin resultados</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedDiner ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-2xl mb-4">
                  {selectedDiner.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="font-display font-semibold text-lg">{selectedDiner.name}</h3>
                <p className="text-white/30 text-sm">{selectedDiner.visit_count || 0} visitas</p>
                {selectedDiner.email && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-xs text-white/30">
                    <Mail size={12} /> {selectedDiner.email}
                  </div>
                )}
                {selectedDiner.phone && (
                  <div className="flex items-center justify-center gap-2 mt-1 text-xs text-white/30">
                    <Phone size={12} /> {selectedDiner.phone}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    <Star size={16} className="text-brand-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/30">Puntos</p>
                    <p className="text-sm font-bold mt-0.5">{selectedDiner.loyalty?.points || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <Gift size={16} className="text-brand-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/30">Tier</p>
                    <p className="text-sm font-bold mt-0.5">{calculateTier(selectedDiner.loyalty?.points || 0).name}</p>
                  </div>
                </div>

                {selectedDiner.allergies?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs flex-wrap">
                    <Heart size={12} className="text-red-400" />
                    {selectedDiner.allergies.map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px]">{a}</span>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-white/30">Campañas Activas</h4>
                {campaigns.filter((c) => c.active).length === 0 ? (
                  <p className="text-white/20 text-xs py-4 text-center">Sin campañas</p>
                ) : (
                  campaigns.filter((c) => c.active).slice(0, 3).map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-brand-400" />
                        <div>
                          <p className="text-sm">{c.name}</p>
                          <p className="text-[10px] text-white/30">{c.type} · {c.value}%</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleCampaign(c.id, c.active)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 hover:text-white"
                      >
                        Desactivar
                      </button>
                    </div>
                  ))
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-6 flex items-center justify-center h-64 text-center">
              <div className="space-y-3">
                <Users size={32} className="text-white/10 mx-auto" />
                <p className="text-white/20 text-sm">Selecciona un comensal</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewDiner && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowNewDiner(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Nuevo Comensal</h3>
                <button onClick={() => setShowNewDiner(false)} className="p-1 text-white/30 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <input
                  value={newDiner.name}
                  onChange={(e) => setNewDiner({ ...newDiner, name: e.target.value })}
                  placeholder="Nombre"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50"
                />
                <input
                  value={newDiner.email}
                  onChange={(e) => setNewDiner({ ...newDiner, email: e.target.value })}
                  placeholder="Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50"
                />
                <input
                  value={newDiner.phone}
                  onChange={(e) => setNewDiner({ ...newDiner, phone: e.target.value })}
                  placeholder="Teléfono"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50"
                />
                <button
                  onClick={handleCreateDiner}
                  disabled={!newDiner.name}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-30 rounded-xl text-sm font-medium transition-all"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
