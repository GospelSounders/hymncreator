import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.printer = async (ahMusicObject, filters = false) => {
    if (!filters) {
      for (let tmpMeasure in ahMusicObject) {
        console.table(ahMusicObject[tmpMeasure])
      }
    }
  }
}