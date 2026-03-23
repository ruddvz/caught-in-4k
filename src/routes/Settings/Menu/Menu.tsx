import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../constants';
import styles from './Menu.less';

type Props = {
    selected: string,
    onSelect: (sectionId: string) => void,
};

const NAV_ITEMS = [
    { id: SECTIONS.GENERAL, labelKey: 'SETTINGS_NAV_GENERAL' },
    { id: SECTIONS.PLAYER, labelKey: 'SETTINGS_NAV_PLAYER' },
];

const Menu = ({ selected, onSelect }: Props) => {
    const { t } = useTranslation();

    return (
        <div className={styles['menu']}>
            <div className={styles['nav-pill']}>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={classNames(styles['nav-tab'], {
                            [styles['active']]: selected === item.id,
                        })}
                        onClick={() => onSelect(item.id)}
                    >
                        <span className={styles['tab-label']}>{t(item.labelKey)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Menu;
