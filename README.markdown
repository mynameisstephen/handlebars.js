Attempts to replace Jelly with the handlebars templating library on the ServiceNow platform.

Usage
-----

```js
\\ Script Include: Handlebars - dist/handlebars.js
/* exported Handlebars */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
  ...

```

```js
\\ UI Macro: template_example
{{! <![CDATA[ }}
<h1>{{heading}}</h1>
<p class="{{classes}}">{{paragraph}}</p>

{{> textfield name="username" value="value" }}
{{! ]]> }}
```

```
\\ UI Macro: partial_textfield
{{! <![CDATA[ }}
<div class="form-group">
  <label for="{{else_default_to id 'field-{{name}}'}}" class="col-md-3 col-sm-4 col-xs-4 control-label required">{{else_default_to label name}}</label>
  <div class="col-md-6 col-sm-8 col-xs-8">
    <input
      id="{{else_default_to id 'field-{{name}}'}}"
      name="{{name}}"
      class="form-control"
      type="text"
      value="{{value}}"
    />
  </div>
</div>
{{! ]]> }}
```

```xhtml
<!-- Dynamic Content: Handlebars example -->
<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
  <g:evaluate var="jvar_content" object="true" jelly="true">
    var cache = {};

    var get = function(id) {
      if (cache[id] == null) {
        var template = null;

        template = new GlideRecord('sys_ui_macro');
        template.addQuery('name', id);
        template.query();

        if (template.next()) {
          cache[id] = Handlebars.compile(template.getValue('xml'));
        } else {
          cache[id] = Handlebars.compile('template ' + id + ' not found');
        }
      }

      return cache[id];
    };

    Handlebars.registerHelper('else_default_to', function(value, defaultValue) {
      return value != undefined ? value : (Handlebars.compile(defaultValue))(this);
    });

    Handlebars.registerPartial({
      'textfield': function() {
        return get('partial_textfield').apply(this, arguments);
      }
    });

    get('template_example')({
      'heading': 'Heading',
      'paragraph': 'Paragraph paragraph',
      'classes': 'first-class second-class'
    });
  </g:evaluate>

  ${jvar_content}
</j:jelly>
```

License
-------
Handlebars.js is released under the MIT license.