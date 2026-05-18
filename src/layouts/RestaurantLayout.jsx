import { Outlet } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Instagram, MapPin, Clock, Phone } from 'lucide-react';

export default function RestaurantLayout() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen noise-bg relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      <nav className="fixed top-[2px] inset-x-0 z-40 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold">La Maison</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#menu" className="hover:text-white transition-colors">Menú</a>
            <a href="#experiencia" className="hover:text-white transition-colors">Experiencia</a>
            <a href="#reservar" className="hover:text-white transition-colors">Reservar</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="glass-card !rounded-none border-b-0 border-x-0 py-16 section-padding mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 text-white/50 text-sm">
          <div>
            <h4 className="font-display text-white text-lg mb-4">La Maison</h4>
            <p className="leading-relaxed">
              Alta cocina contemporánea en el corazón de la ciudad.
              Una experiencia gastronómica sin igual.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><MapPin size={16} /> Av. Gourmet 123, Ciudad</div>
            <div className="flex items-center gap-3"><Phone size={16} /> +52 55 1234 5678</div>
            <div className="flex items-center gap-3"><Clock size={16} /> Mar-Sáb: 13:00 - 23:00</div>
          </div>
          <div className="flex items-start gap-4">
            <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <span className="text-white/20">&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
