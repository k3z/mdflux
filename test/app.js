var md = '## de Finibus Bonorum et Malorum\n\n![Sed ut perspiciatis](pg14.jpg){: class="img-small pull-right"}Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi **[architecto beatae vitae](https://en.wikipedia.org/wiki/Architect){: class="text-success" }** dicta sunt explicabo. _Nemo enim ipsam voluptatem quia voluptas_ sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. [architecto beatae vitae](https://en.wikipedia.org/wiki/Architect.){: class="text-success" }\n{: class="lead"}\n\n### Neque porro {: class="text-danger"}\n\n![Sed ut perspiciatis](pg14.jpg){: class="img-responsive"}\n{: class="pull-block-left"}\n\nNeque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. {: nothing to do here }Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, *vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?*\n\n';


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
  parser.setHTMLParser(function(html) { return toMarkdown(html, { gfm: true }) });

  var html = parser.toHTML(md);

  $('#html').html(html);

  md = parser.toMarkdown(html);
  $('#md-convert').html(md);

  html = parser.toHTML(md);
  $('#html-convert').html(html);
});



