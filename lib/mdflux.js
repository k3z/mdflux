
var mdFlux = function() {
  this.markdownParser = null;
  this.HTMLParser = null;
}

mdFlux.prototype.setMarkdownParser = function(parser) {
  this.markdownParser = parser;
}

mdFlux.prototype.setHTMLParser = function(parser) {
  this.HTMLParser = parser;
}

mdFlux.prototype.toHTML = function(md) {
  var parser = new mdFluxMarkdown(this.markdownParser)
  return parser.convert(md);
}

mdFlux.prototype.toMarkdown = function(html) {
  var parser = new mdFluxHTML(this.HTMLParser)
  return parser.convert(html);
}


var mdFluxMarkdown = function(parser) {
  this.parser = parser;
}

mdFluxMarkdown.prototype.convert = function(md) {
  // pre proccess
  var attrs = this.get_inline_attributes(md);
  md = this.prepare_bloc_attributes(md);
  md = this.prepare_inline_attributes(md, attrs)
  md = this.cleanup(md);

  var html = this.parser(md)

  // post proccess
  html = this.restore_bloc_attributes(html);
  html = this.restore_inline_attributes(html, attrs);

  return html;
}

mdFluxMarkdown.prototype.get_inline_attributes = function(md) {
  var matches = [];
  // images
  var re = /!(\[([^\]]*)\])\([^\)]*\)({:[ ]?(.*?)[ ]?})/gmi;
  var m;

  while ((m = re.exec(md)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      var uuid = UUID.create().toString();
      matches.push({
        'start': m.index,
        'end': m.index + m[0].length,
        'len': m[0].length,
        'search': m[0],
        'replace': m[0].replace(m[1], '['+uuid+']').replace(m[3], ''),
        'uuid': uuid,
        'alt': m[2],
        'raw': m[4],
        'values': this.attributes_to_array(m[4])
      })
  }

  // links
  var re = /[^!](\[([^\]]*)\])(\(([^\)]*)\))({:[ ]?(.*?)[ ]?})/gmi;
  var m;

  while ((m = re.exec(md)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      var uuid = UUID.create().toString();
      matches.push({
        'start': m.index,
        'end': m.index + m[0].length,
        'len': m[0].length,
        'search': m[0],
        'replace': m[0].replace(m[3], '('+uuid+')').replace(m[5], ''),
        'uuid': uuid,
        'link': m[4],
        'raw': m[6],
        'values': this.attributes_to_array(m[4])
      })
  }
  return matches;
}

mdFluxMarkdown.prototype.prepare_bloc_attributes = function(md) {
  var re = /\n\n.*({:[ ]?(.*?)[ ]?})\n\n/gmi;
  var m;

  while ((m = re.exec(md)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      md = md.replace(m[1], '<mdattrbloc '+ m[2] +'></mdattrbloc>')
  }
  return md
}

mdFluxMarkdown.prototype.prepare_inline_attributes = function(md, attributes) {
  for (var i = attributes.length - 1; i >= 0; i--) {
    var a = attributes[i];
    md = md.replace(a['search'], a['replace'])
  };
  return md;
}

mdFluxMarkdown.prototype.restore_inline_attributes = function(html, attributes) {
  for (var i = attributes.length - 1; i >= 0; i--) {
    var a = attributes[i];
    if (a.alt) {
      html = html.replace(a.uuid+'"', a.alt+'" '+a.raw);
    } else {
      html = html.replace(a.uuid+'"', a.link+'" '+a.raw);
    }
  };
  return html;
}

mdFluxMarkdown.prototype.restore_bloc_attributes = function(html) {
  var $html = $('<div><div>'+html+'</div></div>')
  $('mdattrbloc', $html).each(function(k, b) {
    $.each(b.attributes, function() {
      $(b).parent().attr(this.name, this.value);
    })
    $(b).remove();
  })
  return $('div', $html).html();
}

mdFluxMarkdown.prototype.cleanup = function(md) {
  var re = /({:.*?[^}]})[^\\n]/gmi;
  var m;

  while ((m = re.exec(md)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      md = md.replace(m[0], '');
  }
  return md;
}

mdFluxMarkdown.prototype.attributes_to_array = function(str) {
  var matches = [];
  var re = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gmi;
  var m;

  while ((m = re.exec(str)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      matches.push({
        'key': m[1],
        'value': m[2],
      })
  }

  return matches;
}


var mdFluxHTML = function(parser) {
  this.parser = parser;
}

mdFluxHTML.prototype.convert = function(html) {
  // pre proccess
  var result = this.get_inline_attributes_and_prepare(html);
  var attrs = result.attributes;
  html = result.html;
  html = this.convert_bloc_attributes(html);

  var md = this.parser(html)

  // post proccess
  md = this.restore_inline_attributes(md, attrs);
  // html = this.r/estore_bloc_attributes(html);

  return md;
}


mdFluxHTML.prototype.get_inline_attributes_and_prepare = function(html) {
  var $html = $('<div><div>'+html+'</div></div>')
  var matches = [];

  $('img, a', $html).each(function(k, t) {

    uuid = UUID.create().toString();
    var $t = $(t);
    var attributes = [];
    $.each(t.attributes, function() {
      if (this.name != 'alt' && this.name != 'src' && this.name != 'href') {
        attributes.push(this.name+'="'+this.value+'"');
      };
    })

    if (t.tagName == 'IMG') {
      matches.push({
        'uuid': uuid,
        'src': $t.attr('src'),
        'attributes': attributes.join(' ')
      })
      $t.attr('src', uuid);
    };

    if (t.tagName == 'A') {
      matches.push({
        'uuid': uuid,
        'href': $t.attr('href'),
        'attributes': attributes.join(' ')
      })
      $t.attr('href', uuid);
    };
  })
  return {
    'attributes': matches,
    'html': $('div', $html).html()
  };
}

mdFluxHTML.prototype.convert_bloc_attributes = function(html) {
  var $html = $('<div><div>'+html+'</div></div>')

  $('p', $html).each(function(k, t) {
    var attributes = [];
    $.each(t.attributes, function() {
      attributes.push(this.name+'="'+this.value+'"');
    })
    if (attributes.length>0) {
      $(t).append('{: ' + attributes.join(' ') + ' }');
    };
  })

  return $('div', $html).html();
}

mdFluxHTML.prototype.restore_inline_attributes = function(md, attributes) {
  for (var i = attributes.length - 1; i >= 0; i--) {
    a = attributes[i]
    if (a.src) {
      md = md.replace(a.uuid+')', a.src+'){: '+a.attributes+' }')
    } else {
      md = md.replace(a.uuid+')', a.href+'){: '+a.attributes+' }')
    }
  };
  return md;
}
