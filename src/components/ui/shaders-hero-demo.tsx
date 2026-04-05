import * as React from 'react';

import {
    Header,
    HeroContent,
    PulsingCircle,
    ShaderBackground,
} from '@/components/ui/shaders-hero-section';

export default function ShaderHeroDemo() {
    return (
        <ShaderBackground>
            <Header />
            <HeroContent />
            <PulsingCircle />
        </ShaderBackground>
    );
}