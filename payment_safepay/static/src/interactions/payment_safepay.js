// console.log("SafePay payment_safepay.js loaded successfully");

// import { patch } from "@web/core/utils/patch";
// import { PaymentForm } from "@payment/interactions/payment_form";


// /* =========================================================
//    Global SafePay state
// ========================================================= */

// let microform = null;
// let trackerToken = null;
// let deviceCollectionCompleted = false;
// let enrollmentStarted = false;


// /* =========================================================
//    Decode JWT
// ========================================================= */

// function decodeJwt(token) {

//     try {

//         const parts = token.split(".");

//         if (parts.length !== 3) {
//             throw new Error("Invalid JWT format");
//         }

//         const payload = parts[1];

//         const base64 =
//             payload
//                 .replace(/-/g, "+")
//                 .replace(/_/g, "/");

//         return JSON.parse(
//             atob(base64)
//         );

//     } catch (error) {

//         console.error(
//             "SafePay JWT decode error:",
//             error
//         );

//         throw error;
//     }
// }


// /* =========================================================
//    Load SafePay Flex SDK + Card Fields
// ========================================================= */

// async function initializeSafePay(
//     trackerTokenValue,
//     captureContextJWT
// ) {

//     try {

//         trackerToken = trackerTokenValue;

//         console.log(
//             "SafePay Tracker Token:",
//             trackerToken
//         );


//         /* -----------------------------------------
//            Decode Capture Context
//         ----------------------------------------- */

//         const decoded =
//             decodeJwt(captureContextJWT);


//         console.log(
//             "SafePay Capture Context decoded"
//         );


//         const clientLibrary =
//             decoded?.ctx?.[0]?.data?.clientLibrary;


//         const clientLibraryIntegrity =
//             decoded?.ctx?.[0]?.data?.clientLibraryIntegrity;


//         if (!clientLibrary) {

//             console.error(
//                 "SafePay clientLibrary is missing"
//             );

//             return;
//         }


//         /* -----------------------------------------
//            Load Flex SDK
//         ----------------------------------------- */

//         await loadFlexSDK(
//             clientLibrary,
//             clientLibraryIntegrity
//         );


//         if (!window.Flex) {

//             console.error(
//                 "SafePay Flex SDK is unavailable"
//             );

//             return;
//         }


//         console.log(
//             "SafePay Flex SDK loaded"
//         );


//         /* -----------------------------------------
//            Create Flex Microform
//         ----------------------------------------- */

//         const flex =
//             new window.Flex(
//                 captureContextJWT
//             );


//         microform =
//             flex.microform();


//         /* -----------------------------------------
//            Card Number
//         ----------------------------------------- */

//         const number =
//             microform.createField(
//                 "number",
//                 {
//                     placeholder: "Card Number"
//                 }
//             );


//         /* -----------------------------------------
//            Security Code
//         ----------------------------------------- */

//         const securityCode =
//             microform.createField(
//                 "securityCode",
//                 {
//                     placeholder: "CVV"
//                 }
//             );


//         /* -----------------------------------------
//            Find containers
//         ----------------------------------------- */

//         const numberContainer =
//             document.getElementById(
//                 "number-container"
//             );


//         const securityCodeContainer =
//             document.getElementById(
//                 "securityCode-container"
//             );


//         if (
//             !numberContainer ||
//             !securityCodeContainer
//         ) {

//             console.error(
//                 "SafePay card field containers were not found"
//             );

//             return;
//         }


//         /* -----------------------------------------
//            Load card fields
//         ----------------------------------------- */

//         number.load(
//             "#number-container"
//         );


//         securityCode.load(
//             "#securityCode-container"
//         );


//         console.log(
//             "SafePay card fields loaded"
//         );


//         /* -----------------------------------------
//            Show Pay Securely button
//         ----------------------------------------- */

//         const button =
//             document.getElementById(
//                 "safepay-secure-btn"
//             );


//         if (!button) {

//             console.error(
//                 "SafePay Pay Securely button not found"
//             );

//             return;
//         }


//         button.style.display =
//             "block";


//         /* -----------------------------------------
//            Prevent duplicate listeners
//         ----------------------------------------- */

//         if (
//             button.dataset.safepayBound ===
//             "true"
//         ) {

//             return;
//         }


//         button.dataset.safepayBound =
//             "true";


//         /* -----------------------------------------
//            Button listener
//         ----------------------------------------- */

//         button.addEventListener(
//             "click",
//             generateTransientToken
//         );


//     } catch (error) {

//         console.error(
//             "SafePay initialization error:",
//             error
//         );

//         resetButton();
//     }
// }


// /* =========================================================
//    Load Flex SDK
// ========================================================= */

// function loadFlexSDK(
//     clientLibrary,
//     clientLibraryIntegrity
// ) {

//     return new Promise(
//         (resolve, reject) => {

//             /* -----------------------------------------
//                Already loaded
//             ----------------------------------------- */

