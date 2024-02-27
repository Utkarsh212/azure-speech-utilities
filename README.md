# azure-speech-utilities

Provides a convenient abstraction layer over the Microsoft Cognitive Services Speech SDK, simplifying the integration of speech-to-text functionality into client applications. Using this npm package, developers can quickly integrate speech-to-text capabilities into their applications without the need to write intricate code.

## Features:
- Perform a single speech recognition operation with ease.
- Enable continuous speech recognition for real-time applications.
- Multilingual speech recognition.

## Installing

Using npm:

```js
npm install azure-speech-utilities
```

## Function Description

### RecognizeOnceAsync

Used for single-shot recognition, which recognizes a single utterance. The end of a single utterance is determined by listening for silence at the end or until a maximum of 15 seconds of audio is processed.

| Parameter | Type | Default Value | Description |
| :-------: | :--: | :-----------: | :----------: |
| cogSvcSubKey | string | "" | The subscription key for the Speech service. Default is an `empty string`. |
| cogSvcRegion | string | "" | The region for the Speech service. Default is an `empty string`. |
| recognitionLang | string[] | ["en-US"] | Array of language codes for recognition. Default is `["en-US"]`. |


### ContinuousRecognitionAsync

 The previous function performs single-shot recognition, which recognizes a single utterance. In contrast, you can use continuous recognition to get a real-time recognized text stream.

| Parameter | Type | Default Value | Description |
| :-------: | :--: | :-----------: | :----------: |
| cogSvcSubKey | string | "" | The subscription key for the Speech service. Default is an `empty string`. |
| cogSvcRegion | string | "" | The region for the Speech service. Default is an `empty string`. |
| callback | function | val => console.log(value) | Callback function for recognized text. Receives the recognized text as an argument. Default is a function that logs the value. |
| recognitionLang | string[] | ["en-US"] | Array of language codes for recognition. Default is `["en-US"]`. |

## Example

**Recognize Once**
```js
import { RecognizeOnceAsync } from "azure-speech-utilities"

const KEY = "AZURE_SPEECH_SERVICE_KEY"
const REGION = "AZURE_SPEECH_SERVICE_REGION"

async function recognizeSpeech() {
    try {
            const recognizeResponse = await RecognizeOnceAsync(KEY, REGION, ["Hi-IN"])
            if(recognizeResponse.type === "text") {
                console.log(recognizeResponse.message)
            } else {
                console.error(recognizeResponse.message)
            }
    } catch (error) {
        console.error(error)
    }
}
```
**Continuous Recognition**
```js
import { ContinuousRecognitionAsync } from "azure-speech-utilities"

const KEY = "AZURE_SPEECH_SERVICE_KEY"
const REGION = "AZURE_SPEECH_SERVICE_REGION"

function callback(text) {
    console.log("RECOGNIZED TEXT: ", text)
}

async function recognizeSpeech() {
    try {
            const recognizeResponse = await ContinuousRecognitionAsync(KEY, REGION, callback, ["Hi-IN", "en-US"])
            if(recognizeResponse.type === "text") {
                console.log(recognizeResponse.message)
            } else {
                console.error(recognizeResponse.message)
            }
    } catch (error) {
        console.error(error)
    }
}
```

## Contributing

This project welcomes contributions and suggestions.