/**
 * Canon Takes Background Queue Hook
 * Connects React components to the global C4K Background Agent
 */

const { useEffect } = require('react');
const { c4kAgents } = require('../BackgroundAgents/C4KBackgroundAgents');

const useCanonTakesQueue = (metaRows = []) => {
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

module.exports = useCanonTakesQueue;