//             if (window.Flex) {

//                 resolve();

//                 return;
//             }


//             /* -----------------------------------------
//                Existing script
//             ----------------------------------------- */

//             const existingScript =
//                 document.querySelector(
//                     'script[data-safepay-flex-sdk="true"]'
//                 );


//             if (existingScript) {

//                 existingScript.addEventListener(
//                     "load",
//                     resolve,
//                     { once: true }
//                 );


//                 existingScript.addEventListener(
//                     "error",
//                     reject,
//                     { once: true }
//                 );


//                 return;
//             }


//             /* -----------------------------------------
//                Create script
//             ----------------------------------------- */

//             const script =
//                 document.createElement(
//                     "script"
//                 );


//             script.src =
//                 clientLibrary;


//             script.async =
//                 true;


//             script.dataset.safepayFlexSdk =
//                 "true";


//             if (
//                 clientLibraryIntegrity
//             ) {

//                 script.integrity =
//                     clientLibraryIntegrity;


//                 script.crossOrigin =
//                     "anonymous";
//             }


//             script.onload =
//                 () => {

//                     console.log(
//                         "SafePay Flex SDK script loaded"
//                     );

//                     resolve();
//                 };


//             script.onerror =
//                 (error) => {

//                     console.error(
//                         "Failed to load SafePay Flex SDK",
//                         error
//                     );

//                     reject(error);
//                 };


//             document.head.appendChild(
//                 script
//             );

//         }
//     );
// }


// /* =========================================================
//    Generate Transient Token
// ========================================================= */

// async function generateTransientToken() {

//     if (!microform) {

//         console.error(
//             "SafePay Microform is not loaded yet"
//         );

//         return;
//     }


//     const button =
//         document.getElementById(
//             "safepay-secure-btn"
//         );


//     const processingMessage =
//         document.getElementById(
//             "safepay-processing"
//         );


//     const expMonth =
//         document.getElementById(
//             "expMonth"
//         )?.value;


//     const expYear =
//         document.getElementById(
//             "expYear"
//         )?.value;


//     if (
//         !expMonth ||
//         !expYear
//     ) {

//         console.error(
//             "Expiry month/year is missing"
//         );

//         return;
//     }


//     console.log(
//         "================================="
//     );


//     console.log(
//         "PAY SECURELY CLICKED"
//     );


//     console.log(
//         "================================="
//     );


//     if (button) {

//         button.disabled =
//             true;
//     }


//     if (processingMessage) {

//         processingMessage.style.display =
//             "block";
//     }


//     console.log(
//         "Generating SafePay transient token..."
//     );


//     /* -----------------------------------------
//        Reset state
//     ----------------------------------------- */

//     deviceCollectionCompleted =
//         false;

//     enrollmentStarted =
//         false;


//     /* -----------------------------------------
//        Create transient token
//     ----------------------------------------- */

//     microform.createToken(
//         {
//             expirationMonth:
//                 expMonth,

//             expirationYear:
//                 expYear
//         },

//         async function (
//             error,
//             transientToken
//         ) {

//             if (error) {

//                 console.error(
//                     "SafePay Tokenization Error:",
//                     error
//                 );

//                 resetButton();

//                 return;
//             }


//             console.log(
//                 "TRANSIENT TOKEN GENERATED"
//             );


//             console.log(
//                 "TRACKER TOKEN:",
//                 trackerToken
//             );


//             /* -----------------------------------------
//                Send transient token to Odoo
//             ----------------------------------------- */

//             try {

//                 const response =
//                     await fetch(
//                         "/payment/safepay/process_token",
//                         {
//                             method: "POST",

//                             headers: {
//                                 "Content-Type":
//                                     "application/json"
//                             },

//                             body: JSON.stringify({

//                                 tracker_token:
//                                     trackerToken,

//                                 transient_token:
//                                     transientToken

//                             })
//                         }
//                     );


//                 const result =
//                     await response.json();


//                 console.log(
//                     "PROCESS TOKEN RESPONSE:",
//                     result
//                 );


//                 if (!response.ok) {

//                     throw new Error(
//                         result?.error ||
//                         "SafePay process-token failed"
//                     );
//                 }


//                 if (!result.success) {

//                     throw new Error(
//                         result?.error ||
//                         "SafePay process-token unsuccessful"
//                     );
//                 }


//                 console.log(
//                     "SafePay transient token processed successfully."
//                 );


//                 /* -----------------------------------------
//                    Payer authentication setup
//                 ----------------------------------------- */

//                 const payerAuthentication =
//                     result.payer_authentication;


//                 if (
//                     !payerAuthentication
//                 ) {

//                     throw new Error(
//                         "SafePay payer authentication setup missing"
//                     );
//                 }


//                 const accessToken =
//                     payerAuthentication.access_token;


//                 const collectionUrl =
//                     payerAuthentication
//                         .device_data_collection_url;


