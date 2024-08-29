/* eslint-disable no-console */
const { exec } = require('child_process')
const fs = require('fs')

const generate = async () => {
  const args = process.argv.slice(2).reduce((acc, curr) => {
    const [param, value] = curr.split('=')
    return {
      ...acc,
      [param.replace(/^--/, '')]: value,
    }
  }, {})
  const { input, android, ios } = args

  if (!input) throw new Error('Missing input folder argument')

  const generateIos = !!ios
  const generateAndroid = !!android

  // if (!android) throw new Error('Missing android output folder argument')
  // if (!ios) throw new Error('Missing ios output folder argument')

  const files = fs.readdirSync(input)

  if (generateIos) {
    if (!fs.existsSync(ios)) throw new Error('iOS output folder does not exist')
    const iosIconsFolder = `${ios}/Images.xcassets/icons`
    if (!fs.existsSync(iosIconsFolder)) {
      fs.mkdirSync(iosIconsFolder)
    }

    files.forEach(file => {
      const [name] = file.split('.')
      fs.mkdirSync(`${iosIconsFolder}/${name}.imageset`)
      const content = {
        images: [
          {
            filename: file,
            idiom: 'universal',
          },
        ],
        info: {
          author: 'xcode',
          version: 1,
        },
      }
      fs.writeFileSync(
        `${iosIconsFolder}/${name}.imageset/Contents.json`,
        JSON.stringify(content, null, 2),
      )
      fs.copyFileSync(`${input}/${file}`, `${iosIconsFolder}/${name}.imageset/${file}`)
    })
  }

  if (generateAndroid) {
    if (!fs.existsSync(android)) throw new Error('Android output folder does not exist')

    const androidIconsFolder = `${android}/app/src/main/res/drawable`

    await new Promise((resolve, reject) => {
      exec(`npx vd-tool -c -in ${input} -out ${androidIconsFolder}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          reject(err)
          return
        }
        console.log(stdout)
        resolve(stdout)
      })
    })

    const androidVectors = fs.readdirSync(androidIconsFolder)
    androidVectors.forEach(file => {
      const [name, ext] = file.split('.')
      fs.renameSync(
        `${androidIconsFolder}/${file}`,
        `${androidIconsFolder}/${name.replaceAll('-', '_')}.${ext}`,
      )
    })
  }

  console.log('Icons generated')
}

generate()
