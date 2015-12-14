Helpers = {

  convertHtmlToText: function(html) {
    var text = "" + html;

    //-- remove BR tags and replace them with line break
    text=text.replace(/<br>/gi, "\n");
    text=text.replace(/<br\s\/>/gi, "\n");
    text=text.replace(/<br\/>/gi, "\n");

    //-- remove P and A tags but preserve what's inside of them
    text=text.replace(/<p.*?>/gi, "\n");
    //text=text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");
    text=text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, "");

    //-- remove all inside SCRIPT and STYLE tags
    text=text.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
    text=text.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
    //-- remove all else
    text=text.replace(/<(?:.|\s)*?>/g, "");

    //-- get rid of more than 2 multiple line breaks:
    text=text.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

    //-- get rid of more than 2 spaces:
    text = text.replace(/ +(?= )/g,'');

    //-- get rid of html-encoded characters:
    text=text.replace(/&nbsp;/gi," ");
    text=text.replace(/&amp;/gi,"&");
    text=text.replace(/&quot;/gi,'"');
    text=text.replace(/&lt;/gi,'<');
    text=text.replace(/&gt;/gi,'>');

    //-- return
    return text;
  }
}
