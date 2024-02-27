# azure-speech-utilities

Provides a convenient abstraction layer over the Microsoft Cognitive Services Speech SDK, simplifying the integration of speech-to-text functionality into client/browser applications. Using this package, developers can quickly integrate speech-to-text capabilities into their applications without the need to write intricate code.

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

### CreateRecognizer

Creates a new speech recognizer instance.

| Parameter | Type | Default Value | Description |
| :-------: | :--: | :-----------: | :----------: |
| cogSvcSubKey | string | `""` | The Cognitive Services subscription key for Speech Services. (Required, default is `empty string`) |
| cogSvcRegion | string | `""` | The region of Cognitive Services subscription. (Required, default is `empty string`) |
| recognitionLang | string[] | `["en-US"]` | An array of language recognition codes. (Optional, default is `["en-US"]`). |

### RecognizeOnceAsync

Used for single-shot recognition, which recognizes a single utterance. The end of a single utterance is determined by listening for silence at the end or until a maximum of 15 seconds of audio is processed.

| Parameter | Type | Default Value | Description |
| :-------: | :--: | :-----------: | :----------: |
| recognizer | sdk.SpeechRecognizer \| undefined | undefined | The speech `recognizer` instance to use. |


### ContinuousRecognitionAsync

 The previous function performs single-shot recognition, which recognizes a single utterance. In contrast, you can use continuous recognition to get a real-time recognized text stream. Make a call to [StopContinuousRecognitionAsync()](#stopcontinuousrecognitionasync) at some point to stop recognition

| Parameter | Type | Default Value | Description |
| :-------: | :--: | :-----------: | :----------: |
| recognizer | sdk.SpeechRecognizer \| undefined | undefined | The speech `recognizer` instance to use. |
| callbackRecognized | (value: string) => void | `val => console.log(value)` | A callback function called with recognized text. |
| callbackRecognizing | (value: string) => void | `val => console.log(value)` | A callback function called while speech is being recognized. |

### StopContinuousRecognitionAsync

Stops ongoing continuous speech recognition.

| Parameter | Type | Default Value | Description |
| :-------: | :--: | :-----------: | :----------: |
| recognizer | sdk.SpeechRecognizer \| undefined | undefined | The speech `recognizer` instance to use. |

**Note:** Use the same recognizer instance which you are using for [ContinuousRecognitionAsync()](#continuousrecognitionasync) as an argument to this function.

## Example

**Recognize Once**
```js
import { CreateRecognizer, RecognizeOnceAsync  } from "azure-speech-utilities"

const KEY = "AZURE_SPEECH_SERVICE_KEY"
const REGION = "AZURE_SPEECH_SERVICE_REGION"

async function recognizeSpeech() {
    const recognizer = CreateRecognizer(CGV_KEY, CGV_REGION, ["hi-IN"])
    try {
            const recognizedText = await RecognizeOnceAsync(recognizer)
            if (recognizedText.type === "text") {
                console.log(recognizedText.message)
            } else {
                console.log(recognizedText.message)
            }
    } catch (error) {
      console.error(error)
    }
}
```

**Continuous Recognition**
```js
import { CreateRecognizer, ContinuousRecognitionAsync } from "azure-speech-utilities"

const KEY = "AZURE_SPEECH_SERVICE_KEY"
const REGION = "AZURE_SPEECH_SERVICE_REGION"

// As there are 2 or more recognition languages "hi-IN" and "en-US" so it will be multilingual recognition.
const recognizer = CreateRecognizer(CGV_KEY, CGV_REGION, ["hi-IN", "en-US"])

function callbackRecognized(text) {
    console.log("RECOGNIZED: ", text)
}

function callbackRecognizing(text) {
    console.log("RECOGNIZING: ", text)
}

async function recognizeSpeech() {
    try {
            const response = await ContinuousRecognitionAsync(recognizer, callbackRecognized, callbackRecognizing)
            if (response.type === "success") {
                console.log(response.message)
            } else {
                console.error(response.message)
            }
    } catch (error) {
      console.error(error)
    }
}

function stopContinuousRecognition() {
    StopContinuousRecognitionAsync(recognizer)
}
```

## Contributing

This project welcomes contributions and suggestions.