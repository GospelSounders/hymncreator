import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.trackOrderError = (finalMeasuresArr) => {
    finalMeasuresArr.map(measure => {
      let i = -1;
      while (++i < measure.noteTimes.length) {
        let notesAtPoint = [];
        for (let j in measure) {
          let columnName = j;
          // let checkStr;
          // try {
          //   checkStr = measure[j][i].toString();
          // } catch (err) {
          //   checkStr = '';
          // }
          // let areNotes = checkStr.includes(":");
          // if (areNotes) {
            if (toolbox.isNoteColumn(columnName) && measure[j][i]) {
            measure[j][i].split(';').map(singleNote => {
              notesAtPoint.push(parseInt(singleNote.split(':')[0]))
            })
            notesAtPoint.concat(toolbox.tracksfromNotePoint(measure[j][i]))
            // console.log(notesAtPoint)
            if (notesAtPoint.toString() !== notesAtPoint.sort().toString()) {
              if (measure.orderError == undefined) measure.orderError = new Array(measure.noteTimes.length)
              measure.orderError[i] = 1
            }
          }
        }
      }

    })
    return finalMeasuresArr;
  }
}