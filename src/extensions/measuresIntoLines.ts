import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  toolbox.measuresIntolines = (ahMusicObject, meter) => {
    console.log('putting measures into liens...')
    console.log(meter)
    return ahMusicObject;
  }
}