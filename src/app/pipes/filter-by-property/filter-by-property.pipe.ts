import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByProperty'
})
export class FilterByPropertyPipe implements PipeTransform {
  transform(items: any[], filterText: string, property: string): any {
    // If no items/property/filter text was passed then returning all items
    if (!items || !filterText) {
      return items;
    }
    // Converting filter text to lower case so we find matches
    filterText = filterText.toLowerCase();
    // If property is provided then searching object by this property
    if (property) {
      // Filtering list by provided property
      return items.filter(item => item[property].includes(filterText));
    } else {
      // Otherwise filtering list as string
      return items.filter((item: string) => item.toLowerCase().includes(filterText));
    }
  }
}
