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

// function stripMeta(markdownContent) {
//   switch (true) {
//     case _metaRegex.test(markdownContent):
//       return markdownContent.replace(_metaRegex, '').trim();
//     case _metaRegexYaml.test(markdownContent):
//       return markdownContent.replace(_metaRegexYaml, '').trim();
//     default:
//       return markdownContent.trim();
//   }
// }

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.getHymnHeader = async (number = false) => {
    let defaultConfigs;
    // let restofFile;
    try {
      let fileContents = filesystem.read(`hymns/${toolbox.parameters.options.h}/${number || toolbox.parameters.options.n}.md`)
      // restofFile = stripMeta(fileContents)
      
      if (fileContents) {
        // defaultConfigs = yaml.safeLoad(processMeta(fileContents));
        defaultConfigs = processMeta(fileContents);
      }
      return defaultConfigs
    } catch (err) {
      console.log(err)
      return {}
    }

   }
}