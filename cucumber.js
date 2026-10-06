const browser = (process.env.BROWSER || 'chromium').toLowerCase()

module.exports = {
    default: {
        paths: ['features/**/*.feature'],
        // world.js primeiro: o After dele (fecha o navegador) roda depois dos outros After
        require: ['support/world.js', 'support/**/*.js', 'steps/**/*.js'],
        tags: 'not @manual',
        format: [
            'progress-bar',
            `html:reports/cucumber-report-${browser}.html`,
            `json:reports/cucumber-report-${browser}.json`
        ],
        formatOptions: { snippetInterface: 'async-await' }
    }
}