//                 if (
//                     !accessToken ||
//                     !collectionUrl
//                 ) {

//                     throw new Error(
//                         "SafePay device collection information is incomplete"
//                     );
//                 }


//                 console.log(
//                     "SafePay payer authentication setup received."
//                 );


//                 console.log(
//                     "Device Collection URL:",
//                     collectionUrl
//                 );


//                 console.log(
//                     "READY FOR DEVICE FINGERPRINTING"
//                 );


//                 /* -----------------------------------------
//                    Start Cardinal device collection
//                 ----------------------------------------- */

//                 await performDeviceCollection(
//                     accessToken,
//                     collectionUrl
//                 );


//                 console.log(
//                     "DEVICE FINGERPRINTING SUBMITTED"
//                 );


//                 /*
//                  * Enrollment is triggered by the
//                  * Cardinal completion callback/message.
//                  */

//             } catch (error) {

//                 console.error(
//                     "SafePay Process Token Error:",
//                     error
//                 );

//                 resetButton();
//             }
//         }
//     );
// }


// /* =========================================================
//    Device Data Collection
// ========================================================= */

// function performDeviceCollection(
//     accessToken,
//     collectionUrl
// ) {

//     return new Promise(
//         (resolve, reject) => {

//             /* -----------------------------------------
//                Create unique session ID
//             ----------------------------------------- */

//             const sessionId =
//                 crypto.randomUUID();


//             console.log(
//                 "Starting Cardinal device data collection..."
//             );


//             console.log(
//                 "Device Fingerprint Session ID:",
//                 sessionId
//             );


//             /* -----------------------------------------
//                Save session ID
//             ----------------------------------------- */

//             window.safepayDeviceSessionId =
//                 sessionId;


//             /* -----------------------------------------
//                Create / reuse iframe
//             ----------------------------------------- */

//             let iframe =
//                 document.querySelector(
//                     'iframe[name="cardinal-frame"]'
//                 );


//             if (!iframe) {

//                 iframe =
//                     document.createElement(
//                         "iframe"
//                     );


//                 iframe.name =
//                     "cardinal-frame";


//                 iframe.style.display =
//                     "none";


//                 iframe.style.width =
//                     "0";


//                 iframe.style.height =
//                     "0";


//                 iframe.style.border =
//                     "0";


//                 document.body.appendChild(
//                     iframe
//                 );


//                 console.log(
//                     "Cardinal iframe created"
//                 );
//             }


//             /* -----------------------------------------
//                Create form
//             ----------------------------------------- */

//             const form =
//                 document.createElement(
//                     "form"
//                 );


//             form.method =
//                 "POST";


//             form.action =
//                 collectionUrl;


//             form.target =
//                 "cardinal-frame";


//             form.style.display =
//                 "none";


//             /* -----------------------------------------
//                JWT
//             ----------------------------------------- */

//             const jwt =
//                 document.createElement(
//                     "input"
//                 );


//             jwt.type =
//                 "hidden";


//             jwt.name =
//                 "JWT";


//             jwt.value =
//                 accessToken;


//             /* -----------------------------------------
//                MD / Session ID
//             ----------------------------------------- */

//             const md =
//                 document.createElement(
//                     "input"
//                 );


//             md.type =
//                 "hidden";


//             md.name =
//                 "MD";


//             md.value =
//                 sessionId;


//             /* -----------------------------------------
//                Add fields
//             ----------------------------------------- */

//             form.appendChild(
//                 jwt
//             );


//             form.appendChild(
//                 md
//             );


//             document.body.appendChild(
//                 form
//             );


//             /* -----------------------------------------
//                Listen for Cardinal completion
//             ----------------------------------------- */

//             let timeoutId = null;


//             const cleanup =
//                 () => {

//                     window.removeEventListener(
//                         "message",
//                         messageHandler
//                     );


//                     if (timeoutId) {

//                         clearTimeout(
//                             timeoutId
//                         );
//                     }


//                     if (form.parentNode) {

//                         form.parentNode.removeChild(
//                             form
//                         );
//                     }
//                 };


//             const messageHandler =
//                 (event) => {

//                     /*
//                      * Only accept messages from
//                      * Cardinal's trusted domain.
//                      */

//                     if (
//                         event.origin !==
//                         "https://cas.client.cardinaltrusted.com"
//                     ) {

//                         return;
//                     }


//                     console.log(
//                         "Cardinal message received:",
//                         event.data
//                     );


//                     /*
//                      * Cardinal's exact message structure
//                      * can vary by sandbox configuration.
//                      *
//                      * We only treat a message containing
//                      * completion-related information as
//                      * the end of device collection.
//                      */

//                     const message =
//                         event.data;


//                     const messageString =
//                         typeof message === "string"
//                             ? message
//                             : JSON.stringify(message);


