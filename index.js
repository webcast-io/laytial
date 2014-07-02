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

var renderFileSync = function(path, locals) {
  return ejs.render(fs.readFileSync(path, 'utf8'), { locals: locals });
};


/**
 * Laytial Middleware
 */

module.exports = function() {

  return function(req, res, next) {

    var lookup = function (root, view) {
      view = new (req.app.get('view'))(view, {
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

        return renderFileSync(partialPath, _.defaults(partialLocals || {}, locals));

      };

      //
      // Render Body
      //

      var viewPath = lookup(viewRootPath, view, viewExt);

      if(!viewPath) {
        return next(new Error('Unable to resolve view "' + view + '"'));
      }

      partialBasePath = viewPath;

      var bodyHtml = renderFileSync(viewPath, locals);

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

      var layoutHtml = renderFileSync(layoutPath, _.extend(locals, { body: bodyHtml }));

      res.send(layoutHtml);


    };

    return next();

  };

};
