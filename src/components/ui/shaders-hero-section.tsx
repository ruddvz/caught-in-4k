import * as React from 'react';
import { ArrowUpRight, Clapperboard, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { MeshGradient, PulsingBorder } from '@paper-design/shaders-react';

import useTranslate from 'stremio/common/useTranslate';

interface ShaderBackgroundProps {
    children: React.ReactNode;
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = React.useState(false);

    React.useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return undefined;
        }

        const handleMouseEnter = () => setIsActive(true);
        const handleMouseLeave = () => setIsActive(false);

        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={containerRef} className='relative min-h-[100dvh] w-full overflow-hidden bg-black'>
            <MeshGradient
                className='absolute inset-0 h-full w-full'
                colors={['#000000', '#8b4513', '#ffffff', '#3e2723', '#5d4037']}
                speed={isActive ? 0.4 : 0.3}
                backgroundColor='#000000'
            />
            <MeshGradient
                className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${isActive ? 'opacity-80' : 'opacity-60'}`}
                colors={['#000000', '#ffffff', '#8b4513', '#000000']}
                speed={isActive ? 0.25 : 0.2}
                wireframe={true}
                backgroundColor='transparent'
            />

            {children}
        </div>
    );
}

export function PulsingCircle() {
    const t = useTranslate();
    const baseId = React.useId();
    const circlePathId = React.useMemo(
        () => `shader-circle-${baseId.replace(/:/g, '')}`,
        [baseId]
    );

    return (
        <div className='absolute bottom-[max(1.5rem,_env(safe-area-inset-bottom))] right-[max(1.5rem,_env(safe-area-inset-right))] z-30 hidden sm:block md:right-8'>
            <div className='relative flex h-20 w-20 items-center justify-center'>
                <PulsingBorder
                    colors={['#beecff', '#e77edc', '#ff4c3e', '#00ff88', '#ffd700', '#ff6b35', '#8a2be2']}
                    colorBack='#00000000'
                    speed={1.5}
                    roundness={1}
                    thickness={0.1}
                    softness={0.2}
                    intensity={5}
                    spotsPerColor={5}
                    spotSize={0.1}
                    pulse={0.1}
                    smoke={0.5}
                    smokeSize={4}
                    scale={0.65}
                    rotation={0}
                    frame={9161408.251009725}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                    }}
                />

                <motion.svg
                    className='absolute inset-0 h-full w-full scale-[1.6]'
                    viewBox='0 0 100 100'
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                    }}
                >
                    <defs>
                        <path id={circlePathId} d='M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0' />
                    </defs>
                    <text className='fill-white/80 text-[0.6rem] uppercase tracking-[0.2em]'>
                        <textPath href={`#${circlePathId}`} startOffset='0%'>
                            {t.string('SHADER_HERO_ROTATING_TEXT')}
                        </textPath>
                    </text>
                </motion.svg>
            </div>
        </div>
    );
}

export function HeroContent() {
    const t = useTranslate();

    return (
        <main className='absolute bottom-[max(1.5rem,_env(safe-area-inset-bottom))] left-[max(1.5rem,_env(safe-area-inset-left))] right-[max(1.5rem,_env(safe-area-inset-right))] z-20 max-w-xl md:bottom-8 md:left-8 md:right-auto md:max-w-lg'>
            <div className='text-left'>
                <div className='relative mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm'>
                    <div className='absolute left-1 right-1 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                    <Sparkles className='relative z-10 h-3.5 w-3.5 text-white/90' />
                    <span className='relative z-10 text-xs font-light text-white/90'>
                        {t.string('SHADER_HERO_BADGE')}
                    </span>
                </div>

                <h1 className='mb-4 text-5xl font-light tracking-tight text-white md:text-6xl md:leading-[4rem]'>
                    <span className='mr-2 font-medium italic'>{t.string('SHADER_HERO_TITLE_LEAD')}</span>
                    {t.string('SHADER_HERO_TITLE_MIDDLE')}
                    <br />
                    <span className='font-light tracking-tight text-white'>
                        {t.string('SHADER_HERO_TITLE_END')}
                    </span>
                </h1>

                <p className='mb-4 text-xs font-light leading-relaxed text-white/70'>
                    {t.string('SHADER_HERO_DESCRIPTION')}
                </p>

                <div className='flex flex-wrap items-center gap-4'>
                    <a
                        href='#/subscribe'
                        className='cursor-pointer rounded-full border border-white/30 bg-transparent px-8 py-3 text-xs font-normal text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10'
                    >
                        {t.string('SHADER_HERO_PRICING')}
                    </a>
                    <a
                        href='#/intro'
                        className='cursor-pointer rounded-full bg-white px-8 py-3 text-xs font-normal text-black transition-all duration-200 hover:bg-white/90'
                    >
                        {t.string('SHADER_HERO_GET_STARTED')}
                    </a>
                </div>
            </div>
        </main>
    );
}

export function Header() {
    const t = useTranslate();

    return (
        <header className='relative z-20 flex flex-col gap-4 px-6 pb-0 pt-[max(1.5rem,_env(safe-area-inset-top))] md:flex-row md:items-center md:justify-between md:p-6'>
            <div className='flex items-center gap-3 text-white'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm'>
                    <Clapperboard className='h-5 w-5' />
                </div>
                <div>
                    <div className='text-sm font-medium tracking-[0.3em] text-white/90'>
                        {t.string('SHADER_HERO_BRAND')}
                    </div>
                    <div className='text-[0.65rem] uppercase tracking-[0.24em] text-white/50'>
                        {t.string('SHADER_HERO_PREVIEW')}
                    </div>
                </div>
            </div>

            <nav className='flex flex-wrap items-center gap-2'>
                <a
                    href='#/discover'
                    className='rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white'
                >
                    {t.string('SHADER_HERO_FEATURES')}
                </a>
                <a
                    href='#/subscribe'
                    className='rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white'
                >
                    {t.string('SHADER_HERO_PRICING')}
                </a>
                <a
                    href='#/settings'
                    className='rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white'
                >
                    {t.string('SHADER_HERO_SETTINGS')}
                </a>
            </nav>

            <div id='gooey-btn' className='group relative flex items-center self-start md:self-auto'>
                <a
                    href='#/discover'
                    className='absolute right-0 flex h-8 -translate-x-10 cursor-pointer items-center justify-center rounded-full bg-white px-2.5 py-2 text-black transition-all duration-300 hover:bg-white/90 group-hover:-translate-x-[4.75rem]'
                    aria-label={t.string('SHADER_HERO_DISCOVER_ARIA')}
                >
                    <ArrowUpRight className='h-3 w-3' />
                </a>
                <a
                    href='#/intro'
                    className='relative z-10 flex h-8 cursor-pointer items-center rounded-full bg-white px-6 py-2 text-xs font-normal text-black transition-all duration-300 hover:bg-white/90'
                >
                    {t.string('SHADER_HERO_LOGIN')}
                </a>
            </div>
        </header>
    );
}