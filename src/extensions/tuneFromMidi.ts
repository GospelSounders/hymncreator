const fs = require('fs-extra');
// const Midi = require('../modules/Midi');

import { GluegunToolbox } from 'gluegun'


module.exports = (toolbox: GluegunToolbox) => {
    toolbox.tunefromMidi = () => {
        let midiFilePath = toolbox.parameters.options.m;
        let fileBlob = fs.readFileSync(midiFilePath) // check if saved
        // console.log(midiFilePath);
        fileBlob;
        // let decoded = Midi.decode(fileBlob)
        // console.log(decoded)

    }
}
