import * as React from 'react';

import {
    Header,
    HeroContent,
    PulsingCircle,
    ShaderBackground,
} from './shaders-hero-section';

export default function ShaderHeroDemo() {
    return (
        <ShaderBackground>
            <Header />
            <HeroContent />
            <PulsingCircle />
        </ShaderBackground>
    );
}