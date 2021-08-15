import { GluegunToolbox, filesystem } from 'gluegun'
// const yaml = require('js-yaml');
const to = require('await-to-js').to

const _metaRegex = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const _metaRegexYaml = /^\uFEFF?---([\s\S]*?)---/i;
// const _s = require('underscore.string');

// function cleanString(str, use_underscore) {
//   const u = use_underscore || false;
//   str = str.replace(/\//g, ' ').trim();
//   if (u) {
//     return _s.underscored(str);
//   } else {
//     return _s.trim(_s.dasherize(str), '-');
//   }
// }

// // Clean object strings.
// function cleanObjectStrings(obj) {
//   let cleanObj = {};
//   for (let field in obj) {
//     if (typeof obj[field] === 'object') {
//       cleanObj[cleanString(field, true)] = cleanObjectStrings(obj[field])
//     } else {
//       if (obj.hasOwnProperty(field)) {
//         cleanObj[cleanString(field, true)] = ('' + obj[field]).trim();
//       }
//     }
//   }
//   return cleanObj;
// }

// Get meta information from Markdown content
// function processMeta(markdownContent) {
//   let meta = {};
//   let metaArr;
//   let metaString;
//   let metas;

//   let yamlObject;

//   switch (true) {
//     case _metaRegex.test(markdownContent):
//       metaArr = markdownContent.match(_metaRegex);
//       metaString = metaArr ? metaArr[1].trim() : '';

//       if (metaString) {
//         metas = metaString.match(/(.*): (.*)/ig);
//         metas.forEach(item => {
//           const parts = item.split(': ');
//           if (parts[0] && parts[1]) {
//             meta[cleanString(parts[0], true)] = parts[1].trim();
//           }
//         });
//       }
//       break;

//     case _metaRegexYaml.test(markdownContent):
//       metaArr = markdownContent.match(_metaRegexYaml);
//       metaString = metaArr ? metaArr[1].trim() : '';
//       yamlObject = yaml.safeLoad(metaString);
//       // console.log(yamlObject)
//       meta = cleanObjectStrings(yamlObject);
//       break;

//     default:
//     // No meta information
//   }
//   // console.log(meta)
//   return meta;
// }

function stripMeta(markdownContent) {
  switch (true) {
    case _metaRegex.test(markdownContent):
      return markdownContent.replace(_metaRegex, '').trim();
    case _metaRegexYaml.test(markdownContent):
      return markdownContent.replace(_metaRegexYaml, '').trim();
    default:
      return markdownContent.trim();
  }
}

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.getTuneFromSavedFile = async (number=false) => {
    // let defaultConfigs;
    let restofFile: any;
    try {
      // let fileContents = filesystem.read(`tunes/${toolbox.parameters.options.h}/${toolbox.parameters.options.t.toUpperCase()}.md`)
      // // let metafromFile = stripMeta(fileContents)
      // restofFile = stripMeta(fileContents);
      let fileContents:any = true;
      if (fileContents) {
        let [err, care] = await to(toolbox.getTuneHeader(number||toolbox.parameters.options.n))
        err;
        // defaultConfigs = yaml.safeLoad(processMeta(fileContents));
        // defaultConfigs = processMeta(fileContents);
        // console.log(defaultConfigs);
        let { key, time_signature, anacrusis } = care;
        let pickups = anacrusis,
          timeSignature = time_signature;
        // console.log({ key, timeSignature, pickups })

        fileContents = filesystem.read(`hymns/${toolbox.parameters.options.h}/${number||toolbox.parameters.options.n}.md`)
        restofFile = stripMeta(fileContents);
        restofFile = restofFile.trim().split('\n\n');
        // console.log(restofFile.length)
        if (restofFile.length === 0) throw 'tune data not yet saved.'
        let finalMeasuresArr = []; // new Array(restofFile.length);
        restofFile.map(measure => {
          let measureObj = {};
          measure.split('\n').map(line => {
            let items = line.split('||')
            // console.log(line)
            measureObj[items.shift()] = items
            // console.log(items.shift())
          })
          if(Object.keys(measureObj).length <= 1)throw 'tune data not yet saved.'
          // finalMeasuresArr[parseInt(measureObj["measure"][0])] = measureObj
          measureObj["measure"] = measureObj["measure"].map(measure_=>parseInt(measure_))
          finalMeasuresArr.push(measureObj)
        })
        // console.log({finalMeasuresArr, key, timeSignature, pickups})
        finalMeasuresArr = toolbox.deleteEmptyKeys(finalMeasuresArr);
        return {finalMeasuresArr, key, timeSignature, pickups}
      }
    } catch (err) {
      throw err;
      // overwrite = true;
      // defaultConfigs = toolbox.tunedefaults().headers;
    }


    // process.exit();
    // let inputHeader = { tune: toolbox.parameters.options.t };
    // let headerFields = {
    //   k: "key", m: "meter", c: "composer", y: "year", a: "arranger", p: "anacrusis", mE: "meterError", tS: "timeSignature"
    // }
    // for (let key in toolbox.parameters.options) {
    //   let val = toolbox.parameters.options[key];
    //   if (headerFields[key]) inputHeader[headerFields[key]] = val;
    // }
    // let resultant;
    // if (overwrite) {
    //   resultant = { ...defaultConfigs, ...inputHeader };
    // } else {
    //   resultant = { ...inputHeader, ...defaultConfigs };
    // }
    // // console.log(resultant)
    // filesystem.write(`tunes/${toolbox.parameters.options.h}/${toolbox.parameters.options.t}.md`, `---\n${yaml.safeDump(resultant)}---\n${restofFile ? restofFile : ''}`);
    // return {}
  }
}