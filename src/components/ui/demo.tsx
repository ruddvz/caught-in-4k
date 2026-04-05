import * as React from 'react';

import { Auth } from '@/components/ui/auth-form-1';

export default function DemoMain() {
    return (
        <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-card/60 p-4'>
            <Auth />
        </div>
    );
}