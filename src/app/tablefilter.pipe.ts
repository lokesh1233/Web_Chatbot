import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tablefilter'
})
export class TablefilterPipe implements PipeTransform {

  // transform(value: any, args?: any): any {
  //   return null;
  // }

  transform(items: any, filter: any, defaultFilter?: boolean): any {
    if (!filter){
      return items;
    }
    debugger;

    if (!Array.isArray(items)){
      return items;
    }

    if (filter && Array.isArray(items)) {
      let filterKeys = []
      for (const [key, value] of Object.entries(filter)) {
        if(value != undefined && value != "")filterKeys.push(key);
      }
      if(filterKeys.length == 0){
        filterKeys = Object.keys(filter);
      }

      if (defaultFilter) {
        return items.filter(item =>
            filterKeys.reduce((x, keyName) =>
                (x && new RegExp(filter[keyName], 'gi').test(item[keyName])) || filter[keyName] == "", true));
      }
      else {
        return items.filter(item => {
          return filterKeys.some((keyName) => {
            console.log(keyName);
            if(Array.isArray(filter[keyName])){
              for(var v=0;v<filter[keyName].length;v++){
                if(new RegExp(filter[keyName][v], 'gi').test(item[keyName])){
                  return true;
                }
              }
              return false;
            }
            return new RegExp(filter[keyName], 'gi').test(item[keyName]) || filter[keyName] == "";
          });
        });
      }
    }
  }

}
