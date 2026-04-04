function safeParseFloat(val, defaultValue = null) {
  const n = parseFloat(val);
  return isNaN(n) ? defaultValue : n;
}

function safeParseInt(val, defaultValue = null) {
  const n = parseInt(val, 10);
  return isNaN(n) ? defaultValue : n;
}

module.exports = { safeParseFloat, safeParseInt };
