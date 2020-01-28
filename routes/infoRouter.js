const express = require('express');
const bodyParser = require('body-parser');
const actions = require('../components/actions')
const infoRouter = express.Router();


infoRouter.use(bodyParser.json());

infoRouter.route('/add')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})

.post((req, res, next) => {

    actions.inserteData('info',{id: req.body[0].id, content:  req.body[0].content}) 
    res.end('added the id:' + req.body[0].id + '\ncontent: ' + req.body[0].content);
})

module.exports = infoRouter;