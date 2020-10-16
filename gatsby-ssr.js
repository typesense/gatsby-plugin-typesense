const cheerio = require('cheerio')

exports.onRenderBody = ({pathname, bodyHtml, ...hash}) => {
    if (!bodyHtml) return

    console.log(pathname)
    const $ = cheerio.load(bodyHtml)
    console.log($('h1').text())
    $('p').each(function () {
        console.log($(this).text())
    })

    console.log('Done')

    // console.log(pathname)
    // console.log(bodyHtml)
}
