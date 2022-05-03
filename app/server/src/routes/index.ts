const router = require('express').Router();

router.use('/odin', require('./odin'));
router.use('/config', require('./config'));

module.exports = router;
