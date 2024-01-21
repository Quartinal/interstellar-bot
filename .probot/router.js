const app = require('./app.mjs')

module.exports = app => {
  app.load(require.resolve('./app.mjs'))
}