//                     const completed =
//                         messageString
//                             .toLowerCase()
//                             .includes(
//                                 "completed"
//                             ) ||
//                         messageString
//                             .toLowerCase()
//                             .includes(
//                                 "profiling"
//                             ) ||
//                         messageString
//                             .toLowerCase()
//                             .includes(
//                                 "success"
//                             );


//                     if (!completed) {

//                         return;
//                     }


//                     console.log(
//                         "CARDINAL DEVICE FINGERPRINTING COMPLETED"
//                     );


//                     deviceCollectionCompleted =
//                         true;


//                     cleanup();


//                     resolve(
//                         sessionId
//                     );


//                     /*
//                      * Continue SafePay flow.
//                      */

//                     startPayerAuthenticationEnrollment(
//                         sessionId
//                     );
//                 };


//             window.addEventListener(
//                 "message",
//                 messageHandler
//             );


//             /* -----------------------------------------
//                Timeout protection
//             ----------------------------------------- */

//             timeoutId =
//                 setTimeout(
//                     () => {

//                         cleanup();


//                         if (
//                             !deviceCollectionCompleted
//                         ) {

//                             reject(
//                                 new Error(
//                                     "Cardinal device fingerprinting timed out"
//                                 )
//                             );
//                         }

//                     },
//                     30000
//                 );


//             /* -----------------------------------------
//                Submit form
//             ----------------------------------------- */

//             console.log(
//                 "Submitting device data collection form..."
//             );


//             form.submit();


//             console.log(
//                 "Device data collection form submitted."
//             );

//         }
//     );
// }


// /* =========================================================
//    Payer Authentication Enrollment
// ========================================================= */

// async function startPayerAuthenticationEnrollment(
//     deviceFingerprintSessionId
// ) {

//     if (enrollmentStarted) {

//         console.log(
//             "Payer authentication enrollment already started."
//         );

//         return;
//     }


//     enrollmentStarted =
//         true;


//     console.log(
//         "================================="
//     );


//     console.log(
//         "STARTING PAYER AUTHENTICATION ENROLLMENT"
//     );


//     console.log(
//         "================================="
//     );


//     console.log(
//         "Tracker Token:",
//         trackerToken
//     );


//     console.log(
//         "Device Fingerprint Session ID:",
//         deviceFingerprintSessionId
//     );


//     try {

//         /* -----------------------------------------
//            Call Odoo enrollment endpoint
//         ----------------------------------------- */

//         const response =
//             await fetch(
//                 "/payment/safepay/payer_auth_enrollment",
//                 {
//                     method: "POST",

//                     headers: {
//                         "Content-Type":
//                             "application/json"
//                     },

//                     body: JSON.stringify({

//                         tracker_token:
//                             trackerToken,

//                         device_fingerprint_session_id:
//                             deviceFingerprintSessionId

//                     })
//                 }
//             );


//         const result =
//             await response.json();


//         console.log(
//             "PAYER AUTH ENROLLMENT RESPONSE:",
//             result
//         );


//         if (!response.ok) {

//             throw new Error(
//                 result?.error ||
//                 "SafePay payer authentication enrollment failed"
//             );
//         }


//         if (!result.success) {

//             throw new Error(
//                 result?.error ||
//                 "SafePay payer authentication enrollment unsuccessful"
//             );
//         }


//         console.log(
//             "SafePay payer authentication enrollment successful."
//         );


//         /* -----------------------------------------
//            Inspect SafePay next action
//         ----------------------------------------- */

//         const enrollmentData =
//             result.data;


//         console.log(
//             "SafePay enrollment data:",
//             enrollmentData
//         );


//         /*
//          * At this point SafePay/CyberSource may
//          * return the next authentication action.
//          *
//          * We do not blindly redirect here because
//          * the exact response determines whether the
//          * next step is:
//          *
//          * - challenge
//          * - authorization
//          * - redirect
//          * - successful payment
//          */


//         handlePayerAuthenticationResponse(
//             enrollmentData
//         );


//     } catch (error) {

//         console.error(
//             "SafePay payer authentication enrollment error:",
//             error
//         );


//         resetButton();
//     }
// }


// /* =========================================================
//    Handle Payer Authentication Response
// ========================================================= */

// function handlePayerAuthenticationResponse(
//     data
// ) {

//     console.log(
//         "Handling SafePay payer authentication response..."
//     );


//     /*
//      * Print the structure first.
//      *
//      * This is important because SafePay may return
//      * a challenge URL / authentication action
//      * depending on the sandbox card and configuration.
//      */

//     console.log(
//         "SafePay Authentication Result:",
//         data
//     );


//     const action =
//         data?.data?.action ||
//         data?.action;


//     const tracker =
//         data?.data?.tracker;


//     if (tracker) {

//         console.log(
//             "SafePay Tracker:",
//             tracker
//         );
//     }


//     if (action) {

//         console.log(
//             "SafePay Next Action:",
//             action
//         );
//     }


