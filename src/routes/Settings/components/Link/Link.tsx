import React from 'react';
import { Button } from 'stremio/components';
import classnames from 'classnames';
import styles from './Link.less';

type Props = {
    label: string,
    href?: string,
    target?: string,
    onClick?: () => void,
    className?: string,
};

const Link = ({ label, href, target, onClick, className }: Props) => {
    return (
        <Button className={classnames(styles['link'], className)} title={label} target={target ?? '_blank'} href={href} onClick={onClick}>
            <div className={styles['label']}>{ label }</div>
        </Button>
    );
};

export default Link;
