#!/usr/bin/env node

// Copyright (C) 2017-2023 Smart code 203358507

const INDEX_CACHE = 7200;
const ASSETS_CACHE = 2629744;
const HTTP_PORT = 8080;

const express = require('express');
const path = require('path');

const build_path = path.resolve(__dirname, 'build');
const index_path = path.join(build_path, 'index.html');

const app = express();

app.use(express.static(build_path, {
    setHeaders: (res, path) => {
        if (path === index_path) res.set('cache-control', `public, max-age: ${INDEX_CACHE}`);
        else res.set('cache-control', `public, max-age: ${ASSETS_CACHE}`);
    }
}));

app.get('*', (_req, res) => {
    res.sendFile(index_path);
});

app.listen(HTTP_PORT, () => console.info(`Server listening on port: ${HTTP_PORT}`));
