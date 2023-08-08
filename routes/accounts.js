const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    res.send('GET route on accounts.');
 });

router.post('/', function(req, res){
    res.send('POST route on accounts.');
 });

 module.exports = router;