import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.deleteEmptyKeys = (hymnObj) => {
    for (let tmpMeasureNum in hymnObj) {
      let tmpMeasure = hymnObj[tmpMeasureNum];
      // console.table(tmpMeasure)
      for (let key in tmpMeasure) {
        if (toolbox.isNoteColumn(key) && tmpMeasure[key].toString().split(',').join('').length === 0) {
          delete tmpMeasure[key]
        }
      }

      for (let key in tmpMeasure) {
        let line = tmpMeasure[key];
        let tmpArray = new Array(tmpMeasure.measure.length)
        // console.log(line)
        for (let i in line) {

          if (line[i].toString().length) {
            // console.log(line[i].length)
            tmpArray[i] = line[i];
          }
          // console.log()
          // console.log(line[i], ":", line[i].length)
          // if(line[i].length === 0)tmpMeasure[key][i] = null;
        }
        // console.log(line)
        tmpMeasure[key] = tmpArray
      }
      // console.table(tmpMeasure)
      // process.exit();
    }

    return hymnObj;
  }
}