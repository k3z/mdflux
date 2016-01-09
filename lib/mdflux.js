var mdfluxGlobalIndex = 0;

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
  var parser = new mdFluxMarkdown(this.markdownParser, this)
  return parser.convert(md);
}

mdFlux.prototype.toMarkdown = function(html) {
  var parser = new mdFluxHTML(this.HTMLParser, this)
  return parser.convert(html);
}

mdFlux.prototype.uniqid = function() {
  mdfluxGlobalIndex += 1;
  return 'mdfluxindex' + mdfluxGlobalIndex;
}


var mdFluxMarkdown = function(parser, mdflux) {
  this.mdflux = mdflux;
  this.parser = parser;
}

mdFluxMarkdown.prototype.convert = function(md) {
  // pre proccess
  var attrs = this.get_inline_attributes(md);
  md = this.prepare_bloc_attributes(md);
  md = this.prepare_inline_attributes(md, attrs)
  md = this.prepare_title_attributes(md)
  md = this.cleanup(md);

  var html = this.parser(md)

  // post proccess
  html = this.restore_bloc_attributes(html);
  html = this.restore_inline_attributes(html, attrs);
  html = this.restore_title_attributes(html);

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
      var uid = this.mdflux.uniqid();
      matches.push({
        'start': m.index,
        'end': m.index + m[0].length,
        'len': m[0].length,
        'search': m[0],
        'replace': m[0].replace(m[1], '['+uid+']').replace(m[3], ''),
        'uid': uid,
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
      var uid = this.mdflux.uniqid();
      matches.push({
        'start': m.index,
        'end': m.index + m[0].length,
        'len': m[0].length,
        'search': m[0],
        'replace': m[0].replace(m[3], '('+uid+')').replace(m[5], ''),
        'uid': uid,
        'link': m[4],
        'raw': m[6],
        'values': this.attributes_to_array(m[4])
      })
  }
  return matches;
}

mdFluxMarkdown.prototype.prepare_bloc_attributes = function(md) {
  var re = /\n\{\:?([^\}]*)\}(?:$|\n\n)/gmi;
  var m;

  while ((m = re.exec(md)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      md = md.replace(m[0], '<mdattrbloc '+ m[1] +'></mdattrbloc>')
  }
  return md
}

mdFluxMarkdown.prototype.prepare_title_attributes = function(md) {
  var re = /((?:^|\n\n)(?:#{1,6})(?:.*?))(\{\:?([^\}]*)\})(?:$|\n\n)/gmi;
  var m;

  while ((m = re.exec(md)) !== null) {
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      md = md.replace(m[0], m[1] + '<mdattrtitle '+ m[3] +'></mdattrtitle>')
  }
  return md;
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
      html = html.replace(a.uid+'"', a.alt+'" '+a.raw);
    } else {
      html = html.replace(a.uid+'"', a.link+'" '+a.raw);
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

mdFluxMarkdown.prototype.restore_title_attributes = function(html) {
  var $html = $('<div><div>'+html+'</div></div>')
  $('mdattrtitle', $html).each(function(k, b) {
    $.each(b.attributes, function() {
      $(b).parent().attr(this.name, this.value);
    })
    $(b).remove();
  })
  return $('div', $html).html();
}

mdFluxMarkdown.prototype.cleanup = function(md) {
  var re = /({:.*?[^}]})[^\n]/gmi;
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


var mdFluxHTML = function(parser, mdflux) {
  this.mdflux = mdflux;
  this.parser = parser;
}

mdFluxHTML.prototype.convert = function(html) {
  // pre proccess
  var result = this.get_inline_attributes_and_prepare(html);
  var attrs = result.attributes;
  html = result.html;
  html = this.convert_bloc_attributes(html);
  html = this.convert_title_attributes(html);

  var md = this.parser(html)

  // post proccess
  md = this.restore_inline_attributes(md, attrs);
  md = this.restore_bloc_attributes(md);

  return md;
}


mdFluxHTML.prototype.get_inline_attributes_and_prepare = function(html) {
  var _this = this;
  var $html = $('<div><div>'+html+'</div></div>')
  var matches = [];

  $('img, a', $html).each(function(k, t) {
    var uid = _this.mdflux.uniqid();
    var $t = $(t);
    var attributes = [];
    $.each(t.attributes, function() {
      if (this.name != 'alt' && this.name != 'src' && this.name != 'href') {
        attributes.push(this.name+'="'+this.value+'"');
      };
    })

    if (t.tagName == 'IMG') {
      matches.push({
        'uid': uid,
        'src': $t.attr('src'),
        'attributes': attributes.join(' ')
      })
      $t.attr('src', uid);
    };

    if (t.tagName == 'A') {
      matches.push({
        'uid': uid,
        'href': $t.attr('href'),
        'attributes': attributes.join(' ')
      })
      $t.attr('href', uid);
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
      $(t).append('[n]{: ' + attributes.join(' ') + ' }');
    };
  })

  return $('div', $html).html();
}

mdFluxHTML.prototype.convert_title_attributes = function(html) {
  var $html = $('<div><div>'+html+'</div></div>')

  $('h1, h2, h3, h4, h5, h6', $html).each(function(k, t) {
    var attributes = [];
    $.each(t.attributes, function() {
      if (this.name != 'id') {
        attributes.push(this.name+'="'+this.value+'"');
      };
    })
    if (attributes.length>0) {
      $(t).append('{: ' + attributes.join(' ') + ' }');
    };
  })

  return $('div', $html).html();
}

mdFluxHTML.prototype.restore_bloc_attributes = function(md) {
  md = md.replace(/(\[n\]\{)/gmi, '\n{');

  return md;
}

mdFluxHTML.prototype.restore_inline_attributes = function(md, attributes) {
  for (var i = attributes.length - 1; i >= 0; i--) {
    a = attributes[i]
    if (a.src) {
      md = md.replace(a.uid+')', a.src+'){: '+a.attributes+' }')
    } else {
      md = md.replace(a.uid+')', a.href+'){: '+a.attributes+' }')
    }
  };
  return md;
}

module.exports = mdFlux;
