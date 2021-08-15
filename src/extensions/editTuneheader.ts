import { GluegunToolbox, filesystem } from 'gluegun'
const yaml = require('js-yaml');
const to = require('await-to-js').to

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
  toolbox.edittuneheader = async (overwrite = true, number = false) => {
    if (!toolbox.parameters.options.t) {
      let [err, care] = await to(toolbox.getHymnHeader(number || toolbox.parameters.options.n))
      if (err) return toolbox.print.error(err)
      let hymnHeader = care;
      toolbox.parameters.options.t = hymnHeader.tune;
    }
    let defaultConfigs;
    let restofFile;
    try {
      let fileContents = filesystem.read(`tunes/${toolbox.parameters.options.h}/${toolbox.parameters.options.t}.md`)
      // let metafromFile = stripMeta(fileContents)
      restofFile = stripMeta(fileContents)
      if (fileContents) {
        // defaultConfigs = yaml.safeLoad(processMeta(fileContents));
        defaultConfigs = processMeta(fileContents);
      }
    } catch (err) {
      overwrite = true;
      defaultConfigs = toolbox.tunedefaults().headers;
    }
    let inputHeader = { tune: toolbox.parameters.options.t };
    let headerFields = {
      k: "key", m: "meter", c: "composer", y: "year", a: "arranger", aY: "arrangerYear", p: "anacrusis", mE: "meterError", tS: "timeSignature", "pf": "proofRead"
    }
    for (let key in toolbox.parameters.options) {
      let val = toolbox.parameters.options[key];
      if (headerFields[key]) inputHeader[headerFields[key]] = val;
    }
    let resultant;
    let proofRead: any = defaultConfigs.proofRead || defaultConfigs.proof_read || false;
    proofRead = proofRead ? parseInt(proofRead.toString()) : false;
    if (overwrite) {
      resultant = { ...defaultConfigs, ...inputHeader };
    } else {
      resultant = { ...inputHeader, ...defaultConfigs };
    }
    console.log(await toolbox.getHymnHeader(toolbox.parameters.options.n))
    console.log(resultant)
    outer:
    if (!proofRead || '0' === (inputHeader["proofRead"] !== undefined ? inputHeader["proofRead"].toString() : false)) {
      filesystem.write(`tunes/${toolbox.parameters.options.h}/${toolbox.parameters.options.t}.md`, `---\n${yaml.safeDump(resultant)}---\n${restofFile ? restofFile : ''}`);
      // save tuneHeader to hymnHeader
      let [err, care] = await to(toolbox.getHymnHeader(number));
      if (err) break outer;
      let tuneHeaderinHymnHeader = care.tuneheader || {}
      tuneHeaderinHymnHeader = {...tuneHeaderinHymnHeader, ... resultant}
      await toolbox.edithymnheader(true, number, resultant)
    } else {
      toolbox.print.error(`This song had been proofread. We can't make further changes until you change edit proof-reading flag to false using: hymncreator edithymnheader -h ${toolbox.parameters.options.h} -t ${toolbox.parameters.options.t} --pf 0`)
    }
  }
}