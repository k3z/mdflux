var tweet = '<mdflux class="mdflux-widget-code"><blockquote class="twitter-tweet" data-lang="fr"><p lang="fr" dir="ltr">C&#39;est décidé je m&#39;abonne ! <a href="https://twitter.com/hashtag/nouveauPolitis?src=hash">#nouveauPolitis</a> à partir de 5€/mois ! <a href="https://twitter.com/hashtag/PresseInd%C3%A9pendante?src=hash">#PresseIndépendante</a> <a href="https://t.co/9xpNvKCpHE">https://t.co/9xpNvKCpHE</a> <a href="https://t.co/X3ZP1CI2fm">pic.twitter.com/X3ZP1CI2fm</a></p>&mdash; Politis (@Politis_fr) <a href="https://twitter.com/Politis_fr/status/691649998354829312">25 Janvier 2016</a></blockquote><script async src="http://platform.twitter.com/widgets.js" charset="utf-8"></script></mdflux>';
var facebook = '<div class="fb-post" data-href="https://www.facebook.com/Le4emeSinge/posts/994751437237304" data-width="500"><div class="fb-xfbml-parse-ignore"><blockquote cite="https://www.facebook.com/Le4emeSinge/posts/994751437237304"><p>&quot;Une v&#xe9;ritable &#xab; guerre des graines &#xbb; semble s&#x2019;&#xea;tre enclench&#xe9;e en r&#xe9;action &#xe0; l&#x2019;accaparement du patrimoine agricole par...</p>Posté par <a href="https://www.facebook.com/Le4emeSinge/">Le 4ème singe</a> sur&nbsp;<a href="https://www.facebook.com/Le4emeSinge/posts/994751437237304">dimanche 21 février 2016</a></blockquote></div></div>';
var md = '## de Finibus Bonorum et Malorum\n\n![Sed ut perspiciatis](pg14.jpg){: class="img-small pull-right" data-title="credits"}Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi **[architecto beatae vitae](https://en.wikipedia.org/wiki/Architect){: class="text-success" }** dicta sunt explicabo. _Nemo enim ipsam voluptatem quia voluptas_ sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. [architecto beatae vitae](https://en.wikipedia.org/wiki/Architect.){: class="text-success" }\n{: class="lead"}\n\n### Neque porro {: class="text-danger"}\n\n![Sed ut perspiciatis](pg14.jpg){: class="img-responsive"}\n{: class="pull-block-left"}\n\nNeque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. {: nothing to do here }Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, *vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?* Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n' + tweet;


$(function() {
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  });

  $('#md').text(md);

  var parser = new mdFlux();

  parser.setMarkdownParser(marked);
  parser.setHTMLParser(function(html) { return toMarkdown(html, {
    gfm: true
  }) });


  parser.addToHTMLPreprocessor('mdflux-widget-code', function(md, namespace, parser) {
    var matches = [];
    var re = /(<mdflux(?=[^>]*class="mdflux-widget-code")[^>]*>.*?<\/mdflux>)/gm;
    var m;

    while ((m = re.exec(md)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        var uid = parser.mdflux.uniqid();
        matches.push({
          'source': m[0],
          'replace': '[mdflux-widget-code-'+uid+']'
        })
        md = md.replace(m[0], '[mdflux-widget-code-'+uid+']')
    }

    parser.processorsSharedSpace[namespace] = matches;

    return md;
  })

  parser.addToHTMLPostprocessor('mdflux-widget-code', function(html, namespace, parser) {
    parser.processorsSharedSpace[namespace].forEach(function(code) {
      html = html.replace(code['replace'], code['source'])
    })
    return html;

  })

  parser.addToMarkdownPreprocessor('mdflux-widget-code', function(html, namespace, parser) {
    var matches = [];
    var re = /(<mdflux(?=[^>]*class="mdflux-widget-code")[^>]*>.*?<\/mdflux>)/gm;
    var m;

    while ((m = re.exec(html)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        var uid = parser.mdflux.uniqid();
        matches.push({
          'source': m[0],
          'replace': '[mdflux-widget-code-'+uid+']'
        })
        html = html.replace(m[0], '[mdflux-widget-code-'+uid+']')
    }

    parser.processorsSharedSpace[namespace] = matches;

    return html;
  })

  parser.addToMarkdownPostprocessor('mdflux-widget-code', function(md, namespace, parser) {
    parser.processorsSharedSpace[namespace].forEach(function(code) {
      md = md.replace(code['replace'], code['source'])
    })
    return md;

  })

  var html = parser.toHTML(md);

  $('#html').html(html);

  md = parser.toMarkdown(html);
  $('#md-convert').text(md);

  html = parser.toHTML(md);
  $('#html-convert').html(html);
});



