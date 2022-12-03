const { CallTracker } = require('assert');
const fs = require('fs');
const webhookfile = fs.readFileSync('./ZoomWebhook.json', 'utf-8');
const webhook= JSON.parse(webhookfile);

const status= (webhook.payload.object.presence_status)

if (status === 'Available') {
    console.log ("The light is Green");
} else if (status === 'In_Meeting') {
    console.log ("The light is Red");
} else if (status === 'Offline') {
    console.log ("The light is Off");
} else if (status === 'Inactive') {
    console.log ("The light is Gray");
} else if (status === 'In_Calendar_Event') {
    console.log ("The light is Blue");
} else if (status === 'On_Phone-Call') {
    console.log ("The light is Crimson");
} else if (status === 'Do_Not_Disturb') {
    console.log ("The light is Orange");
}