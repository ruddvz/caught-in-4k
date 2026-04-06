const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { usePlatform } = require('stremio/common/Platform');
const styles = require('./styles');

const ExternalRatings = ({ className, model, mode = 'full' }) => {
    const platform = usePlatform();

    if (!model) {
        return null;
    }

    if (mode === 'compact') {
        const compactBadge = model.compactBadge;
        if (!compactBadge) {
            return null;
        }

        return (
            <div className={classnames(className, styles['compact-badge'])} data-kind={compactBadge.id}>
                <span className={styles['compact-value']}>{compactBadge.label}</span>
                {compactBadge.secondaryLabel ? <span className={styles['compact-secondary']}>{compactBadge.secondaryLabel}</span> : null}
            </div>
        );
    }

    if (!Array.isArray(model.cards) || model.cards.length === 0) {
        return null;
    }

    const renderCard = (card) => {
        const content = (
            <React.Fragment>
                <div className={styles['card-header']}>
                    <span className={styles['card-label']}>{card.label}</span>
                    <span className={styles['card-meta']}>{card.id === 'imdb' ? 'Audience' : card.id === 'rottenTomatoes' ? 'Critics' : 'Consensus'}</span>
                </div>
                <div className={styles['card-value']}>{card.display}</div>
            </React.Fragment>
        );

        if (!card.href) {
            return (
                <div key={card.id} className={styles['card']} data-source={card.id} data-clickable={'false'}>
                    {content}
                </div>
            );
        }

        return (
            <button
                key={card.id}
                type={'button'}
                className={styles['card']}
                data-source={card.id}
                data-clickable={'true'}
                onClick={() => platform.openExternal(card.href)}
            >
                {content}
            </button>
        );
    };

    return (
        <div className={classnames(className, styles['external-ratings'])}>
            <div className={styles['cards']}>
                {model.cards.map(renderCard)}
            </div>
            {model.consensus ? (
                <div className={styles['consensus']}>
                    <div className={styles['consensus-score']}>{`${model.consensus.score}%`}</div>
                    <div className={styles['consensus-copy']}>
                        <div className={styles['consensus-label']}>C4K Consensus</div>
                        <div className={styles['consensus-verdict']}>{model.consensus.verdict.name}</div>
                        <div className={styles['consensus-subline']}>{`${model.consensus.sourceCount} sources aligned${model.consensus.penalty > 0 ? ', tempered for disagreement' : ''}.`}</div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

ExternalRatings.propTypes = {
    className: PropTypes.string,
    mode: PropTypes.oneOf(['full', 'compact']),
    model: PropTypes.shape({
        cards: PropTypes.array,
        compactBadge: PropTypes.shape({
            id: PropTypes.string,
            label: PropTypes.string,
            secondaryLabel: PropTypes.string,
        }),
        consensus: PropTypes.shape({
            score: PropTypes.number,
            sourceCount: PropTypes.number,
            penalty: PropTypes.number,
            verdict: PropTypes.shape({
                name: PropTypes.string,
            }),
        }),
    }),
};

module.exports = ExternalRatings;