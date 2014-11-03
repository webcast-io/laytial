'use strict';

/**
 * Module Deps
 */

var _    = require('underscore');
var path = require('path');
var fs   = require('fs');
var ejs  = require('ejs');

/**
 * Helpers
 */

var getFileSync = function(path) {
  return fs.readFileSync(path, 'utf8');
};

var renderFileSync = function(path, locals, options) {
  return ejs.render(getFileSync(path, options), _.defaults({ locals: locals, filename: path }, options));
};


/**
 * Laytial Middleware
 */

module.exports = function() {

  return function(req, res, next) {

    var useCache = req.app.get('view cache') ||
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
        try {
          return renderFileSync(partialPath, _.defaults(partialLocals || {}, locals), { cache: useCache });
        } catch (e) {
          return next(e);
        }

      };

      //
      // Render Body
      //

      var viewPath = lookup(viewRootPath, view, viewExt);

      if(!viewPath) {
        return next(new Error('Unable to resolve view "' + view + '"'));
      }

      partialBasePath = viewPath;
      try {
        var bodyHtml = renderFileSync(viewPath, locals, { cache: useCache });
      } catch (e) {
        return next(e);
      }

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
      try {
        var layoutHtml = renderFileSync(layoutPath, _.extend(locals, { body: bodyHtml }), { cache: useCache });
      } catch (e) {
        return next(e);
      }

      res.send(layoutHtml);


    };

    return next();

  };

};