//     /*
//      * Do NOT mark the Odoo order as paid here.
//      *
//      * Payment is only considered successful after
//      * SafePay/CyberSource confirms authorization.
//      */


//     const statusMessage =
//         data?.status?.message;


//     if (
//         statusMessage ===
//         "success"
//     ) {

//         console.log(
//             "SafePay payer authentication request accepted."
//         );
//     }


//     /*
//      * The next response will tell us whether we need
//      * to perform a 3DS challenge or proceed to final
//      * authorization.
//      */
// }


// /* =========================================================
//    Reset Button
// ========================================================= */

// function resetButton() {

//     const button =
//         document.getElementById(
//             "safepay-secure-btn"
//         );


//     const processingMessage =
//         document.getElementById(
//             "safepay-processing"
//         );


//     if (button) {

//         button.disabled =
//             false;
//     }


//     if (processingMessage) {

//         processingMessage.style.display =
//             "none";
//     }
// }


// /* =========================================================
//    Odoo PaymentForm Patch
// ========================================================= */

// patch(
//     PaymentForm.prototype,
//     {

//         async _prepareInlineForm(
//             providerId,
//             providerCode,
//             paymentOptionId,
//             paymentMethodCode,
//             flow
//         ) {

//             if (
//                 providerCode !==
//                 "safepay"
//             ) {

//                 return super._prepareInlineForm(
//                     ...arguments
//                 );
//             }


//             console.log(
//                 "SafePay _prepareInlineForm"
//             );


//             console.log(
//                 "Provider ID:",
//                 providerId
//             );


//             console.log(
//                 "Payment Option:",
//                 paymentOptionId
//             );


//             console.log(
//                 "Payment Method:",
//                 paymentMethodCode
//             );


//             console.log(
//                 "Flow:",
//                 flow
//             );


//             return super._prepareInlineForm(
//                 ...arguments
//             );
//         },


//         async _processRedirectFlow(
//             providerCode,
//             paymentOptionId,
//             paymentMethodCode,
//             processingValues
//         ) {

//             if (
//                 providerCode !==
//                 "safepay"
//             ) {

//                 return super._processRedirectFlow(
//                     ...arguments
//                 );
//             }


//             console.log(
//                 "SafePay redirect flow intercepted."
//             );


//             console.log(
//                 "SafePay Processing Values:",
//                 processingValues
//             );


//             const trackerTokenValue =
//                 processingValues?.tracker_token;


//             const captureContextJWT =
//                 processingValues?.capture_context_jwt;


//             if (!trackerTokenValue) {

//                 console.error(
//                     "SafePay tracker token is missing."
//                 );

//                 return;
//             }


//             if (!captureContextJWT) {

//                 console.error(
//                     "SafePay Capture Context JWT is missing."
//                 );

//                 return;
//             }


//             /* -----------------------------------------
//                Initialize SafePay Flex
//             ----------------------------------------- */

//             await initializeSafePay(
//                 trackerTokenValue,
//                 captureContextJWT
//             );
//         }

//     }
// );


// /* =========================================================
//    Testing helper
// ========================================================= */

// window.safepayGetDeviceSession =
//     function () {

//         return window.safepayDeviceSessionId;
//     };



console.log("SafePay payment_safepay.js loaded successfully");

import { patch } from "@web/core/utils/patch";
import { PaymentForm } from "@payment/interactions/payment_form";

let microform = null;
let trackerToken = null;
let deviceCollectionCompleted = false;
let enrollmentStarted = false;
let authorizationStarted = false;

function decodeJwt(token) {
    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            throw new Error("Invalid JWT format");
        }

        const payload = parts[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(base64));
    } catch (error) {
        console.error("SafePay JWT decode error:", error);
        throw error;
    }
}

async function initializeSafePay(
    trackerTokenValue,
    captureContextJWT
) {
    try {
        trackerToken = trackerTokenValue;

        console.log(
            "SafePay Tracker Token:",
            trackerToken
        );

        const decoded = decodeJwt(captureContextJWT);

        const clientLibrary =
            decoded?.ctx?.[0]?.data?.clientLibrary;

        const clientLibraryIntegrity =
            decoded?.ctx?.[0]?.data?.clientLibraryIntegrity;

        if (!clientLibrary) {
            console.error(
                "SafePay clientLibrary is missing"
            );
            return;
        }

        await loadFlexSDK(
            clientLibrary,
            clientLibraryIntegrity
        );

        if (!window.Flex) {
            console.error(
                "SafePay Flex SDK is unavailable"
            );
            return;
        }

        console.log(
            "SafePay Flex SDK loaded"
        );

        const flex =
            new window.Flex(
                captureContextJWT
            );

        microform =
            flex.microform();

        const number =
            microform.createField(
                "number",
                {
                    placeholder: "Card Number"
                }
            );

        const securityCode =
            microform.createField(
                "securityCode",
                {
                    placeholder: "CVV"
                }
            );

        const numberContainer =
            document.getElementById(
                "number-container"
            );

        const securityCodeContainer =
            document.getElementById(
                "securityCode-container"
            );

        if (
            !numberContainer ||
            !securityCodeContainer
        ) {
            console.error(
                "SafePay card field containers were not found"
            );
            return;
        }

        number.load(
            "#number-container"
        );

        securityCode.load(
            "#securityCode-container"
        );

        console.log(
            "SafePay card fields loaded"
        );

        const button =
            document.getElementById(
                "safepay-secure-btn"
            );

        if (!button) {
            console.error(
                "SafePay Pay Securely button not found"
            );
            return;
        }

        button.style.display = "block";

        if (
            button.dataset.safepayBound ===
            "true"
        ) {
            return;
        }

        button.dataset.safepayBound =
            "true";

        button.addEventListener(
            "click",
            generateTransientToken
        );

    } catch (error) {
        console.error(
            "SafePay initialization error:",
            error
        );

        resetButton();
    }
}

