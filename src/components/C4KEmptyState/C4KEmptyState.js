// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Button, Image } = require('stremio/components');
const styles = require('./C4KEmptyState.less');

const C4KEmptyState = ({
    className,
    imageSrc,
    title,
    body,
    primaryLabel,
    primaryHref,
    onPrimaryClick,
    secondaryLabel,
    secondaryHref,
    onSecondaryClick,
}) => (
    <div className={classnames(styles['empty-state'], className)} role="status">
        {imageSrc ? (
            <Image className={styles['image']} src={imageSrc} alt="" />
        ) : null}
        {title ? <h2 className={styles['title']}>{title}</h2> : null}
        {body ? <p className={styles['body']}>{body}</p> : null}
        <div className={styles['actions']}>
            {primaryLabel ? (
                <Button
                    className={styles['primary']}
                    href={primaryHref}
                    onClick={onPrimaryClick}
                >
                    {primaryLabel}
                </Button>
            ) : null}
            {secondaryLabel ? (
                <Button
                    className={styles['secondary']}
                    href={secondaryHref}
                    onClick={onSecondaryClick}
                >
                    {secondaryLabel}
                </Button>
            ) : null}
        </div>
    </div>
);

C4KEmptyState.propTypes = {
    className: PropTypes.string,
    imageSrc: PropTypes.string,
    title: PropTypes.node,
    body: PropTypes.node,
    primaryLabel: PropTypes.string,
    primaryHref: PropTypes.string,
    onPrimaryClick: PropTypes.func,
    secondaryLabel: PropTypes.string,
    secondaryHref: PropTypes.string,
    onSecondaryClick: PropTypes.func,
};

module.exports = C4KEmptyState;
