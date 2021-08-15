import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
    toolbox.getBlottedWords = (finalMeasuresArr) => {
        finalMeasuresArr = finalMeasuresArr.map(measure => {
            let numRows = measure.measure.filter(item => item !== undefined && item !== '')
            Object.keys(measure).map(column => {
                let test = column.match(/Stanza([0-9])*-Trk([0-9])*/)
                if (test) {
                    let stanza = test[1]
                    let track = test[2]
                    let ii = -1;
                    while (++ii < numRows) {
                        if (measure[`BlottedWords${stanza}-Trk${track}`]) {
                            if (measure[`BlottedWords${stanza}-Trk${track}`][ii] !== undefined && measure[`BlottedWords${stanza}-Trk${track}`][ii].trim().length > 0) {
                                measure[`Stanza${stanza}-Trk${track}`][ii] = measure[`BlottedWords${stanza}-Trk${track}`][ii]
                            }
                        }
                    }
                }
            })
            return measure
        })
        return finalMeasuresArr
    }
}