function loadFlexSDK(
    clientLibrary,
    clientLibraryIntegrity
) {
    return new Promise(
        (resolve, reject) => {

            if (window.Flex) {
                resolve();
                return;
            }

            const existingScript =
                document.querySelector(
                    'script[data-safepay-flex-sdk="true"]'
                );

            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                existingScript.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );

                return;
            }

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                clientLibrary;

            script.async = true;

            script.dataset.safepayFlexSdk =
                "true";

            if (
                clientLibraryIntegrity
            ) {
                script.integrity =
                    clientLibraryIntegrity;

                script.crossOrigin =
                    "anonymous";
            }

            script.onload = () => {
                console.log(
                    "SafePay Flex SDK script loaded"
                );

                resolve();
            };

            script.onerror = error => {
                console.error(
                    "Failed to load SafePay Flex SDK",
                    error
                );

                reject(error);
            };

            document.head.appendChild(
                script
            );
        }
    );
}

async function generateTransientToken() {

    if (!microform) {
        console.error(
            "SafePay Microform is not loaded yet"
        );
        return;
    }

    const button =
        document.getElementById(
            "safepay-secure-btn"
        );

    const processingMessage =
        document.getElementById(
            "safepay-processing"
        );

    const expMonth =
        document.getElementById(
            "expMonth"
        )?.value;

    const expYear =
        document.getElementById(
            "expYear"
        )?.value;

    if (
        !expMonth ||
        !expYear
    ) {
        console.error(
            "Expiry month/year is missing"
        );
        return;
    }

    if (button) {
        button.disabled = true;
    }

    if (processingMessage) {
        processingMessage.style.display =
            "block";
    }

    deviceCollectionCompleted =
        false;

    enrollmentStarted =
        false;

    authorizationStarted =
        false;

    console.log(
        "Generating SafePay transient token..."
    );

    microform.createToken(
        {
            expirationMonth:
                expMonth,

            expirationYear:
                expYear
        },

        async function (
            error,
            transientToken
        ) {

            if (error) {

                console.error(
                    "SafePay Tokenization Error:",
                    error
                );

                resetButton();

                return;
            }

            console.log(
                "TRANSIENT TOKEN GENERATED"
            );

            try {

                const response =
                    await fetch(
                        "/payment/safepay/process_token",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    tracker_token:
                                        trackerToken,

                                    transient_token:
                                        transientToken
                                })
                        }
                    );

                const result =
                    await response.json();

                console.log(
                    "PROCESS TOKEN RESPONSE:",
                    result
                );

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        "SafePay process-token failed"
                    );
                }

                if (!result.success) {
                    throw new Error(
                        result?.error ||
                        "SafePay process-token unsuccessful"
                    );
                }

                const payerAuthentication =
                    result.payer_authentication;

                if (
                    !payerAuthentication
                ) {
                    throw new Error(
                        "SafePay payer authentication setup missing"
                    );
                }

                const accessToken =
                    payerAuthentication.access_token;

                const collectionUrl =
                    payerAuthentication
                        .device_data_collection_url;

                if (
                    !accessToken ||
                    !collectionUrl
                ) {
                    throw new Error(
                        "SafePay device collection information is incomplete"
                    );
                }

                console.log(
                    "SafePay payer authentication setup received."
                );

                await performDeviceCollection(
                    accessToken,
                    collectionUrl
                );

            } catch (error) {

                console.error(
                    "SafePay Process Token Error:",
                    error
                );

                resetButton();
            }
        }
    );
}

