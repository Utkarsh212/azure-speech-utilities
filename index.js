import * as sdk from "microsoft-cognitiveservices-speech-sdk"

/**
 * Creates a new speech recognizer instance.
 *
 * @param {string} [cogSvcSubKey=""] - Your Cognitive Services subscription key for Speech Services. (Required, default is "")
 * @param {string} [cogSvcRegion=""] - The region for your Cognitive Services subscription. (Required, default is "")
 * @param {string[]} [recognitionLang=["en-US"]] - An array of language recognition codes. (Optional, default is ["en-US"])
 * @returns {sdk.SpeechRecognizer|undefined} - The speech recognizer instance, or undefined if errors occur.
 * @throws {Error} - If an error occurs during configuration.
 */
export function CreateRecognizer(cogSvcSubKey = "", cogSvcRegion = "", recognitionLang = ["en-US"]) {
    if (!cogSvcSubKey || !cogSvcRegion) {
        console.error("Please provide speech key and region.")
        return undefined
    }

    if (!recognitionLang.length) {
        console.error("Please provide recognition language.")
        return undefined
    }

    let speechConfig = null
    let audioConfig = null
    let recognizer = null

    try {
        if (recognitionLang.length > 1) {
            speechConfig = sdk.SpeechConfig.fromEndpoint(new URL(`wss://${cogSvcRegion}.stt.speech.microsoft.com/speech/universal/v2`), cogSvcSubKey)
            speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_LanguageIdMode, "Continuous")
            const autoDetectSourceLanguageConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages(recognitionLang)
            recognizer = sdk.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, sdk.AudioConfig.fromMicrophoneInput())
        } else {
            speechConfig = sdk.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion)
            speechConfig.speechRecognitionLanguage = recognitionLang[0]
            audioConfig = sdk.AudioConfig.fromMicrophoneInput()
            recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
        }
        return recognizer
    } catch (error) {
        console.error(error)
        return undefined
    }
}

/**
 * Performs speech recognition once and returns the recognized text.
 *
 * @param {sdk.SpeechRecognizer} [recognizer] - The speech recognizer instance to use.
 * @returns {Promise<{type: "text", message: string}| {type: "error", message: string}>} - A promise that resolves with the recognized text or an error message.
 */
export async function RecognizeOnceAsync(recognizer = undefined) {
    return new Promise((resolve, reject) => {
        if (!recognizer) {
            reject({ type: "error", message: "ERROR: Unable to find recognizer." })
        }

        recognizer.recognizeOnceAsync(result => {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                resolve({ type: "text", message: result.text })
            } else {
                reject({ type: "error", message: "ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly." })
            }
        })
    })
}

/**
 * Starts continuous speech recognition and provides callbacks for recognized and recognizing events.
 *
 * @param {sdk.SpeechRecognizer} [recognizer] - The speech recognizer instance to use.
 * @param {(value: string) => void} [callbackRecognized=(value) => console.log(value)] - A callback function called with recognized text.
 * @param {(value: string) => void} [callbackRecognizing=(value) => console.log(value)] - A callback function called while speech is being recognized.
 * @returns {Promise<{type: "success", message: string} | {type: "error", message: string}>} - A promise that resolves with a success message or an error message.
 */
export async function ContinuousRecognitionAsync(recognizer = undefined, callbackRecognized = (value) => { console.log(value) }, callbackRecognizing = (value) => { console.log(value) }) {
    return new Promise((resolve, reject) => {

        if (!recognizer) {
            reject({ type: "error", message: "ERROR: Unable to find recognizer." })
        }

        recognizer.startContinuousRecognitionAsync()

        recognizer.recognizing = (s, e) => {
            callbackRecognizing(e.result.text)
        }

        recognizer.recognized = (s, e) => {
            if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
                callbackRecognized(e.result.text)
            }
            else if (e.result.reason == sdk.ResultReason.NoMatch) {
                console.log("NOMATCH: Speech could not be recognized.")
            }
        }

        recognizer.canceled = (s, e) => {
            console.log(`CANCELED: Reason=${e.reason}`)

            if (e.reason == sdk.CancellationReason.Error) {
                console.log(`"CANCELED: ErrorCode=${e.errorCode}`)
                console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`)
                console.log("CANCELED: Did you set the speech resource key and region values?")
            }

            recognizer.stopContinuousRecognitionAsync()
        }

        recognizer.sessionStopped = (s, e) => {
            console.log("\n    Session stopped event.")
            recognizer.stopContinuousRecognitionAsync()
        }

        resolve({ type: "success", message: "Continuous recognition started successfully." })
    })
}

/**
 * Stops ongoing continuous speech recognition.
 *
 * @param {sdk.SpeechRecognizer} [recognizer] - The speech recognizer instance to use.
 * @returns {void}
 */
export function StopContinuousRecognitionAsync(recognizer = undefined) {
    if (!recognizer) {
        console.error("ERROR: Unable to find recognizer.")
        return
    }
    recognizer.stopContinuousRecognitionAsync()
}