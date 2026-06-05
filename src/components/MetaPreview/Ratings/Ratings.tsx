// Copyright (C) 2017-2025 Smart code 203358507

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useRating from './useRating';
import styles from './Ratings.less';
import Icon from '@stremio/stremio-icons/react';
import classNames from 'classnames';
import { Tooltip } from 'stremio/common/Tooltips';

type Props = {
    metaId?: string;
    ratingInfo?: Loadable<RatingInfo>;
    className?: string;
};

const Ratings = ({ ratingInfo, className }: Props) => {
    const { t } = useTranslation();
    const { onLiked, onLoved, liked, loved } = useRating(ratingInfo);
    const disabled = useMemo(() => ratingInfo?.type !== 'Ready', [ratingInfo]);

    return (
        <div className={classNames(styles['ratings-container'], className)}>
            <div
                className={classNames(styles['icon-container'], { [styles['disabled']]: disabled })}
                onClick={disabled ? undefined : onLiked}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('RATING_LIKE', 'Like')}
            >
                <Tooltip label={t('RATING_LIKE', 'Like')} position="top" />
                <Icon name={liked ? 'thumbs-up' : 'thumbs-up-outline'} className={styles['icon']} />
            </div>
            <div
                className={classNames(styles['icon-container'], { [styles['disabled']]: disabled })}
                onClick={disabled ? undefined : onLoved}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('RATING_LOVE', 'Love')}
            >
                <Tooltip label={t('RATING_LOVE', 'Love')} position="top" />
                <Icon name={loved ? 'heart' : 'heart-outline'} className={styles['icon']} />
            </div>
        </div>
    );
};

export default Ratings;
