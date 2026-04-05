import NumberFlow from '@number-flow/react';
import React from 'react';
import { cn } from '@/lib/utils';

export interface PricingInteractionProps {
    selectedPlanId?: string;
    onSelectPlan?: (planId: string) => void;
}

export function PricingInteraction({ selectedPlanId, onSelectPlan }: PricingInteractionProps) {
    const isMaxTier = selectedPlanId?.includes('-max') || false;
    const tierIndex = isMaxTier ? 1 : 0;

    const handleChangeTier = (index: number) => {
        if (!onSelectPlan) return;
        const isNewMaxTier = index === 1;
        const base = selectedPlanId ? selectedPlanId.replace('-max', '') : '3mo';
        onSelectPlan(isNewMaxTier ? `${base}-max` : base);
    };

    const activePlanIndex = selectedPlanId?.startsWith('1mo') ? 0 :
        selectedPlanId?.startsWith('6mo') ? 2 : 1;

    const handleChangePlan = (index: number) => {
        if (!onSelectPlan) return;
        const isMax = tierIndex === 1;
        let base = '3mo';
        if (index === 0) base = '1mo';
        if (index === 2) base = '6mo';
        onSelectPlan(isMax ? `${base}-max` : base);
    };

    const proPrices = { '1mo': 4.99, '3mo': 13.49, '6mo': 24.99 };
    const maxPrices = { '1mo': 8.99, '3mo': 24.99, '6mo': 44.99 };

    const currentPrices = isMaxTier ? maxPrices : proPrices;

    return (
        <div className="border-2 rounded-[32px] p-3 shadow-md max-w-sm w-full flex flex-col items-center gap-3 bg-white mx-auto my-6 text-black">
            <div className="rounded-full relative w-full bg-slate-100 p-1.5 flex items-center">
                <button
                    className="font-semibold rounded-full w-full p-2 text-slate-800 z-20 text-[15px]"
                    onClick={() => handleChangeTier(0)}
                >
                    Pro (2 Devices)
                </button>
                <button
                    className="font-semibold rounded-full w-full p-2 text-slate-800 z-20 text-[15px]"
                    onClick={() => handleChangeTier(1)}
                >
                    Max (4 Devices)
                </button>
                <div
                    className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10"
                    style={{
                        transform: `translateX(${tierIndex * 100}%)`,
                        transition: 'transform 0.3s',
                    }}
                >
                    <div className="bg-white shadow-sm rounded-full w-full h-full"></div>
                </div>
            </div>

            <div className="w-full relative flex flex-col items-center justify-center gap-3 mt-1">
                {/* 30 Days */}
                <div
                    className="w-full flex justify-between items-center cursor-pointer border-[2px] border-slate-200 hover:border-slate-300 p-5 rounded-2xl relative z-10 bg-transparent transition-all"
                    onClick={() => handleChangePlan(0)}
                >
                    <div className="flex flex-col items-start gap-1">
                        <p className="font-bold text-[1.3rem] text-slate-900 leading-none">30 Days</p>
                        <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                            <span className="text-black font-extrabold flex items-center text-[1.1rem]">
                                $<NumberFlow value={currentPrices['1mo']} />
                            </span>
                            / 30 days
                        </p>
                    </div>
                    {/* Circle Check */}
                    <div
                        className={cn('border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center transition-colors duration-300',
                            activePlanIndex === 0 ? 'border-slate-900' : 'border-slate-300')}
                    >
                        <div
                            className={cn('size-[10px] bg-slate-900 rounded-full transition-opacity duration-300', activePlanIndex === 0 ? 'opacity-100' : 'opacity-0')}
                        ></div>
                    </div>
                </div>

                {/* 90 Days */}
                <div
                    className="w-full flex justify-between items-center cursor-pointer border-[2px] border-slate-200 hover:border-slate-300 p-5 rounded-2xl relative z-10 bg-transparent transition-all"
                    onClick={() => handleChangePlan(1)}
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="font-bold text-[1.3rem] flex items-center gap-2 text-slate-900 leading-none">
                            90 Days
                            <span className="py-1 px-2.5 rounded-lg bg-yellow-100 text-yellow-900 text-xs font-bold uppercase tracking-wider relative -top-[1px]">
                                Popular
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                            <span className="text-black font-extrabold flex items-center text-[1.1rem]">
                                $<NumberFlow value={currentPrices['3mo']} />
                            </span>
                            / 90 days
                        </p>
                    </div>
                    {/* Circle Check */}
                    <div
                        className={cn('border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center transition-colors duration-300',
                            activePlanIndex === 1 ? 'border-slate-900' : 'border-slate-300')}
                    >
                        <div
                            className={cn('size-[10px] bg-slate-900 rounded-full transition-opacity duration-300', activePlanIndex === 1 ? 'opacity-100' : 'opacity-0')}
                        ></div>
                    </div>
                </div>

                {/* 180 Days */}
                <div
                    className="w-full flex justify-between items-center cursor-pointer border-[2px] border-slate-200 hover:border-slate-300 p-5 rounded-2xl relative z-10 bg-transparent transition-all"
                    onClick={() => handleChangePlan(2)}
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="font-bold text-[1.3rem] flex items-center gap-2 text-slate-900 leading-none">
                            180 Days
                            <span className="py-1 px-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider relative -top-[1px]">
                                Best Value
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                            <span className="text-black font-extrabold flex items-center text-[1.1rem]">
                                $<NumberFlow value={currentPrices['6mo']} />
                            </span>
                            / 180 days
                        </p>
                    </div>
                    {/* Circle Check */}
                    <div
                        className={cn('border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center transition-colors duration-300',
                            activePlanIndex === 2 ? 'border-slate-900' : 'border-slate-300')}
                    >
                        <div
                            className={cn('size-[10px] bg-slate-900 rounded-full transition-opacity duration-300', activePlanIndex === 2 ? 'opacity-100' : 'opacity-0')}
                        ></div>
                    </div>
                </div>

                <div
                    className="w-full absolute top-0 border-[3px] border-slate-900 rounded-[18px] z-0 pointer-events-none transition-transform duration-300"
                    // The height of a single plan card is exactly 1/3 of the container minus the gap (12px * 2)/3 = 8px
                    // Instead of math, we can just use 88px as height maybe? Let's use 100% / 3 minus space
                    style={{
                        height: 'calc((100% - 24px) / 3)',
                        transform: `translateY(calc(${activePlanIndex * 100}% + ${activePlanIndex * 12}px))`,
                    }}
                ></div>
            </div>
        </div>
    );
}
