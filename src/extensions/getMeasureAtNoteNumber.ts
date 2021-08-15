import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.measureAtNoteNumber =  (ahMusicObject, noteNumber) => {
    let noteNumCounter = 0;
    // ahMusicObject.map(measure => {
    let tmp = [...ahMusicObject]
    while (tmp.length) {
      let measure = tmp.shift()
      let measureKeys = Object.keys(measure);
      // console.log(measure.measure[0])
      outerLoop:
      while (measureKeys.length) {
        let columnName = measureKeys.shift();
        if (toolbox.isNoteColumn(columnName)) {
          let column = measure[columnName];
          // console.log(column, noteNumCounter)
          let i = -1;
          while(++i < column.length) {
            if (measure.measure[i] !== undefined) noteNumCounter++;
            if (noteNumber === noteNumCounter) {
              return measure.measure[0]
            }
          }
          // console.log(noteNumCounter)
          break outerLoop;
        }
      }
      // Object.keys(measure).map(columnName=>{

      // })
      // })
    }
    return 0
  }
}