/**
 * Canon Takes Background Queue
 * Batch-processes Gemini summaries for all meta items in background
 * Throttled to avoid API rate limits (3-5 requests/min recommended)
 */

import { useEffect, useRef } from 'react';
import { useCanonTakes } from '../../common/useCanonTakes';

const BATCH_SIZE = 3; // Process 3 at a time
const BATCH_DELAY = 15000; // 15 seconds between batches (4/min = safe rate)

export const useCanonTakesQueue = (metaRows = []) => {
  const { fetchCanonTake, isCached } = useCanonTakes();
  const processedRef = useRef(new Set());
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Collect all uncached meta items
    const uncachedItems = [];

    metaRows.forEach((row) => {
      const items = row.content?.content || [];
      items.forEach((item) => {
        const id = `${item.name}_${item.releaseInfo || 'unknown'}`;

        // Skip if already processed or cached
        if (processedRef.current.has(id) || isCached(item.name, item.releaseInfo)) {
          return;
        }

        uncachedItems.push({
          id,
          title: item.name,
          year: item.releaseInfo,
          genres: item.genre || 'unknown',
          voteAverage: item.vote_average || 0,
        });
      });
    });

    if (uncachedItems.length === 0) {
      return;
    }

    // Process in batches
    const processBatch = async (batch) => {
      for (const item of batch) {
        try {
          await fetchCanonTake(item.title, item.year, item.genres, item.voteAverage);
          processedRef.current.add(item.id);
        } catch (error) {
          console.error('Queue processing error:', error);
        }
      }
    };

    const scheduleBatches = () => {
      let batchIndex = 0;

      const processNext = () => {
        const batch = uncachedItems.slice(
          batchIndex * BATCH_SIZE,
          (batchIndex + 1) * BATCH_SIZE
        );

        if (batch.length === 0) {
          return;
        }

        processBatch(batch);
        batchIndex += 1;

        // Schedule next batch
        if (batchIndex * BATCH_SIZE < uncachedItems.length) {
          timeoutRef.current = setTimeout(processNext, BATCH_DELAY);
        }
      };

      processNext();
    };

    // Debounce: wait 1 second before starting queue
    timeoutRef.current = setTimeout(scheduleBatches, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [metaRows, fetchCanonTake, isCached]);
};

export default useCanonTakesQueue;
