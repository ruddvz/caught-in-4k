// Copyright (C) 2024 Caught In 4K

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button } = require('stremio/components');
const { useServices } = require('stremio/services');
const { navigateToAppHref } = require('stremio/common/navigation');
const { usePlatform, useProfile } = require('stremio/common');
const useStreamPicker = require('./useStreamPicker');
const QualityButton = require('./QualityButton');
const StreamsList = require('../StreamsList');
const { resolveStreamLaunchTarget } = require('../StreamsList/Stream/resolveStreamLaunchTarget');
const { TIERS } = require('./streamClassifier');
const styles = require('./styles');

const QualityPicker = ({ className, streams, video, type, metaId, metaName, poster, posterShape, releaseInfo, libraryItemId, onEpisodeSearch }) => {
    const { core } = useServices();
    const profile = useProfile();
    const platform = usePlatform();
    const [customExpanded, setCustomExpanded] = React.useState(false);
    const { tiers, allStreams, selectQuality, hasStreamsLoading } = useStreamPicker(streams);

    const persistFallbackCandidates = React.useCallback((candidates) => {
        try {
            if (Array.isArray(candidates) && candidates.length > 1) {
                sessionStorage.setItem('c4k:fallback-candidates', JSON.stringify(
                    candidates.map((candidate) => ({
                        deepLinks: candidate.deepLinks,
                        description: candidate.description,
                        name: candidate.name,
                        addonName: candidate.addonName,
                    }))
                ));
                sessionStorage.removeItem('c4k:fallback-index');
                return;
            }

            sessionStorage.removeItem('c4k:fallback-candidates');
            sessionStorage.removeItem('c4k:fallback-index');
        } catch {
            // sessionStorage unavailable
        }
    }, []);

    const launchResolvedTarget = React.useCallback((launchTarget) => {
        if (!launchTarget || typeof launchTarget.href !== 'string' || launchTarget.href.length === 0) {
            return;
        }

        if (launchTarget.download && typeof document !== 'undefined' && document.body) {
            const link = document.createElement('a');
            link.href = launchTarget.href;
            link.download = launchTarget.download;
            link.rel = 'noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        if (launchTarget.target === '_blank') {
            window.open(launchTarget.href, launchTarget.target, 'noopener,noreferrer');
            return;
        }

        navigateToAppHref(launchTarget.href);
    }, []);

    const onQualityClick = React.useCallback((tier) => {
        const selection = selectQuality(tier);
        if (!selection?.stream) return;

        const launchTarget = resolveStreamLaunchTarget({
            deepLinks: selection.stream.deepLinks,
            playerType: profile.settings.playerType,
            platformName: platform.name,
        });

        if (!launchTarget?.href) return;

        core.transport.analytics({
            event: 'StreamClicked',
            args: { quality: tier }
        });

        if (launchTarget.isExternal) {
            persistFallbackCandidates([]);
        } else {
            persistFallbackCandidates(selection.candidates);
        }

        launchResolvedTarget(launchTarget);
    }, [core, launchResolvedTarget, persistFallbackCandidates, platform.name, profile.settings.playerType, selectQuality]);

    const onCustomClick = React.useCallback(() => {
        setCustomExpanded(true);
    }, []);

    const onBackToButtons = React.useCallback(() => {
        setCustomExpanded(false);
    }, []);

    if (customExpanded) {
        return (
            <div className={classnames(className, styles['quality-picker-container'])}>
                <div className={styles['custom-expanded-container']}>
                    <Button className={styles['back-to-buttons']} onClick={onBackToButtons}>
                        <Icon className={styles['back-icon']} name={'chevron-back'} />
                        <span>Back to quality selection</span>
                    </Button>
                    <div className={styles['streams-list-wrapper']}>
                        <StreamsList
                            streams={streams}
                            video={video}
                            type={type}
                            metaId={metaId}
                            metaName={metaName}
                            poster={poster}
                            posterShape={posterShape}
                            releaseInfo={releaseInfo}
                            libraryItemId={libraryItemId}
                            onEpisodeSearch={onEpisodeSearch}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={classnames(className, styles['quality-picker-container'])}>
            <div className={styles['quality-header']}>
                <span className={styles['header-label']}>Select Quality</span>
                {hasStreamsLoading && (
                    <span className={styles['loading-indicator']}>Scanning sources...</span>
                )}
            </div>
            <div className={styles['quality-buttons-grid']}>
                {TIERS.map((tier) => (
                    <QualityButton
                        key={tier}
                        tier={tier}
                        status={tiers[tier].status}
                        candidateCount={tiers[tier].candidates.length}
                        onClick={() => onQualityClick(tier)}
                    />
                ))}
                <QualityButton
                    tier="custom"
                    status="available"
                    candidateCount={allStreams.length}
                    onClick={onCustomClick}
                />
            </div>
        </div>
    );
};

QualityPicker.propTypes = {
    className: PropTypes.string,
    streams: PropTypes.arrayOf(PropTypes.object).isRequired,
    video: PropTypes.object,
    type: PropTypes.string,
    metaId: PropTypes.string,
    metaName: PropTypes.string,
    poster: PropTypes.string,
    posterShape: PropTypes.string,
    releaseInfo: PropTypes.string,
    libraryItemId: PropTypes.string,
    onEpisodeSearch: PropTypes.func,
};

module.exports = QualityPicker;
