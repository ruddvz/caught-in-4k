/**
 * Canon Takes Background Queue Hook
 * Connects React components to the global C4K Background Agent
 */

import { useEffect } from 'react';
import { c4kAgents } from '../BackgroundAgents/C4KBackgroundAgents';

export const useCanonTakesQueue = (metaRows = []) => {
    useEffect(() => {
        const items = [];
        metaRows.forEach((row) => {
            const content = row.content?.content || [];
            items.push(...content);
        });

        if (items.length > 0) {
            c4kAgents.queueForCanonTake(items);
            c4kAgents.processSatisfactionMetrics(items);
        }
    }, [metaRows]);
};

export default useCanonTakesQueue;
