// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const classnames = require('classnames');
const styles = require('./CategoryBar.less');

const CATEGORIES = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'action', label: 'Action', icon: '⚔️' },
    { id: 'romance', label: 'Romance', icon: '❤️' },
    { id: 'animation', label: 'Animation', icon: '🧸' },
    { id: 'horror', label: 'Horror', icon: '👻' },
    { id: 'special', label: 'Special', icon: '🌟' },
    { id: 'drakor', label: 'Drakor', icon: '🇰🇷' },
];

const CategoryBar = () => {
    const [selected, setSelected] = React.useState('animation');

    return (
        <div className={styles['category-bar-container']}>
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    className={classnames(styles['category-pill'], { [styles['active']]: selected === cat.id })}
                    onClick={() => setSelected(cat.id)}
                >
                    <span className={styles['icon']}>{cat.icon}</span>
                    <span className={styles['label']}>{cat.label}</span>
                </button>
            ))}
        </div>
    );
};

module.exports = CategoryBar;
