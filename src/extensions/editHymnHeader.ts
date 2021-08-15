import { GluegunToolbox, filesystem } from 'gluegun'
const yaml = require('js-yaml');

const _metaRegex = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const _metaRegexYaml = /^\uFEFF?---([\s\S]*?)---/i;
const _s = require('underscore.string');

function cleanString(str, use_underscore) {
  const u = use_underscore || false;
  str = str.replace(/\//g, ' ').trim();
  if (u) {
    return _s.underscored(str);
  } else {
    return _s.trim(_s.dasherize(str), '-');
  }
}

// Clean object strings.
function cleanObjectStrings(obj) {
  let cleanObj = {};
  for (let field in obj) {
    if (typeof obj[field] === 'object') {
      cleanObj[cleanString(field, true)] = cleanObjectStrings(obj[field])
    } else {
      if (obj.hasOwnProperty(field)) {
        cleanObj[cleanString(field, true)] = ('' + obj[field]).trim();
      }
    }
  }
  return cleanObj;
}

// Get meta information from Markdown content
function processMeta(markdownContent) {
  let meta = {};
  let metaArr;
  let metaString;
  let metas;

  let yamlObject;

  switch (true) {
    case _metaRegex.test(markdownContent):
      metaArr = markdownContent.match(_metaRegex);
      metaString = metaArr ? metaArr[1].trim() : '';

      if (metaString) {
        metas = metaString.match(/(.*): (.*)/ig);
        metas.forEach(item => {
          const parts = item.split(': ');
          if (parts[0] && parts[1]) {
            meta[cleanString(parts[0], true)] = parts[1].trim();
          }
        });
      }
      break;

    case _metaRegexYaml.test(markdownContent):
      metaArr = markdownContent.match(_metaRegexYaml);
      metaString = metaArr ? metaArr[1].trim() : '';
      yamlObject = yaml.safeLoad(metaString);
      // console.log(yamlObject)
      meta = cleanObjectStrings(yamlObject);
      break;

    default:
    // No meta information
  }
  // console.log(meta)
  return meta;
}

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
  toolbox.edithymnheader = async (overwrite = true, number = false, tuneHeaderData = false) => {
    let defaultConfigs;
    let restofFile;
    try {
      let fileContents = filesystem.read(`hymns/${toolbox.parameters.options.h}/${number || toolbox.parameters.options.n}.md`)
      // console.log(fileContents)
      restofFile = stripMeta(fileContents)
      if (fileContents) {
        // defaultConfigs = yaml.safeLoad(processMeta(fileContents));
        defaultConfigs = processMeta(fileContents);
      }
    } catch (err) {
      overwrite = true;
      defaultConfigs = toolbox.hymndefaults().headers;
    }

    let inputHeader = { /*tune: toolbox.parameters.options.t */ };
    let headerFields = {
      T: "title", f: "firstline", pp: "topic", t: "tune", a: "author", k: "key", n: "hymnnumber", y: "year", S: "scripture", "St": "scriptureTexts", "Tr": "translater", "try": "translaterYear", "ss": "scriptureSong", "pf": "proofRead", "H": "hymnals", "bpr": "bodyProofReading"
    }
    for (let key in toolbox.parameters.options) {
      let val = toolbox.parameters.options[key];
      // console.log(val)
      if (headerFields[key]) inputHeader[headerFields[key]] = val;
    }
    if (tuneHeaderData) {
      inputHeader["tunedata"] = tuneHeaderData;
    }
    restofFile
    let resultant;
    let proofRead: any = defaultConfigs.proofRead || defaultConfigs.proof_read || false;
    proofRead = proofRead ? parseInt(proofRead.toString()) : false;
    let isbodyProofReading: any = inputHeader["bodyProofReading"] !== undefined ? inputHeader["bodyProofReading"].toString() : false;
    if (isbodyProofReading !== false) {
      let tmp = { bodyProofReading: inputHeader["bodyProofReading"] }
      inputHeader = tmp;
    }
    if (overwrite) {
      resultant = { ...defaultConfigs, ...inputHeader };
    } else {
      resultant = { ...inputHeader, ...defaultConfigs };
    }
    console.log(await toolbox.getTuneHeader(number||toolbox.parameters.options.n))
    console.log(resultant)
    if (resultant.hymnals && typeof resultant.hymnals === "string") {
      resultant.hymnals = JSON.parse(resultant.hymnals)
    }
    // console.log(JSON.parse(resultant.hymnals))
    if (!proofRead || '0' === (inputHeader["proofRead"] !== undefined ? inputHeader["proofRead"].toString() : false) || isbodyProofReading) {
      filesystem.write(`hymns/${toolbox.parameters.options.h}/${number || toolbox.parameters.options.n}.md`, `---\n${yaml.safeDump(resultant)}---\n${restofFile ? restofFile : ''}`);
    } else {
      toolbox.print.error(`This song had been proofread. We can't make further changes until you change edit proof-reading flag to false using: hymncreator edithymnheader -h ${toolbox.parameters.options.h} -n ${toolbox.parameters.options.n} --pf 0`)
    }
  }
}