
var _    = require('underscore');
var path = require('path');
var fs   = require('fs');
var ejs  = require('ejs');

module.exports = function() {

  return function(req, res, next) {

    res.partial = res.render;

    var viewExt = req.app.get('view engine');
    var viewRootPath = req.app.get('views');

    req.app.locals.layout = req.app.locals.layout || 'layout.' + viewExt;

    res.render = function(view, locals) {
      console.log('Fake res.Rendering')
      locals = _.defaults(locals, res.locals, req.app.locals);

      var viewPath = resolve(viewRootPath, view, viewExt);

      locals.partial = function(view) {
        return renderFileSync(partialPath);
      }

 
      console.log('Rendering Body: ', viewPath);
      // Render Body
      renderFile(viewPath, { locals: locals }, function(err, bodyHtml) {

      });

      
    };


    return next();

  }

}

function renderFile(path, cb) {
  fs.readFile(path, 'utf8', function(err, source) {
    if(err) return cb(err);
    var html;
    try {
      html = ejs.render(source);
    } catch (e) {
      cb(e);
    }
    cb(null, html);
  });
}

function renderFileSync(path, options) {
  ejs.render(fs.readFileSync(path, 'utf8'), options)
}

function resolve(root, view, ext) {
  console.log('resolve:', root, view, ext);
  var paths = [
    [root, view + '.' + ext],
    [root, view, './index.' + ext],
    [root, view],
    [root + '/', view + '.' + ext],
    [root + '/', view, './index.' + ext],
    [root + '/', view]
  ];

  paths = _.map(paths, function(pathStruct) {
    pathStruct[0] = fs;
    return path.resolve.apply(null, pathStruct);
  });
  
  var pathFound = _.find(paths, function(pathStruct) {
    console.log('Trying ' + pathStruct);  
    return fs.existsSync(pathStruct);
  });
  console.log('path found:', pathFound);


  return pathFound || false;

}

function renderer(ext){
  if(ext[0] !== '.'){
    ext = '.' + ext;
  }
  return register[ext] != null
    ? register[ext]
    : register[ext] = require(ext.slice(1)).render;
};

module.exports.renderer = renderer;