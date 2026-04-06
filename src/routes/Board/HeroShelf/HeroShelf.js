// Copyright (C) 2017-2024 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const useTranslate = require('stremio/common/useTranslate');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const styles = require('./styles');

const HeroShelf = ({ items }) => {
    const t = useTranslate();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [autoplayAllowed, setAutoplayAllowed] = React.useState(true);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFocusWithin, setIsFocusWithin] = React.useState(false);

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
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const hoverQuery = window.matchMedia('(hover: hover)');
        const updateAutoplayPreference = () => {
            setAutoplayAllowed(!reducedMotionQuery.matches && hoverQuery.matches);
        };

        updateAutoplayPreference();

        const addListener = (query, listener) => {
            if (typeof query.addEventListener === 'function') {
                query.addEventListener('change', listener);
                return () => query.removeEventListener('change', listener);
            }

            query.addListener(listener);
            return () => query.removeListener(listener);
        };

        const removeReducedMotionListener = addListener(reducedMotionQuery, updateAutoplayPreference);
        const removeHoverListener = addListener(hoverQuery, updateAutoplayPreference);

        return () => {
            removeReducedMotionListener();
            removeHoverListener();
        };
    }, []);

    const isAutoplayPaused = !autoplayAllowed || isHovered || isFocusWithin;

    React.useEffect(() => {
        if (itemCount <= 1 || isAutoplayPaused) return;
        const id = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % itemCount);
        }, 8000);
        return () => clearInterval(id);
    }, [isAutoplayPaused, itemCount]);

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

    const onMouseEnter = React.useCallback(() => {
        setIsHovered(true);
    }, []);

    const onMouseLeave = React.useCallback(() => {
        setIsHovered(false);
    }, []);

    const onFocusCapture = React.useCallback(() => {
        setIsFocusWithin(true);
    }, []);

    const onBlurCapture = React.useCallback((event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsFocusWithin(false);
        }
    }, []);

    const item = validItems[currentIndex] || validItems[0] || {};

    if (validItems.length === 0) {
        return null;
    }

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
        <div
            className={styles['hero-shelf-container']}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocusCapture={onFocusCapture}
            onBlurCapture={onBlurCapture}
        >
            <div className={`${styles['hero-slide']} animate__animated animate__fadeIn`} style={{ '--animate-duration': '0.6s' }}>
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
                    <div className={styles['hero-dots']}>
                        {validItems.map((_, i) => (
                            <button
                                key={i}
                                type={'button'}
                                className={classnames(styles['hero-dot'], { [styles['hero-dot-active']]: i === currentIndex })}
                                onClick={() => setCurrentIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
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
