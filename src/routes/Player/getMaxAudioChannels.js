const getMaxAudioChannels = (surroundSoundEnabled) => {
    return surroundSoundEnabled ? null : 2;
};

module.exports = {
    getMaxAudioChannels,
};
