'use strict';

/**
 * Module Deps
 */

var _    = require('underscore');
var path = require('path');
var fs   = require('fs');
var ejs  = require('ejs');

/**
 * Stores
 */

var viewCache = {};

/**
 * Helpers
 */

var getFileSync = function(path, useCache) {
  console.log('useCache: ' + useCache);
  if(!useCache || typeof viewCache[path] !== 'string') {
    console.log('Reloading From File')
    viewCache[path] = fs.readFileSync(path, 'utf8');
  }

  return viewCache[path];

}

var renderFileSync = function(path, locals, useCache) {
  return ejs.render(getFileSync(path, useCache), { locals: locals, filename: path });
};


/**
 * Laytial Middleware
 */

module.exports = function() {

  return function(req, res, next) {

    var useCache = req.app.get('cache views') ||
    (['production', 'staging'].indexOf(process.env.NODE_ENV || 'development') !== -1) ?
    true : false;

    var lookup = function (root, viewName) {
      var view = new (req.app.get('view'))(viewName, {
        defaultEngine: req.app.get('view engine'),
        root: root,
        engines: req.app.engines
      });
      if(view.path) return view.path;
      view = new (req.app.get('view'))(viewName, {
        defaultEngine: req.app.get('view engine'),
        root: req.app.get('views'),
        engines: req.app.engines
      });
      return view.path;
    };

    res.expressRender = res.render;

    var viewExt = req.app.get('view engine');
    var viewRootPath = req.app.get('views');

    res.render = function(view, locals) {

      locals = _.defaults(locals || {}, res.locals, req.app.locals);

      var partialBasePath;

      locals.partial = function(view, partialLocals) {

        var partialPath = lookup(path.dirname(partialBasePath), view, viewExt);

        if(!partialPath) {
          throw new Error('Unable to resolve view "' + view + '"');
        }

        return renderFileSync(partialPath, _.defaults(partialLocals || {}, locals), useCache);

      };

      //
      // Render Body
      //

      var viewPath = lookup(viewRootPath, view, viewExt);

      if(!viewPath) {
        return next(new Error('Unable to resolve view "' + view + '"'));
      }

      partialBasePath = viewPath;

      var bodyHtml = renderFileSync(viewPath, locals, useCache);

      if(locals.layout === false) {
        return res.send(bodyHtml);
      }

      //
      // Render Layout
      //

      var layoutPath = lookup(viewRootPath, locals.layout || 'layout', viewExt);

      if(!layoutPath) {
        return next(new Error('Unable to resolve layout "' + (locals.layout || 'layout')) + '"');
      }

      partialBasePath = layoutPath;

      var layoutHtml = renderFileSync(layoutPath, _.extend(locals, { body: bodyHtml }), useCache);

      res.send(layoutHtml);


    };

    return next();

  };

};
