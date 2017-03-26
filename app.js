var restify = require('restify');
var builder = require('botbuilder');


//=========================================================
// Bot Setup
//=========================================================


var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================


bot.dialog('/', [
    function(session) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else if (session.userData.language) {
            if (session.userData.language !== session.preferredLocale()) {
                session.preferredLocale(session.userData.language);
            }
            session.beginDialog('/askNeed');
        } else {
            session.preferredLocale('en');
            session.beginDialog('/localLanguage');
        }
    }
]);


bot.dialog('/profile', [
    function(session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function(session, results) {
        session.userData.name = results.response;
        session.send('Hello %s!', results.response);
        if (!session.preferredLocale) {
            session.beginDialog('/localLanguage');
        }
        //session.endDialog();
    }
]);


bot.dialog('/localLanguage', [
    function(session) {

        var textTranslate = session.localizer.gettext(session.preferredLocale(), "prefer-language");
        builder.Prompts.choice(session, textTranslate, 'English|Español|Italiano');

    },
    function(session, results) {

        var locale;
        switch (results.response.entity) {
            case 'English':
                locale = 'en';
            case 'Español':
                locale = 'es';
                break;
        }
        session.preferredLocale(locale, function(err) {
            if (!err) {
                // Locale files loaded
                session.userData.language = locale;
                var textTranslate = session.localizer.gettext(session.preferredLocale(), "your_prefer_language");
                session.endDialog(textTranslate, results.response.entity);
            } else {
                // Problem loading the selected locale
                session.error(err);
            }
        });
    }
]);

bot.dialog('/askNeed', [
    function(session) {
        var textTranslate = session.localizer.gettext(session.preferredLocale(), "ask-help");
        builder.Prompts.text(session, textTranslate);
    },
    function(session, results) {

    }
]);