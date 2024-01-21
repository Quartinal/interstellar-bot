const app = require('./app')

module.exports = app => {
  app.load(require.resolve('./app'))
}
