// Copyright (C) 2017-2024 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const CONSTANTS = require('stremio/common/CONSTANTS');
const { useSatisfactionMeter } = require('stremio/common/useSatisfactionMeter');
const SatisfactionMeterBar = require('stremio/components/SatisfactionMeterBar/SatisfactionMeterBar');
const styles = require('./styles');

const HeroShelf = ({ items }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const validItems = React.useMemo(() =>
        Array.isArray(items)
            ? items.filter((item) => item && typeof item.background === 'string').slice(0, 15)
            : []
    , [items]);

    const itemCount = validItems.length;

    React.useEffect(() => {
        setCurrentIndex(0);
    }, [itemCount]);

    React.useEffect(() => {
        if (itemCount <= 1) return;
        const id = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % itemCount);
        }, 15000);
        return () => clearInterval(id);
    }, [itemCount]);

    const goToPrev = React.useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
    }, [itemCount]);

    const goToNext = React.useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, [itemCount]);

    const item = validItems[currentIndex] || validItems[0] || {};

    const ratingToUse = (typeof item.voteAverage === 'number' && !isNaN(item.voteAverage)) ? item.voteAverage :
        (typeof item.vote_average === 'number' && !isNaN(item.vote_average)) ? item.vote_average :
            (item.imdbRating ? parseFloat(item.imdbRating) : null);

    const satisfactionTier = useSatisfactionMeter(ratingToUse);

    if (validItems.length === 0) {
        return null;
    }

    const imdbLink = Array.isArray(item.links)
        ? item.links.find((l) => l.category === CONSTANTS.IMDB_LINK_CATEGORY)
        : null;

    const year =
        item.released instanceof Date && !isNaN(item.released.getTime())
            ? item.released.getFullYear()
            : typeof item.releaseInfo === 'string' && item.releaseInfo.length > 0
                ? item.releaseInfo.split(' ')[0].substring(0, 4)
                : null;

    const watchHref =
        item.deepLinks
            ? (item.deepLinks.player || item.deepLinks.metaDetailsStreams || item.deepLinks.metaDetailsVideos) || null
            : null;

    const trailerHref =
        Array.isArray(item.trailerStreams) &&
        item.trailerStreams.length > 0 &&
        item.trailerStreams[0].deepLinks
            ? item.trailerStreams[0].deepLinks.player || null
            : null;

    return (
        <div className={styles['hero-shelf-container']}>
            <div className={styles['hero-slide']}>
                <Image
                    className={styles['hero-background']}
                    src={item.background}
                    alt={' '}
                />
                <div className={styles['hero-gradient']} />
                <div className={styles['hero-content']}>
                    {
                        typeof item.logo === 'string' && item.logo.length > 0 ?
                            <Image
                                className={styles['hero-logo']}
                                src={item.logo}
                                alt={item.name}
                            />
                            :
                            <div className={styles['hero-title']}>{item.name}</div>
                    }
                    <div className={styles['hero-meta']}>
                        {year ? <span className={styles['hero-year']}>{year}</span> : null}
                        {
                            typeof item.runtime === 'string' && item.runtime.length > 0 ?
                                <span className={styles['hero-runtime']}>{item.runtime}</span>
                                : null
                        }
                        {
                            imdbLink ?
                                <span className={styles['hero-imdb']}>★ {imdbLink.name}</span>
                                : null
                        }
                        {
                            satisfactionTier ?
                                <SatisfactionMeterBar tier={satisfactionTier} size="small" animated={true} />
                                : null
                        }
                    </div>
                    {
                        typeof item.description === 'string' && item.description.length > 0 ?
                            <p className={styles['hero-description']}>{item.description}</p>
                            : null
                    }
                    <div className={styles['hero-actions']}>
                        {
                            watchHref ?
                                <Button
                                    className={classnames(styles['hero-btn'], styles['hero-btn-primary'])}
                                    href={watchHref}
                                >
                                    <span>{t('SHOW')}</span>
                                </Button>
                                : null
                        }
                        {
                            trailerHref ?
                                <Button
                                    className={classnames(styles['hero-btn'], styles['hero-btn-secondary'])}
                                    href={trailerHref}
                                >
                                    <span>{t('TRAILER')}</span>
                                </Button>
                                : null
                        }
                    </div>
                </div>
            </div>
            {
                validItems.length > 1 ?
                    <React.Fragment>
                        <button
                            className={classnames(styles['hero-nav'], styles['hero-nav-prev'])}
                            onClick={goToPrev}
                            aria-label={'Previous'}
                        >
                            ‹
                        </button>
                        <button
                            className={classnames(styles['hero-nav'], styles['hero-nav-next'])}
                            onClick={goToNext}
                            aria-label={'Next'}
                        >
                            ›
                        </button>
                        <div className={styles['hero-dots']}>
                            {validItems.map((_, i) => (
                                <button
                                    key={i}
                                    className={classnames(styles['hero-dot'], { [styles['hero-dot-active']]: i === currentIndex })}
                                    onClick={() => setCurrentIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </React.Fragment>
                    : null
            }
        </div>
    );
};

HeroShelf.propTypes = {
    items: PropTypes.array,
};

module.exports = HeroShelf;
