const { describe, expect, it } = require('@jest/globals');

const { getMaxAudioChannels } = require('../src/routes/Player/getMaxAudioChannels');

describe('getMaxAudioChannels', () => {
    it('forces stereo output when surround sound is disabled', () => {
        expect(getMaxAudioChannels(false)).toBe(2);
    });

    it('defers to runtime media capabilities when surround sound is enabled', () => {
        expect(getMaxAudioChannels(true)).toBeNull();
    });
});