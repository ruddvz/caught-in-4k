// Copyright (C) 2017-2024 Smart code 203358507

import React from 'react';
import styles from './Option.less';
import Icon from '@stremio/stremio-icons/react';

type Props = {
    option: MultiselectMenuOption;
    selected: boolean;
};

const Option = ({ option, selected }: Props) => {
    return (
        <>
            <div className={styles['label']}>{ option.label }</div>
            {
                selected && !option.level ?
                    <div className={styles['icon']} />
                    : null
            }
            {
                option.level ?
                    <Icon name={'caret-right'} className={styles['option-caret']} />
                    : null
            }
        </>
    );
};

export default Option;
