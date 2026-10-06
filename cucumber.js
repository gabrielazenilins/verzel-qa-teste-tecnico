module.exports = {
    default: {
        paths: ['features/**/*.feature'],
        require: ['support/**/*.js', 'steps/**/*.js'],
        tags: 'not @manual',
        format: [
            'progress-bar',
            'html:reports/cucumber-report.html',
            'json:reports/cucumber-report.json'
        ],
        formatOptions: { snippetInterface: 'async-await' }
    }
}
