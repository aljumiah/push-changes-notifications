const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const logging = require('../components/logging');
const actions = require('../components/actions')
const clientsRouter = express.Router();

clientsRouter.use(bodyParser.json());

clientsRouter.route('/add')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})

.post((req, res, next) => {
    actions.subscribe(req.body.id, req.body.subscriped_ids, req.body.push_url);
    res.end('added the client:' + req.body.id + '\nwith url: ' + req.body.push_url + '\nsubscriped_ids: [' + req.body.subscriped_ids +']');
})

clientsRouter.route('/subscribe')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})

.post((req, res, next) => {
    actions.subscribe(req.body.subscriped_ids , req.body.push_url);
    res.end('subscriped succsfuuly with :' + req.body.subscriped_ids);
})


module.exports = clientsRouter;