/**
 * Check if a car is due for service based on currentKm and serviceDueKm.
 * Returns true if currentKm >= serviceDueKm (or within threshold).
 */
function isDueForService(currentKm, serviceDueKm, thresholdKm = 500) {
  if (serviceDueKm == null) return false;
  return currentKm >= serviceDueKm - thresholdKm;
}

module.exports = { isDueForService };
