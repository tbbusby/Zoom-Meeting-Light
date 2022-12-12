
'use strict';

let AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
let AlexaResponse = require("./alexa/skills/smarthome/AlexaResponse");
const Alexa = require('ask-sdk-core');
const invocationName = "zoom meeting light";
const { CallTracker } = require('assert');
const fs = require('fs');
const webhookfile = fs.readFileSync('./ZoomWebhook.json', 'utf-8');
const webhook= JSON.parse(webhookfile);
const status= (webhook.payload.object.presence_status);

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        console.log("launch request");
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'you have launched the skill successfully, say what is my current status?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const zoomMeetingLightIntentHandler = {
    canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'zoomMeetingLightIntent';
    },
    handle(handlerInput) {
      if (status === 'Available') {
        exports.handler = async function (event, context) {
            // Dump the request for logging - check the CloudWatch logs
            console.log("index.handler request  -----");
            console.log(JSON.stringify(event));
        
            if (context !== undefined) {
                console.log("index.handler context  -----");
                console.log(JSON.stringify(context));
            }
        
            // Validate we have an Alexa directive
            if (!('directive' in event)) {
                let aer = new AlexaResponse(
                    {
                        "name": "ErrorResponse",
                        "payload": {
                            "type": "INVALID_DIRECTIVE",
                            "message": "Missing key: directive, Is request a valid Alexa directive?"
                        }
                    });
                return sendResponse(aer.get());
            }
        
        
            let namespace = ((event.directive || {}).header || {}).namespace;
        
            if (namespace.toLowerCase() === 'alexa.authorization') {
                let aar = new AlexaResponse({"namespace": "Alexa.Authorization", "name": "AcceptGrant.Response",});
                return sendResponse(aar.get());
            }
        
            if (namespace.toLowerCase() === 'alexa.discovery') {
                let adr = new AlexaResponse({"namespace": "Alexa.Discovery", "name": "Discover.Response"});
                let capability_alexa = adr.createPayloadEndpointCapability();
                let capability_alexa_powercontroller = adr.createPayloadEndpointCapability({"interface": "Alexa.PowerController", "supported": [{"name": "powerState"}]});
                adr.addPayloadEndpoint({"friendlyName": "Zoom Meeting Light", "endpointId": "", "capabilities": [capability_alexa, capability_alexa_powercontroller]});
                let capability_alexa_colorcontroller = adr.createPayloadEndpointCapability({"interface": "Alexa.ColorController", "supported": [{"name": "color"}]});
                adr.addPayloadEndpoint({"friendlyName": "Zoom Meeting Light", "endpointId": "", "capabilities": [capability_alexa, capability_alexa_colorcontroller]});
                return sendResponse(adr.get());
            }
        
            if (namespace.toLowerCase() === 'alexa.powercontroller') {
                let power_state_value = "OFF";
                if (event.directive.header.name === "TurnOn")
                    power_state_value = "ON";
        
                let endpoint_id = event.directive.endpoint.endpointId;
                let token = event.directive.endpoint.scope.token;
                let correlationToken = event.directive.header.correlationToken;
        
                let ar = new AlexaResponse(
                    {
                        "correlationToken": correlationToken,
                        "token": token,
                        "endpointId": endpoint_id
                    }
                );
                ar.addContextProperty({"namespace":"Alexa.PowerController", "name": "powerState", "value": power_state_value});
        
                // Check for an error when setting the state
                let state_set = sendDeviceState(endpoint_id, "powerState", power_state_value);
                if (!state_set) {
                    return new AlexaResponse(
                        {
                            "name": "ErrorResponse",
                            "payload": {
                                "type": "ENDPOINT_UNREACHABLE",
                                "message": "Unable to reach endpoint database."
                            }
                        }).get();
                }
        
                return sendResponse(ar.get());
            }
        //// what am i doing?
        if (namespace.toLowerCase() === 'alexa.colorcontroller') {
            let setColorGreen = { 
            "value": {
                "hue": 116.09,
                "saturation": 51.57,
                "brightness": 43.73
        
                }
            };
            if (event.directive.header.name === "SetColor")
            color = (setColorGreen)
        
            let endpoint_id = event.directive.endpoint.endpointId;
            let token = event.directive.endpoint.scope.token;
            let correlationToken = event.directive.header.correlationToken;
        
            let ar = new AlexaResponse(
                {
                    "correlationToken": correlationToken,
                    "token": token,
                    "endpointId": endpoint_id
                }
            );
            ar.addContextProperty({"namespace":"AlexaColorController", "name": "color", "value": setColorGreen
        });
        
            // Check for an error when setting the state
            let state_set = sendDeviceState(endpoint_id, "colorState", color);
            if (!state_set) {
                return new AlexaResponse(
                    {
                        "name": "ErrorResponse",
                        "payload": {
                            "type": "ENDPOINT_UNREACHABLE",
                            "message": "Unable to reach endpoint database."
                        }
                    }).get();
            }
        
            return sendResponse(ar.get());
        }
        //// end of what am i doing
        }
        
        function sendResponse(response)
        {
            // TODO Validate the response
            console.log("index.handler response -----");
            console.log(JSON.stringify(response));
            return response
        }
        
        function sendDeviceState(endpoint_id, state, value) {
            let dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
        
            let key = state + "Value";
            let attribute_obj = {};
            attribute_obj[key] = {"Action": "PUT", "Value": {"S": value}};
        
            let request = dynamodb.updateItem(
                {
                    TableName: "SampleSmartHome",
                    Key: {"ItemId": {"S": endpoint_id}},
                    AttributeUpdates: attribute_obj,
                    ReturnValues: "UPDATED_NEW"
                });
        
            console.log("index.sendDeviceState request -----");
            console.log(request);
        
            let response = request.send();
        
            console.log("index.sendDeviceState response -----");
            console.log(response);
            return true;
        }
          const speakOutput = "The light is green.";
          console.log ("The light is green.")
              return handlerInput.responseBuilder
                  .speak(speakOutput)
                  .getResponse();
              } 
            }
        };
        const HelpIntentHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
            },
            handle(handlerInput) {
                const speakOutput = 'You can say hello to me! How can I help?';
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        };
        
        const CancelAndStopIntentHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
            },
            handle(handlerInput) {
                const speakOutput = 'Goodbye!';
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
            }
        };
        /* *
         * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
         * It must also be defined in the language model (if the locale supports it)
         * This handler can be safely added but will be ingnored in locales that do not support it yet 
         * */
        const FallbackIntentHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
            },
            handle(handlerInput) {
                const speakOutput = 'Sorry, I don\'t know about that. Please try again.';
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        };
        /* *
         * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
         * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
         * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
         * */
        const SessionEndedRequestHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
            },
            handle(handlerInput) {
                    const reason = handlerInput.requestEnvelope.request.reason;
                console.log("==== SESSION ENDED WITH REASON ======");
                console.log(reason); 
                console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
                // Any cleanup logic goes here.
                return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
            }
        };
        /* *
         * The intent reflector is used for interaction model testing and debugging.
         * It will simply repeat the intent the user said. You can create custom handlers for your intents 
         * by defining them above, then also adding them to the request handler chain below 
         * */
        const IntentReflectorHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
            },
            handle(handlerInput) {
                const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
                const speakOutput = `You just triggered ${intentName}`;
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                    .getResponse();
            }
        };
        /**
         * Generic error handling to capture any syntax or routing errors. If you receive an error
         * stating the request handler chain is not found, you have not implemented a handler for
         * the intent being invoked or included it in the skill builder below 
         * */
        const ErrorHandler = {
            canHandle(handlerInput, error) {
                return true;
            },
            handle(handlerInput, error) {
                console.log("==== ERROR =====")
                console.log(error)
                const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
                console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        };
        
        /**
         * This handler acts as the entry point for your skill, routing all request and response
         * payloads to the handlers above. Make sure any new handlers or interceptors you've
         * defined are included below. The order matters - they're processed top to bottom 
         * */
        exports.handler = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                LaunchRequestHandler,
                exportsHandeler,
                zoomMeetingLightIntentHandler,
                HelpIntentHandler,
                CancelAndStopIntentHandler,
                FallbackIntentHandler,
                SessionEndedRequestHandler,
                IntentReflectorHandler)
            .addErrorHandlers(ErrorHandler)
            .lambda();
