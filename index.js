'use strict';

/**
 * Module Deps
 */

var _    = require('underscore');
var path = require('path');
var fs   = require('fs');
var ejs  = require('ejs');
var resolve = require('resolve');

/**
 * Helpers
 */

var renderFileSync = function(path, locals) {
  return ejs.render(fs.readFileSync(path, 'utf8'), { locals: locals });
};

var lookup = function(root, view, ext) {

  var paths = [
    [view + '.' + ext],
    [view],
    [view, './index.' + ext]
  ];

  for (var i = 0; i < paths.length; i++) {

    try {
      paths[i] = resolve.sync.apply(paths[i], { basedir: root, moduleDirectory: false , extensions: ['.' + ext]});
    } catch(e) {

    }

    if(fs.existsSync(paths[i]))
      return paths[i];
  }

  return false;

};

/**
 * Laytial Middleware
 */

module.exports = function() {

  return function(req, res, next) {

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