function performDeviceCollection(
    accessToken,
    collectionUrl
) {

    return new Promise(
        (resolve, reject) => {

            const sessionId =
                crypto.randomUUID();

            console.log(
                "Starting Cardinal device data collection..."
            );

            console.log(
                "Device Fingerprint Session ID:",
                sessionId
            );

            window.safepayDeviceSessionId =
                sessionId;

            let iframe =
                document.querySelector(
                    'iframe[name="cardinal-frame"]'
                );

            if (!iframe) {

                iframe =
                    document.createElement(
                        "iframe"
                    );

                iframe.name =
                    "cardinal-frame";

                iframe.style.display =
                    "none";

                iframe.style.width =
                    "0";

                iframe.style.height =
                    "0";

                iframe.style.border =
                    "0";

                document.body.appendChild(
                    iframe
                );
            }

            const form =
                document.createElement(
                    "form"
                );

            form.method =
                "POST";

            form.action =
                collectionUrl;

            form.target =
                "cardinal-frame";

            form.style.display =
                "none";

            const jwt =
                document.createElement(
                    "input"
                );

            jwt.type =
                "hidden";

            jwt.name =
                "JWT";

            jwt.value =
                accessToken;

            const md =
                document.createElement(
                    "input"
                );

            md.type =
                "hidden";

            md.name =
                "MD";

            md.value =
                sessionId;

            form.appendChild(
                jwt
            );

            form.appendChild(
                md
            );

            document.body.appendChild(
                form
            );

            let timeoutId = null;

            const cleanup = () => {

                window.removeEventListener(
                    "message",
                    messageHandler
                );

                if (timeoutId) {
                    clearTimeout(
                        timeoutId
                    );
                }

                if (form.parentNode) {
                    form.parentNode.removeChild(
                        form
                    );
                }
            };

            const messageHandler =
                event => {

                    if (
                        event.origin !==
                        "https://cas.client.cardinaltrusted.com"
                    ) {
                        return;
                    }

                    console.log(
                        "Cardinal message received:",
                        event.data
                    );

                    const message =
                        event.data;

                    const messageString =
                        typeof message === "string"
                            ? message
                            : JSON.stringify(message);

                    const lowerMessage =
                        messageString.toLowerCase();

                    const completed =
                        lowerMessage.includes(
                            "completed"
                        ) ||
                        lowerMessage.includes(
                            "profiling"
                        ) ||
                        lowerMessage.includes(
                            "success"
                        );

                    if (!completed) {
                        return;
                    }

                    console.log(
                        "CARDINAL DEVICE FINGERPRINTING COMPLETED"
                    );

                    deviceCollectionCompleted =
                        true;

                    cleanup();

                    resolve(
                        sessionId
                    );

                    startPayerAuthenticationEnrollment(
                        sessionId
                    );
                };

            window.addEventListener(
                "message",
                messageHandler
            );

            timeoutId =
                setTimeout(
                    () => {

                        cleanup();

                        if (
                            !deviceCollectionCompleted
                        ) {
                            reject(
                                new Error(
                                    "Cardinal device fingerprinting timed out"
                                )
                            );
                        }

                    },
                    30000
                );

            console.log(
                "Submitting device data collection form..."
            );

            form.submit();

            console.log(
                "Device data collection form submitted."
            );
        }
    );
}

async function startPayerAuthenticationEnrollment(
    deviceFingerprintSessionId
) {

    if (enrollmentStarted) {

        console.log(
            "Payer authentication enrollment already started."
        );

        return;
    }

    enrollmentStarted =
        true;

    console.log(
        "STARTING PAYER AUTHENTICATION ENROLLMENT"
    );

    console.log(
        "Tracker Token:",
        trackerToken
    );

    console.log(
        "Device Fingerprint Session ID:",
        deviceFingerprintSessionId
    );

    try {

        const response =
            await fetch(
                "/payment/safepay/payer_auth_enrollment",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            tracker_token:
                                trackerToken,

                            device_fingerprint_session_id:
                                deviceFingerprintSessionId
                        })
                }
            );

        const result =
            await response.json();

        console.log(
            "PAYER AUTH ENROLLMENT RESPONSE:",
            result
        );

        if (!response.ok) {
            throw new Error(
                result?.error ||
                "SafePay payer authentication enrollment failed"
            );
        }

        if (!result.success) {
            throw new Error(
                result?.error ||
                "SafePay payer authentication enrollment unsuccessful"
            );
        }

        console.log(
            "SafePay payer authentication enrollment successful."
        );

        handlePayerAuthenticationResponse(
            result.data
        );

    } catch (error) {

        console.error(
            "SafePay payer authentication enrollment error:",
            error
        );

        resetButton();
    }
}

