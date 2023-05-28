import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Src: https://gist.github.com/adamrecsko/0f28f474eca63e0279455476cc11eca7

@Pipe({ name: 'highlight' })
export class TextHighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }
  transform(text: string, search: string): SafeHtml {
    if (search && text) {
      let pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      pattern = pattern.split(' ').filter((t) => {
        return t.length > 0;
      }).join('|');
      const regex = new RegExp(pattern, 'gi');
      return this.sanitizer.bypassSecurityTrustHtml(
        text.replace(regex, (match) => `<span class="search-highlight">${match}</span>`)
      );

    } else {
      return text;
    }
  }
}
