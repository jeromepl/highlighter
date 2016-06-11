var selection = window.getSelection();

console.log(selection);

if(selection.toString()) { //If there is text selected

    var container = $(selection.getRangeAt(0).commonAncestorContainer);
    while(!container.html()) { //sometimes the element will only be text. Get the parent in that case
        container = container.parent();
    }

    var anchor = $(selection.anchorNode);
    var content = container.html();
    var pattern;
    var replaceWith = '$1<span style="background-color: yellow;">$2</span>$3';

    if(selection.toString().length > anchor.text().length - selection.anchorOffset) { //If it's in more than one html element
        var lengthInAnchor = anchor.text().length - selection.anchorOffset;
        pattern = new RegExp('(.*)(' + escapeRegExp(selection.toString().substring(0, lengthInAnchor)) + ')(.*)','g');
        //NOTE: this will only highlight the text in the first html element. Not the one in the rest
    }
    else {
        pattern = new RegExp('(.*)(' + escapeRegExp(selection.toString()) + ')(.*)','g');
    }

    content = content.replace(pattern, replaceWith);
    container.html(content);
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
