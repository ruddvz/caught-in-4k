// Copyright (C) 2017-2024 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const useTranslate = require('stremio/common/useTranslate');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const CONSTANTS = require('stremio/common/CONSTANTS');
const CanonTakeBox = require('stremio/components/CanonTakeBox/CanonTakeBox');
const { generateCanonTake } = require('stremio/common/pollinationsApi');
const styles = require('./styles');

const HeroShelf = ({ items }) => {
    const t = useTranslate();
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
        }, 8000);
        return () => clearInterval(id);
    }, [itemCount]);

    const goToPrev = React.useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
    }, [itemCount]);

    const goToNext = React.useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, [itemCount]);

    const touchStartX = React.useRef(null);
    const onTouchStart = React.useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);
    const onTouchEnd = React.useCallback((e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) {
            if (delta < 0) goToNext();
            else goToPrev();
        }
        touchStartX.current = null;
    }, [goToNext, goToPrev]);

    // Direct Canon Take fetch for the visible hero item — bypasses the 5s queue batch
    const [heroCanonTake, setHeroCanonTake] = React.useState(null);
    const currentItem = validItems[currentIndex] || validItems[0] || {};
    const heroYear = React.useMemo(() => {
        if (currentItem.released instanceof Date && !isNaN(currentItem.released.getTime())) {
            return currentItem.released.getFullYear();
        }
        return typeof currentItem.releaseInfo === 'string' && currentItem.releaseInfo.length > 0
            ? currentItem.releaseInfo.split(' ')[0].substring(0, 4)
            : null;
    }, [currentItem]);
    const heroGenres = React.useMemo(() => {
        if (!Array.isArray(currentItem.links)) return 'unknown';
        return currentItem.links
            .filter((l) => l && l.category === 'Genres')
            .map((l) => l.name)
            .join(', ') || 'unknown';
    }, [currentItem]);
    React.useEffect(() => {
        if (!currentItem.name) return;
        setHeroCanonTake(null);
        let cancelled = false;
        generateCanonTake(currentItem.name, heroYear, heroGenres, currentItem.vote_average || 0)
            .then((result) => { if (!cancelled && result) setHeroCanonTake(result); })
            .catch(() => { /* timeout in CanonTakeBox handles this */ });
        return () => { cancelled = true; };
    }, [currentItem.name, heroYear]);

    const item = validItems[currentIndex] || validItems[0] || {};

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

    const trailerHref = item.trailerStreams?.[0]?.deepLinks?.player ?? null;

    return (
        <div className={styles['hero-shelf-container']} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div key={currentIndex} className={`${styles['hero-slide']} animate__animated animate__fadeIn`} style={{ '--animate-duration': '0.6s' }}>
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
                            imdbLink && imdbLink.name ?
                                <span className={styles['hero-imdb']}>★ {imdbLink.name}</span>
                                : null
                        }
                    </div>
                    {
                        typeof item.description === 'string' && item.description.length > 0 ?
                            <p className={styles['hero-description']}>{item.description}</p>
                            : null
                    }
                    <div className={styles['hero-canon-take']}>
                        <CanonTakeBox
                            title={item.name}
                            year={year}
                            takeOverride={heroCanonTake}
                        />
                    </div>
                    <div className={styles['hero-actions']}>
                        {
                            watchHref ?
                                <Button
                                    className={classnames(styles['hero-btn'], styles['hero-btn-primary'])}
                                    href={watchHref}
                                >
                                    <span>{t.string('SHOW')}</span>
                                </Button>
                                : null
                        }
                        {
                            trailerHref ?
                                <Button
                                    className={classnames(styles['hero-btn'], styles['hero-btn-secondary'])}
                                    href={trailerHref}
                                >
                                    <span>{t.string('TRAILER')}</span>
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
                            <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 1.5L2 8.5L8.5 15.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button
                            className={classnames(styles['hero-nav'], styles['hero-nav-next'])}
                            onClick={goToNext}
                            aria-label={'Next'}
                        >
                            <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 1.5L8 8.5L1.5 15.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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
            {
                validItems.length > 1 ?
                    <div className={styles['hero-progress-bar']}>
                        <div key={currentIndex} className={styles['hero-progress-fill']} />
                    </div>
                    : null
            }
        </div>
    );
};

HeroShelf.propTypes = {
    items: PropTypes.array,
};

module.exports = HeroShelf;
