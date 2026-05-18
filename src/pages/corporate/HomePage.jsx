import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    icon: Star,
    title: 'Menú Digital QR',
    desc: 'Cartas interactivas que tus comensales escanean desde la mesa. Actualización en tiempo real sin reimprimir.',
  },
  {
    icon: TrendingUp,
    title: 'Ingeniería de Menú',
    desc: 'Control total de costos por receta. Descubre tu plato estrella y elimina los que te hacen perder dinero.',
  },
  {
    icon: Shield,
    title: 'CRM Gastronómico',
    desc: 'Conoce a tus comensales: alergias, favoritos, frecuencia de visita. Hazlos volver con cupones inteligentes.',
  },
];

export default function HomePage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={ref}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            y: bgY,
            backgroundImage:
              'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(238,122,18,0.12), transparent 70%)',
          }}
        />

        <motion.div
          style={{ opacity }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-400/5 rounded-full blur-[100px]" />
        </motion.div>

        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-block px-4 py-1.5 glass-card !rounded-full text-sm text-brand-400 mb-8">
              Software para Restaurantes de Alta Gama
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6"
          >
            <span className="text-gradient">El Futuro de la</span>
            <br />
            <span className="text-gradient-brand">Gastronomía Digital</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Potencia tu restaurante con IA, menús digitales QR, ingeniería de costos
            y un CRM que convierte comensales en clientes frecuentes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <a
              href="#demo"
              className="group px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_32px_rgba(238,122,18,0.4)] flex items-center gap-2"
            >
              Solicitar Demo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#precios"
              className="px-8 py-3.5 glass-card-hover !rounded-full text-white/70 hover:text-white font-medium transition-all"
            >
              Ver Precios
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="producto" className="py-24 section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Todo lo que necesitas en{' '}
            <span className="text-gradient-brand">un solo lugar</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card-hover p-8 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={24} className="text-brand-400" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center glass-card p-16 relative overflow-hidden shimmer-border"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para transformar tu restaurante?
          </h2>
          <p className="text-white/40 mb-8 max-w-xl mx-auto">
            Únete a más de 500 restaurantes premium que ya confían en nosotros.
          </p>
          <a
            href={`https://app.${window.location.hostname}`}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_32px_rgba(238,122,18,0.4)]"
          >
            Comenzar Ahora
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