async function handlePayerAuthenticationResponse(
    data
) {

    console.log(
        "SafePay Authentication Result:",
        data
    );

    const action =
        data?.data?.action ||
        data?.action;

    const tracker =
        data?.data?.tracker ||
        data?.tracker;

    if (tracker) {

        console.log(
            "SafePay Tracker:",
            tracker
        );
    }

    if (action) {

        console.log(
            "SafePay Next Action:",
            action
        );
    }

    const authentication =
        action?.payer_authentication_enrollment;

    if (authentication) {

        console.log(
            "SafePay Authentication Status:",
            authentication.authentication_status
        );

        console.log(
            "SafePay Enrollment Status:",
            authentication.enrollment_status
        );

        console.log(
            "SafePay PARES Status:",
            authentication.pares_status
        );
    }

    const nextAction =
        tracker?.next_actions?.CYBERSOURCE?.kind;

    if (
        authentication?.enrollment_status ===
            "AUTHENTICATION_SUCCESSFUL" &&
        authentication?.authentication_status ===
            "FRICTIONLESS" &&
        authentication?.pares_status ===
            "Y" &&
        nextAction ===
            "AUTHORIZATION"
    ) {

        console.log(
            "SafePay authentication successful."
        );

        console.log(
            "SafePay authorization required."
        );

        await authorizeSafePayPayment();

        return;
    }

    if (
        authentication?.enrollment_status ===
            "AUTHENTICATION_SUCCESSFUL"
    ) {

        console.log(
            "SafePay authentication successful."
        );

        if (
            nextAction ===
            "AUTHORIZATION"
        ) {

            await authorizeSafePayPayment();

            return;
        }
    }

    console.error(
        "SafePay authentication did not reach an authorization-ready state.",
        data
    );

    resetButton();
}

async function authorizeSafePayPayment() {

    if (authorizationStarted) {

        console.log(
            "SafePay authorization already started."
        );

        return;
    }

    authorizationStarted =
        true;

    console.log(
        "STARTING SAFEPAY PAYMENT AUTHORIZATION"
    );

    console.log(
        "Tracker Token:",
        trackerToken
    );

    try {

        const response =
            await fetch(
                "/payment/safepay/authorize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            tracker_token:
                                trackerToken
                        })
                }
            );

        const result =
            await response.json();

        console.log(
            "SAFEPAY AUTHORIZATION RESPONSE:",
            result
        );

        if (!response.ok) {

            throw new Error(
                result?.error ||
                "SafePay authorization failed"
            );
        }

        if (!result.success) {

            throw new Error(
                result?.error ||
                "SafePay authorization unsuccessful"
            );
        }

        const authorizationData =
            result.data;

        console.log(
            "SafePay authorization data:",
            authorizationData
        );

        const statusMessage =
            authorizationData?.status?.message;

        if (
            statusMessage !==
            "success"
        ) {

            throw new Error(
                authorizationData?.status?.errors?.join(
                    ", "
                ) ||
                "SafePay authorization was not successful"
            );
        }

        console.log(
            "SAFEPAY PAYMENT AUTHORIZATION SUCCESSFUL"
        );

        const authorizedTracker =
            authorizationData?.data?.tracker;

        if (authorizedTracker) {

            console.log(
                "Authorized SafePay Tracker:",
                authorizedTracker
            );
        }

        window.location.href =
            "/payment/safepay/success";

    } catch (error) {

        console.error(
            "SafePay authorization error:",
            error
        );

        authorizationStarted =
            false;

        resetButton();
    }
}

function resetButton() {

    const button =
        document.getElementById(
            "safepay-secure-btn"
        );

    const processingMessage =
        document.getElementById(
            "safepay-processing"
        );

    if (button) {
        button.disabled =
            false;
    }

    if (processingMessage) {
        processingMessage.style.display =
            "none";
    }
}

patch(
    PaymentForm.prototype,
    {

        async _prepareInlineForm(
            providerId,
            providerCode,
            paymentOptionId,
            paymentMethodCode,
            flow
        ) {

            if (
                providerCode !==
                "safepay"
            ) {

                return super._prepareInlineForm(
                    ...arguments
                );
            }

            console.log(
                "SafePay _prepareInlineForm"
            );

            console.log(
                "Provider ID:",
                providerId
            );

            console.log(
                "Payment Option:",
                paymentOptionId
            );

            console.log(
                "Payment Method:",
                paymentMethodCode
            );

            console.log(
                "Flow:",
                flow
            );

            return super._prepareInlineForm(
                ...arguments
            );
        },

        async _processRedirectFlow(
            providerCode,
            paymentOptionId,
            paymentMethodCode,
            processingValues
        ) {

            if (
                providerCode !==
                "safepay"
            ) {

                return super._processRedirectFlow(
                    ...arguments
                );
            }

            console.log(
                "SafePay redirect flow intercepted."
            );

            console.log(
                "SafePay Processing Values:",
                processingValues
            );

            const trackerTokenValue =
                processingValues?.tracker_token;

            const captureContextJWT =
                processingValues?.capture_context_jwt;

            if (!trackerTokenValue) {

                console.error(
                    "SafePay tracker token is missing."
                );

                return;
            }

            if (!captureContextJWT) {

                console.error(
                    "SafePay Capture Context JWT is missing."
                );

                return;
            }

            await initializeSafePay(
                trackerTokenValue,
                captureContextJWT
            );
        }
    }
);

window.safepayGetDeviceSession =
    function () {
        return window.safepayDeviceSessionId;
    };
