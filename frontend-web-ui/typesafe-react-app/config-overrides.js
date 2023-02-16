// Overrides to allow tsconfig aliases
const { aliasWebpack, aliasJest } = require("react-app-alias-ex");

const options = {};

module.exports = aliasWebpack(options);
module.exports.jest = aliasJest(options);
