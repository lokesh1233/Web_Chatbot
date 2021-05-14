import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiSelectfilter'
})
export class MultiSelectfilterPipe implements PipeTransform {

  // transform(value: any, args?: any): any {
  //   return null;
  // }

  transform(items: any, multiFilter: any, defaultFilter?: boolean): any {
    debugger;
    if (!multiFilter){
      return items;
    }

    if (!Array.isArray(items)){
      return items;
    }

    if (multiFilter && Array.isArray(items)) {
      let filterKeys = Object.keys(multiFilter);

      if (defaultFilter) {
        return items.filter(item =>
            filterKeys.reduce((x, keyName) =>
                (x && new RegExp(multiFilter[keyName], 'gi').test(item[keyName])) || multiFilter[keyName] == "", true));
      }
      else {
        return items.filter(item => {
          return filterKeys.some((keyName) => {
            return new RegExp(multiFilter[keyName], 'gi').test(item[keyName]) || multiFilter[keyName] == "";
          });
        });
      }
    }
  }

}
