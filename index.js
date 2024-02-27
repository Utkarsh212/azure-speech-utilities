import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

/**
 * Perform a single speech recognition operation.
 * @param {string} [cogSvcSubKey=""] - The subscription key for the Speech service. Default is an empty string.
 * @param {string} [cogSvcRegion=""] - The region for the Speech service. Default is an empty string.
 * @param {string[]} [recognitionLang=["en-US"]] - Array of language codes for recognition. Default is ["en-US"].
 * @returns {Promise<{type: string, message: string}>} A Promise that resolves with recognized text or rejects with an error.
 */
export async function RecognizeOnceAsync(cogSvcSubKey = "", cogSvcRegion = "", recognitionLang = ["en-US"]) {
    return new Promise((resolve, reject) => {

        if (!cogSvcSubKey || !cogSvcRegion) {
            reject({ type: "error", message: 'Please provide speech key and region.' })
        }

        if (!recognitionLang.length) {
            reject({ type: "error", message: 'Please provide recognition language.' })
        }

        let speechConfig = null
        let audioConfig = null
        let recognizer = null

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

        recognizer.recognizeOnceAsync(result => {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                resolve({ type: "text", message: result.text })
            } else {
                reject({ type: "error", message: 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.' })
            }
        })
    })
}

/**
 * Perform continuous speech recognition.
 * @param {string} [cogSvcSubKey=""] - The subscription key for the Speech service. Default is an empty string.
 * @param {string} [cogSvcRegion=""] - The region for the Speech service. Default is an empty string.
 * @param {function} [callback=(value) => { console.log(value) }] - Callback function for recognized text. Default is a function that logs the value.
 * @param {string[]} [recognitionLang=["en-US"]] - Array of language codes for recognition. Default is ["en-US"].
 * @returns {Promise<{type: string, message: string}>} A Promise that resolves with recognized text or rejects with an error.
 */
export async function ContinuousRecognitionAsync(cogSvcSubKey = "", cogSvcRegion = "", callback = (value) => { console.log(value) }, recognitionLang = ["en-US"]) {
    return new Promise((resolve, reject) => {

        if (!cogSvcSubKey || !cogSvcRegion) {
            reject({ type: "error", message: 'Please provide speech key and region.' })
        }

        if (!recognitionLang.length) {
            reject({ type: "error", message: 'Please provide recognition language.' })
        }

        let speechConfig = null
        let audioConfig = null
        let recognizer = null

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

        recognizer.startContinuousRecognitionAsync()

        recognizer.recognizing = (s, e) => {
            callback(e.result.text)
        }

        recognizer.recognized = (s, e) => {
            if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
                resolve({ type: "text", message: e.result.text })
                recognizer.stopContinuousRecognitionAsync()
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
    })
}