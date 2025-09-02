const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/service-alerts', dashboardController.getServiceAlerts);
router.get('/activity', dashboardController.getActivity);

module.exports = router;
