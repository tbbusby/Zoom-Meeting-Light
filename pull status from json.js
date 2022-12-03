const fs = require('fs');
const webhookfile = fs.readFileSync('./ZoomWebhook.json', 'utf-8');
const webhook= JSON.parse(webhookfile);

let status= (webhook.payload.object.presence_status)

const statusarray = [
    'Available',
    'In_Meeting',
    'Offline',
    'Inactive',
    'In_Calendar_Event',
    'On_Phone_Call',
    'Do_Not_Disturb'
]

if (status = 'Available') {
    console.log "The light is Green";
} else if (status = statusarray[1]) {
    console.log "The light is Red";
} else if (status = statusarray[2]) {
    console.log "The light is Off";
} else if (status = statusarray[3]) {
    console.log "The light is Gray";
} else if (status = statusarray[4]) {
    console.log "The light is Blue";
} else if (status = statusarray[5]) {
    console.log "The light is Crimson";
} else if (status = statusarray[1]) {
    console.log "The light is Orange";
}