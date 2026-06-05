// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslate } = require('stremio/common');
const mapSelectableInputs = require('./mapSelectableInputs');

const useSelectableInputs = (discover) => {
    const t = useTranslate();
    const selectableInputs = React.useMemo(() => {
        return mapSelectableInputs(discover, t);
    }, [discover.selected, discover.selectable]);
    return selectableInputs;
};

module.exports = useSelectableInputs;
