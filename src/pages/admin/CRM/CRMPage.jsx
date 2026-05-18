import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Star, Heart, Cake, Gift, Plus, Filter,
  CalendarCheck, Mail, Phone, ChevronRight, Tag,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

const mockDiners = [
  { id: '1', name: 'Sofía García', visits: 12, lastVisit: '2026-05-14', favorite: 'Salmón Glaseado', allergies: ['Lácteos'], points: 2400, tier: 'gold' },
  { id: '2', name: 'Alejandro Ruiz', visits: 48, lastVisit: '2026-05-15', favorite: 'Cordero Confitado', allergies: [], points: 9600, tier: 'platinum' },
  { id: '3', name: 'María Fernández', visits: 3, lastVisit: '2026-04-28', favorite: 'Risotto de Trufa', allergies: ['Gluten'], points: 600, tier: 'silver' },
  { id: '4', name: 'Diego López', visits: 22, lastVisit: '2026-05-10', favorite: 'Tartar de Atún', allergies: ['Mariscos', 'Nueces'], points: 4400, tier: 'gold' },
  { id: '5', name: 'Valentina Torres', visits: 7, lastVisit: '2026-05-12', favorite: 'Soufflé de Chocolate', allergies: [], points: 1400, tier: 'silver' },
];

const tierConfig = {
  platinum: { label: 'Platino', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  gold: { label: 'Oro', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  silver: { label: 'Plata', color: 'text-white/40', bg: 'bg-white/5' },
};

export default function CRMPage() {
  const [diners] = useState(mockDiners);
  const [search, setSearch] = useState('');
  const [selectedDiner, setSelectedDiner] = useState(null);

  const filtered = diners.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">CRM & Fidelización</h1>
          <p className="text-white/40 text-sm mt-1">{diners.length} comensales registrados</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
          <Plus size={16} /> Agregar Comensal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diner List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar comensal..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm text-white/40 hover:text-white transition-colors">
              <Filter size={16} /> Filtrar
            </button>
          </div>

          <div className="space-y-2">
            {filtered.map((diner, i) => {
              const tier = tierConfig[diner.tier];
              return (
                <motion.div
                  key={diner.id}
                  variants={ANIMATION_VARIANTS.fadeUp}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard
                    className={cn(
                      'p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:border-white/20',
                      selectedDiner?.id === diner.id && 'border-brand-500/50 bg-brand-500/5'
                    )}
                    onClick={() => setSelectedDiner(selectedDiner?.id === diner.id ? null : diner)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-sm shrink-0">
                      {diner.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{diner.name}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', tier.color, tier.bg)}>
                          {tier.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/30">
                        {diner.visits} visitas · Última: {new Date(diner.lastVisit).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-brand-400">{diner.points.toLocaleString()} pts</p>
                    </div>
                    <ChevronRight size={16} className="text-white/10" />
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Diner Detail / Quick Stats */}
        <div className="space-y-4">
          {selectedDiner ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-2xl mb-4">
                  {selectedDiner.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <h3 className="font-display font-semibold text-lg">{selectedDiner.name}</h3>
                <p className="text-white/30 text-sm">
                  {selectedDiner.visits} visitas · Miembro desde 2024
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    <Star size={16} className="text-brand-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/30">Favorito</p>
                    <p className="text-xs font-medium mt-0.5">{selectedDiner.favorite}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <Gift size={16} className="text-brand-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/30">Puntos</p>
                    <p className="text-xs font-medium mt-0.5">{selectedDiner.points.toLocaleString()}</p>
                  </div>
                </div>

                {selectedDiner.allergies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <Heart size={12} className="text-red-400" />
                      <span className="text-white/40">Alergias: </span>
                      {selectedDiner.allergies.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-white/30 font-medium">
                  Cupones Disponibles
                </h4>
                <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-brand-400" />
                    <div>
                      <p className="text-sm">15% descuento</p>
                      <p className="text-[10px] text-white/30">Próx. visita · Expira 30 jun</p>
                    </div>
                  </div>
                  <button className="text-xs px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors">
                    Enviar
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cake size={14} className="text-white/40" />
                    <div>
                      <p className="text-sm text-white/40">Postre gratis</p>
                      <p className="text-[10px] text-white/30">Cumpleaños · Ago 15</p>
                    </div>
                  </div>
                  <button className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                    Programar
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-6 flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Users size={32} className="text-white/10 mx-auto" />
                <p className="text-sm text-white/20">
                  Selecciona un comensal para ver su perfil
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
