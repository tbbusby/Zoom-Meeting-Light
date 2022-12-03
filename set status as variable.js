let webhook = 
{
    "payload": {
        "account_id": "",
        "object": {
           "presence_status": "Offline",
           "date_time": "",
           "id": "",
           "email": "",
        }
    } ,
    "event_ts": "",
    "event": ""   
}

let presence_status= (webhook.payload.object.presence_status);

console.log (presence_status);