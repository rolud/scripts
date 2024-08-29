const fs = require('fs')
const path = require('path')

const supportedLanguages = ['it']
const basePath = path.join(__dirname, '..', 'packages', 'translations', 'src', 'resources')
const filesPath = supportedLanguages.map(lang => path.join(basePath, `${lang}.json`))

filesPath.forEach(filePath => {
  const translations = require(filePath).translation

  let sortedTranslations = {}
  Object.keys(translations)
    .sort((a, b) => a.localeCompare(b))
    .forEach(key => {
      sortedTranslations[key] = translations[key]
    })

  sortedTranslations = {
    translation: sortedTranslations,
  }

  fs.writeFileSync(filePath, JSON.stringify(sortedTranslations, undefined, 2))
})
