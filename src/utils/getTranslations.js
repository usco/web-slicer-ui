import i18next from 'i18next'

const {create} = require('@most/create')

export const getTranslations = (translationPaths) => {
  return create((add, end, error) => {
    i18next.init({
      lng: 'en',
      resources: translationPaths
    }, (err, t) => {
      if (err) {
        error(err)
      } else {
        add(t)
      }
    })
  })
}
