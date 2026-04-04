const express = require('express');
const ctrl = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();
router.use(authenticate);

router.get('/stats', wrap(ctrl.getStats));
router.get('/service-alerts', wrap(ctrl.getServiceAlerts));
router.get('/activity', wrap(ctrl.getActivity));

module.exports = router;
