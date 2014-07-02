
# Laytial

Layer and partial rendering for Express 4.x

## Install

    npm install laytial

## Usage

Laytial overwrites Express's `res.render` method. To do this Laytial is provided as middleware.

    var latial = require('latial');

    app.use(latial());

The default layout is 'layout' but can be overwritten by setting a `layout` local with on `app.locals`, `res.locals` or the locals passed to the second paramater in `res.render(view, locals)`. Setting `layout: false` will disable the layout render and just send the body, `layout: 'some/path'` will render with the specified layout.

## Example

app.js:

```js
var express = require('express')
var laytial = require('laytial')
var app = express()

app.use(laytial())

app.get('/', function(req, res) {
  res.render('home', { title: 'Home', name: 'Ben'})
  //  Renders and sends:
  //  <h1>Home</h1>
  //  <div class="container"><h2>Welcome Home Ben</h2></div>
})

app.get('/no-layout', function(req, res) {
  res.render('home', { layout: false, name: 'Ben'})
  //  Renders and sends:
  //  <h2>Welcome Home Ben</h2>
})

app.listen(3000)
```

views/layout.ejs:

```ejs
<h1><%= title %></h1>
<div class="container"><%=: body %></div>
```

views/home.ejs:

```ejs
<h2>Welcome Home <%= name %></h2>
```

## Licence

The MIT License (MIT)

Copyright (c) 2014 Streamcast.IO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.