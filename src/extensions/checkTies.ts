import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.checkTies = (ahMusicObject) => {
    ahMusicObject.map(measure => {
      let measureTrackDurations = {}
      let index = -1;
      let numColumnElements = measure.noteTimes.length;
      while (++index < numColumnElements) {
        // let noteDurations = [];
        // let noteDurations1 = [];
        for (let columnName in measure) {
          let column = measure[columnName]
          try {
            if (toolbox.isNoteColumn(columnName)) {
              // noteDurations = noteDurations.concat(toolbox.durationsfromNotePoint(column[index]))
              // console.log(toolbox.trackandDurationsfromNotePoint(column[index]))
              toolbox.trackandDurationsfromNotePoint(column[index]).map(item => {
                let track = item[0];
                let noteDuration = item[1];
                if (measureTrackDurations[track] === undefined) {
                  measureTrackDurations[track] = 0
                }
                // console.log()
                // noteDuration !== NaN ?
                measureTrackDurations[track] += noteDuration == 0 ? 0 : 1 / noteDuration;//: false;
              })

            }
          } catch (err) {
            console.error(err)
          }
        }
        // console.log(measureTrackDurations)
        let durations: any = [...Object.values(measureTrackDurations)];

        let greatestDuration = Math.max(...durations);
        for (let track in measureTrackDurations) {
          let trackDuration = measureTrackDurations[track];
          // let measureNum = measure.measure[0];
          let noteNuminMeasure = index;
          if (trackDuration < greatestDuration) {
            //  console.table(measure)
            // console.log(trackDuration, greatestDuration, noteNuminMeasure, measure.measure)
            measure = toolbox.insertTie(measure, noteNuminMeasure, track)
            ahMusicObject[measure.measure[0]] = measure
          }
        }
      }
    })
    return ahMusicObject;
  }
}