import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Mensaje enviado. Nos pondremos en contacto pronto.');
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-padding pt-24">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 md:p-16"
        >
          <h1 className="font-display text-4xl font-bold mb-4">Contacto</h1>
          <p className="text-white/40 mb-10">Cuéntanos sobre tu restaurante y te mostraremos cómo podemos ayudarte.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text" placeholder="Nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
              <input
                type="email" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
            <textarea
              rows={5} placeholder="Mensaje" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors resize-none"
            />
            <button
              type="submit" disabled={sending}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-[0_0_32px_rgba(238,122,18,0.4)]"
            >
              {sending ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 grid md:grid-cols-3 gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-3"><Mail size={16} /> hola@restaurantepro.com</div>
            <div className="flex items-center gap-3"><Phone size={16} /> +52 55 0000 0000</div>
            <div className="flex items-center gap-3"><MapPin size={16} /> Ciudad de México</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
