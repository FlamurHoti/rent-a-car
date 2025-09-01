/**
 * Ensures the resource belongs to the authenticated user's company.
 * Use after authenticate. Pass companyId from body/params/query.
 */
const ensureCompanyAccess = (getCompanyId) => (req, res, next) => {
  const resourceCompanyId = getCompanyId(req);
  if (!resourceCompanyId) {
    return res.status(400).json({ error: 'Company context missing.' });
  }
  if (resourceCompanyId !== req.companyId) {
    return res.status(403).json({ error: 'Access denied to this company data.' });
  }
  next();
};

module.exports = { ensureCompanyAccess };
