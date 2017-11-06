const path = require('path');
const fs = require('fs-extra');
const open = require('open');
const express = require('express');
const d3 = require('d3');

const context = require('./context.js');

const nunjucks = require('nunjucks');
const safe = require('nunjucks').runtime.markSafe;
const marked = require('marked');
const router = require('./router.js');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../webpack-dev.config.js');

const app = express();
app.use('/', router);

app.set('view engine', 'html');

const env = nunjucks.configure('./src/templates/', {
  autoescape: true,
  express: app,
  watch: true
});

env.addFilter('markdown', (str, kwargs) => {
  // strip outer <p> tags?
  const strip = typeof kwargs === 'undefined' ?
    false : kwargs.strip || false;
  return !strip ? safe(marked(str)) :
    safe(marked(str).trim().replace(/^<p>|<\/p>$/g, ''));
});

env.addFilter('slugify', (str, kwargs) => {
  // https://gist.github.com/mathewbyrne/1280286
  function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  return slugify(str);
});

env.addFilter('toLocaleString', (num, kwargs) => {
  return num.toLocaleString();
});


env.addFilter('formatDate', (date, kwargs) => {
  const parsedDate = d3.timeParse('%Y-%m-%d')(date);
  return d3.timeFormat('%B %-d, %Y')(parsedDate);
});

env.addFilter('formatThousands', (num, kwargs) => {
  return d3.format('.2s')(num);
});


app.use(express.static('src'))

module.exports = {
  startServer: (port) => {
    const compiler = webpack(webpackConfig);
    const middleware = webpackMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath
    });
    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));

    app.listen(port, function() {
      app.keepAliveTimeout = 0;
    })

    middleware.waitUntilValid(() => {
      console.log(`app started on port ${port}`);
      open(`http://localhost:${port}`);
    });
  },
  renderIndex: () => {
    process.env.NODE_ENV = 'production';
    
    const ctx = context.getContext();
    
    ctx['env'] = process.env.NODE_ENV;

    app.render('index.html', ctx, function(err, html) {
      fs.writeFileSync('dist/index.html', html);
      console.log('dist/index.html written');
    });
  }
}
