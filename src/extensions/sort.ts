import { GluegunToolbox } from 'gluegun'

/*
 * save body separately as csv
 */
module.exports = (toolbox: GluegunToolbox) => {

  toolbox.sort = (hymnObj) => {
    hymnObj = hymnObj.sort(function(a, b) { // ascending
      return a.measure[0] - b.measure[0]
    });
    return hymnObj;
  }
}