import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Star, Clock, Award, Wine, UtensilsCrossed, ChefHat } from 'lucide-react';
import Hero3D from '../../components/three/Hero3D';
import GlassCard from '../../components/ui/GlassCard';
import MagneticHover from '../../components/ui/MagneticHover';
import ScrollReveal from '../../components/animations/ScrollReveal';

gsap.registerPlugin(ScrollTrigger);

const menuCategories = [
  {
    title: 'Entradas',
    icon: Wine,
    items: ['Tartar de Atún con Aguacate', 'Carpaccio de Res Wagyu', 'Vieiras a la Parrilla'],
    span: 'md:row-span-2',
  },
  {
    title: 'Platos Fuertes',
    icon: UtensilsCrossed,
    items: ['Salmón Real Glaseado', 'Risotto de Trufa Negra', 'Cordero Confitado 12h'],
    span: 'md:col-span-2',
  },
  {
    title: "Chef's Special",
    icon: ChefHat,
    items: ['Menú Degustación 7 Tiempos', 'Maridaje Premium', 'Experiencia Omakase'],
    span: 'md:col-span-2',
  },
  {
    title: 'Postres',
    icon: Star,
    items: ['Soufflé de Chocolate', 'Crème Brûlée de Vainilla', 'Selección de Quesos'],
    span: '',
  },
  {
    title: 'Reservaciones',
    icon: Clock,
    items: ['Reserva tu mesa', 'Eventos privados', "Chef's Table"],
    span: 'md:row-span-2',
    highlight: true,
  },
];

export default function LandingPage() {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionsRef.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el.querySelectorAll('.gsap-reveal'),
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Hero3D />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-premium-dark/30 to-premium-dark pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card !rounded-full text-sm text-brand-400 mb-8">
              <Award size={14} /> Estrella Michelin 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-6"
          >
            <span className="text-gradient">Alta Cocina</span>
            <br />
            <span className="text-gradient-brand">Contemporánea</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Una experiencia sensorial donde cada plato cuenta una historia.
            Ingredientes de origen, técnicas de vanguardia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <a
              href="#reservar"
              className="group px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_32px_rgba(238,122,18,0.4)]"
            >
              Reservar Mesa
            </a>
            <a
              href="#menu"
              className="px-8 py-3.5 glass-card-hover !rounded-full text-white/70 hover:text-white font-medium transition-all"
            >
              Ver Menú
            </a>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Menu Section */}
      <section ref={(el) => (sectionsRef.current[0] = el)} id="menu" className="py-24 section-padding">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Nuestra <span className="text-gradient-brand">Carta</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Cada creación es una obra maestra diseñada por nuestro chef ejecutivo.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[200px] gap-4">
            {menuCategories.map((cat) => (
              <MagneticHover key={cat.title} className={`${cat.span} gsap-reveal`}>
                <GlassCard
                  className={`h-full p-6 flex flex-col justify-between cursor-default group ${
                    cat.highlight
                      ? '!bg-brand-500/10 !border-brand-500/20'
                      : ''
                  }`}
                  shimmer
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        cat.highlight ? 'bg-brand-500/20' : 'bg-white/5'
                      } group-hover:scale-110 transition-transform duration-500`}>
                        <cat.icon size={20} className={cat.highlight ? 'text-brand-400' : 'text-white/60'} />
                      </div>
                      <h3 className="font-display text-lg font-semibold">{cat.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {cat.items.map((item) => (
                        <li key={item} className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {cat.highlight && (
                    <a
                      href="#reservar"
                      className="inline-flex items-center gap-2 text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors mt-4"
                    >
                      Reservar ahora &rarr;
                    </a>
                  )}
                </GlassCard>
              </MagneticHover>
            ))}
          </div>
        </div>
      </section>

      {/* Experience / About Section */}
      <section ref={(el) => (sectionsRef.current[1] = el)} id="experiencia" className="py-24 section-padding relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              La <span className="text-gradient-brand">Experiencia</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Ambiente',
                desc: 'Diseño interior galardonado con iluminación escenográfica que transforma cada cena en un espectáculo.',
              },
              {
                title: 'Servicio',
                desc: 'Hospitalidad de clase mundial. Cada detalle está cuidado para que solo te preocupes por disfrutar.',
              },
              {
                title: 'Cocina Abierta',
                desc: 'Observa a nuestros chefs en acción a través de nuestra cocina abierta con tecnología de última generación.',
              },
            ].map((item, i) => (
              <MagneticHover key={item.title}>
                <GlassCard className="p-8 text-center group h-full gsap-reveal" shimmer>
                  <div className="text-4xl mb-6">0{i + 1}</div>
                  <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </MagneticHover>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section ref={(el) => (sectionsRef.current[2] = el)} id="reservar" className="py-24 section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-16 relative overflow-hidden shimmer-border">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Reserve su Mesa
              </h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto">
                Vive una experiencia gastronómica inolvidable. Las reservaciones se abren con 30 días de anticipación.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_32px_rgba(238,122,18,0.4)]"
              >
                Reservar Ahora
              </a>
            </ScrollReveal>
          </GlassCard>
        </div>
      </section>

      {/* Admin Access */}
      <section className="py-16 section-padding text-center">
        <a
          href="/?app=admin"
          className="inline-flex items-center gap-2 px-6 py-2.5 glass-card-hover !rounded-full text-sm text-white/30 hover:text-brand-400 transition-all duration-300"
        >
          Panel Admin · Multi-tienda
        </a>
      </section>
    </div>
  );
}
