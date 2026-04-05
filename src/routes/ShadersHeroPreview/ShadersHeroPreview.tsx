import * as React from 'react';

const ShaderHeroDemo = React.lazy(() => import('stremio/components/ui/shaders-hero-demo'));

function ShadersHeroPreview() {
    return (
        <React.Suspense fallback={<div className='min-h-[100dvh] w-full bg-black' />}>
            <ShaderHeroDemo />
        </React.Suspense>
    );
}

export default ShadersHeroPreview;