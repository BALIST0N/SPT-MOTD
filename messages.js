"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');

class MOTDMod
{
    constructor() 
    {
        this.messages = require("./messages.json");
        this.newday = false;

        var lastday = new Date(this.messages.lastday);
        var today = new Date();

        lastday = Date.UTC( lastday.getFullYear(), lastday.getMonth(), lastday.getDate() );
        today = Date.UTC( today.getFullYear(), today.getMonth(), today.getDate() );

        if ( Math.abs(lastday-today) > 0 )
        {   
            this.newday = true;

            today = new Date();
            let month = today.getMonth() + 1;

            this.messages.lastday = today.getFullYear() +"-" + month +"-"+ today.getDate();
        } 

    }

    messageSelector = function(messagesArray,countHistory)
    {
        let index = Math.floor(Math.random() * messagesArray.length);

        if( countHistory == true)
        {
            while(this.messages.messageHistory.includes(index) == true )
            {
                index = Math.floor(Math.random() * messagesArray.length)
            }
            this.messages.messageHistory.splice(0,0,index)
            if(this.messages.messageHistory.length > 7) { this.messages.messageHistory.pop() }
            this.messages.selectedMessage = messagesArray[ index ]

            return this.messages.selectedMessage;
        }

        return messagesArray[ index ]
    }

    postDBLoad(container) 
    {
        let LOCALES = container.resolve("DatabaseServer").getTables().locales.global;
        const MENU = container.resolve("DatabaseServer").getTables().locales.menu.en;
        let lang = Intl.DateTimeFormat().resolvedOptions().locale;

        let message;
        if(this.newday == true)
        {
            switch(lang)
            {
                case "ru-RU":
                    message = this.messageSelector(this.messages.Messages_ru, true)
                break;

                case "de-DE":
                    message = this.messageSelector(this.messages.Messages_de,true)
                break;

                default:
                    message = this.messageSelector(this.messages.Messages_en, true)
                break;
            }
        }


        let loadingMessage;
        switch(lang)
        {
            case "ru-RU":
                loadingMessage = this.messageSelector(this.messages.loadingMessages_en, false) // there is no loading messages in ru for the moment
                LOCALES = LOCALES.ru;
            break;

            case "de-DE":
                loadingMessage = this.messageSelector(this.messages.loadingMessages_de, false)
                LOCALES = LOCALES.de
            break;

            default:
                loadingMessage = this.messageSelector(this.messages.loadingMessages_en, false)
                LOCALES = LOCALES.en
            break;
        }


        //Replaces title of Orange Box with motd
        LOCALES["Attention! This is a Beta version of Escape from Tarkov for testing purposes."] = "Message of the Day!";
        LOCALES["NDA free warning"] = message ?? this.messages.selectedMessage; 
        LOCALES["Profile data loading..."] = loadingMessage;
        MENU["Profile data loading..."] = loadingMessage;

        fs.writeFileSync("./user/mods/welcomeMessages/messages.json", JSON.stringify(this.messages, null, 4) );
    }


}

module.exports = { mod: new MOTDMod() };
