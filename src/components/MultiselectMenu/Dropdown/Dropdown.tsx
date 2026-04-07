// Copyright (C) 2017-2024 Smart code 203358507

import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from 'stremio/components';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Option from './Option';
import Icon from '@stremio/stremio-icons/react';
import styles from './Dropdown.less';
import optionStyles from './Option/Option.less';

type Props = {
    options: MultiselectMenuOption[];
    value?: any;
    menuOpen: boolean | (() => void);
    level: number;
    setLevel: (level: number) => void;
    onSelect: (value: any) => void;
};

const Dropdown = ({ level, setLevel, options, onSelect, value, menuOpen }: Props) => {
    const { t } = useTranslation();
    const optionsRef = useRef<Map<any, HTMLButtonElement>>(new Map());
    const containerRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSetOptionRef = useCallback((optionValue: any) => (node: HTMLButtonElement | null) => {
        if (node) {
            optionsRef.current.set(optionValue, node);
        } else {
            optionsRef.current.delete(optionValue);
        }
    }, []);

    const handleBackClick = useCallback(() => {
        setLevel(level - 1);
    }, [setLevel, level]);

    useEffect(() => {
        if (menuOpen && selectedOption && containerRef.current) {
            containerRef.current.scrollTop = 0;
            const selectedNode = optionsRef.current.get(selectedOption.value);
            if (selectedNode) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const selectedRect = selectedNode.getBoundingClientRect();
                const isFullyVisible = selectedRect.top >= containerRect.top && selectedRect.bottom <= containerRect.bottom;

                if (!isFullyVisible) {
                    selectedNode.scrollIntoView({
                        behavior: 'auto',
                        block: 'nearest'
                    });
                }
            }
        }
    }, [menuOpen, selectedOption]);

    return (
        <div
            className={classNames('multiselect-menu-dropdown', styles['dropdown'], { [styles['open']]: menuOpen })}
            ref={containerRef}
        >
            {level > 0 ?
                <Button className={styles['back-button']} onClick={handleBackClick}>
                    <Icon name={'caret-left'} className={styles['back-button-icon']} />
                    {t('BACK')}
                </Button>
                : null
            }
            <div className={styles['options-list']} role="menu" aria-label={t('Options')}>
                {options
                    .filter((option: MultiselectMenuOption) => !option.hidden)
                    .map((option: MultiselectMenuOption) => {
                        const selected = option.value === value;

                        const optionContent = <Option option={option} selected={selected} />;

                        if (selected) {
                            return (
                                <button
                                    type="button"
                                    key={option.value}
                                    ref={handleSetOptionRef(option.value)}
                                    className={classNames(optionStyles['option'], optionStyles['selected'])}
                                    role="menuitemradio"
                                    aria-label={String(option.label)}
                                    aria-checked="true"
                                    onClick={() => onSelect(option.value)}
                                >
                                    {optionContent}
                                </button>
                            );
                        }

                        return (
                            <button
                                type="button"
                                key={option.value}
                                ref={handleSetOptionRef(option.value)}
                                className={optionStyles['option']}
                                role="menuitemradio"
                                aria-label={String(option.label)}
                                aria-checked="false"
                                onClick={() => onSelect(option.value)}
                            >
                                {optionContent}
                            </button>
                        );
                    })
                }
            </div>
        </div>
    );
};

export default Dropdown;
