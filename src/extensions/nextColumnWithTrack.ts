import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  let ret: any = false;
  toolbox.nextTrackNote = (measure, noteNuminMeasure, track) => {
    try {
      track = parseInt(track)
    } catch (err) { }
    let index = noteNuminMeasure;
    let numColumnElements = measure.noteTimes.length;
    loop1:
    while (++index < numColumnElements) {
      for (let columnName in measure) {
        let column = measure[columnName]
        try {
          if (toolbox.isNoteColumn(columnName)) {
            let isFound = false;
            toolbox.trackandDurationsfromNotePoint(column[index]).map(item => {
              let track_ = item[0];
              if (track_ === track) {
                ret = [columnName, index];
                isFound = true;
              }
            })
            if(isFound)break loop1;

          }
        } catch (err) {
          console.error(err)
        }
      }
    }
    return ret;
  }
}