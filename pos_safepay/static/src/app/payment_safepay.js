

// console.log("🔥🔥 POS SAFEPAY JS LOADED 🔥🔥🔥");

// import { PaymentInterface } from "@point_of_sale/app/utils/payment/payment_interface";
// import { register_payment_method } from "@point_of_sale/app/services/pos_store";


// let microform = null;
// let currentTrackerToken = null;


// /* =========================================================
//  * DECODE JWT
//  * ========================================================= */

// function decodeJwt(token) {
//     try {
//         const parts = token.split(".");

//         if (parts.length !== 3) {
//             throw new Error("Invalid JWT format");
//         }

//         const payload = parts[1];

//         const base64 = payload
//             .replace(/-/g, "+")
//             .replace(/_/g, "/");

//         return JSON.parse(atob(base64));

//     } catch (error) {

//         console.error(
//             "❌ SafePay JWT decode error:",
//             error
//         );

//         throw error;
//     }
// }


// /* =========================================================
//  * LOAD SAFEPAY FLEX SDK
//  * ========================================================= */

// function loadFlexSDK(
//     clientLibrary,
//     clientLibraryIntegrity
// ) {

//     return new Promise(
//         (resolve, reject) => {

//             if (window.Flex) {

//                 console.log(
//                     "✅ SafePay Flex SDK already loaded"
//                 );

//                 resolve();
//                 return;
//             }


//             const existingScript =
//                 document.querySelector(
//                     'script[data-safepay-flex-sdk="true"]'
//                 );


//             if (existingScript) {

//                 console.log(
//                     "⏳ SafePay Flex SDK is already loading..."
//                 );

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


//             console.log(
//                 "⬇️ Loading SafePay Flex SDK..."
//             );


//             const script =
//                 document.createElement(
//                     "script"
//                 );


//             script.src =
//                 clientLibrary;

//             script.async = true;

//             script.dataset.safepayFlexSdk =
//                 "true";


//             if (clientLibraryIntegrity) {

//                 script.integrity =
//                     clientLibraryIntegrity;

//                 script.crossOrigin =
//                     "anonymous";
//             }


//             script.onload = () => {

//                 console.log(
//                     "✅ SafePay Flex SDK loaded successfully"
//                 );

//                 resolve();
//             };


//             script.onerror = error => {

//                 console.error(
//                     "❌ Failed to load SafePay Flex SDK:",
//                     error
//                 );

//                 reject(error);
//             };


//             document.head.appendChild(
//                 script
//             );
//         }
//     );
// }


// /* =========================================================
//  * INITIALIZE SAFEPAY FLEX
//  * ========================================================= */

// async function initializeSafePay(
//     trackerToken,
//     captureContextJWT
// ) {

//     try {

//         currentTrackerToken =
//             trackerToken;


//         console.log(
//             "========================================"
//         );

//         console.log(
//             "🔥 INITIALIZING SAFEPAY FLEX"
//         );

//         console.log(
//             "Tracker:",
//             trackerToken
//         );


//         /* -----------------------------------------
//          * DECODE CAPTURE CONTEXT
//          * ----------------------------------------- */

//         const decoded =
//             decodeJwt(
//                 captureContextJWT
//             );


//         console.log(
//             "🔐 Capture Context decoded:",
//             decoded
//         );


//         const clientLibrary =
//             decoded?.ctx?.[0]?.data?.clientLibrary;


//         const clientLibraryIntegrity =
//             decoded?.ctx?.[0]?.data?.clientLibraryIntegrity;


//         if (!clientLibrary) {

//             throw new Error(
//                 "SafePay capture context does not contain clientLibrary"
//             );
//         }


//         console.log(
//             "📦 SafePay client library:",
//             clientLibrary
//         );


//         /* -----------------------------------------
//          * LOAD FLEX
//          * ----------------------------------------- */

//         await loadFlexSDK(
//             clientLibrary,
//             clientLibraryIntegrity
//         );


//         if (!window.Flex) {

//             throw new Error(
//                 "SafePay Flex SDK is unavailable after loading"
//             );
//         }


//         console.log(
//             "✅ window.Flex is available"
//         );


//         /* -----------------------------------------
//          * CREATE FLEX INSTANCE
//          * ----------------------------------------- */

//         const flex =
//             new window.Flex(
//                 captureContextJWT
//             );


//         console.log(
//             "✅ SafePay Flex instance created"
//         );


//         /* -----------------------------------------
//          * CREATE MICROFORM
//          * ----------------------------------------- */

//         microform =
//             flex.microform();


//         console.log(
//             "✅ SafePay Microform created"
//         );


//         /* -----------------------------------------
//          * CREATE CARD FIELDS
//          * ----------------------------------------- */

//         const number =
//             microform.createField(
//                 "number",
//                 {
//                     placeholder:
//                         "Card Number",
//                 }
//             );


//         const securityCode =
//             microform.createField(
//                 "securityCode",
//                 {
//                     placeholder:
//                         "CVV",
//                 }
//             );


//         console.log(
//             "✅ SafePay card fields created"
//         );


//         /* -----------------------------------------
//          * CREATE POS CARD UI
//          * ----------------------------------------- */

//         showSafePayCardForm();


//         /* -----------------------------------------
//          * LOAD FIELDS
//          * ----------------------------------------- */

//         number.load(
//             "#safepay-number-container"
//         );


//         securityCode.load(
//             "#safepay-security-container"
//         );


//         console.log(
//             "🔥🔥 SafePay card fields loaded into POS"
//         );


//         return true;


//     } catch (error) {

//         console.error(
//             "❌ SafePay Flex initialization error:",
//             error
//         );

//         throw error;
//     }
// }


// /* =========================================================
//  * CREATE TEMPORARY CARD FORM
//  * ========================================================= */

// function showSafePayCardForm() {

//     let container =
//         document.getElementById(
//             "safepay-pos-container"
//         );


//     /* Remove an old form if one exists */

//     if (container) {

//         container.remove();
//     }


//     /* -----------------------------------------
//      * CREATE MAIN CONTAINER
//      * ----------------------------------------- */

//     container =
//         document.createElement(
//             "div"
//         );


//     container.id =
//         "safepay-pos-container";


//     container.style.position =
//         "fixed";

//     container.style.top =
//         "50%";

//     container.style.left =
//         "50%";

//     container.style.transform =
//         "translate(-50%, -50%)";


//     container.style.width =
//         "450px";

//     container.style.maxWidth =
//         "90vw";


//     container.style.background =
//         "white";

//     container.style.padding =
//         "25px";

//     container.style.borderRadius =
//         "10px";

//     container.style.boxShadow =
//         "0 10px 40px rgba(0,0,0,0.3)";


//     container.style.zIndex =
//         "99999";


//     /* -----------------------------------------
//      * TITLE
//      * ----------------------------------------- */

//     const title =
//         document.createElement(
//             "h3"
//         );


//     title.textContent =
//         "SafePay Secure Payment";


//     container.appendChild(
//         title
//     );


//     /* -----------------------------------------
//      * CARD NUMBER
//      * ----------------------------------------- */

//     const numberLabel =
//         document.createElement(
//             "label"
//         );


//     numberLabel.textContent =
//         "Card Number";


//     container.appendChild(
//         numberLabel
//     );


//     const numberContainer =
//         document.createElement(
//             "div"
//         );


//     numberContainer.id =
//         "safepay-number-container";


//     numberContainer.style.marginBottom =
//         "15px";


//     container.appendChild(
//         numberContainer
//     );


//     /* -----------------------------------------
//      * CVV
//      * ----------------------------------------- */

//     const securityLabel =
//         document.createElement(
//             "label"
//         );


//     securityLabel.textContent =
//         "Security Code (CVV)";


//     container.appendChild(
//         securityLabel
//     );


//     const securityContainer =
//         document.createElement(
//             "div"
//         );


//     securityContainer.id =
//         "safepay-security-container";


//     securityContainer.style.marginBottom =
//         "15px";


//     container.appendChild(
//         securityContainer
//     );


//     /* -----------------------------------------
//      * EXPIRY
//      * ----------------------------------------- */

//     const expiryLabel =
//         document.createElement(
//             "label"
//         );


//     expiryLabel.textContent =
//         "Expiry Month / Year";


//     container.appendChild(
//         expiryLabel
//     );


//     const expiryContainer =
//         document.createElement(
//             "div"
//         );


//     expiryContainer.style.display =
//         "flex";

//     expiryContainer.style.gap =
//         "10px";


//     const month =
//         document.createElement(
//             "select"
//         );


//     month.id =
//         "safepay-exp-month";


//     for (
//         let i = 1;
//         i <= 12;
//         i++
//     ) {

//         const option =
//             document.createElement(
//                 "option"
//             );


//         option.value =
//             String(i).padStart(
//                 2,
//                 "0"
//             );


//         option.textContent =
//             option.value;


//         month.appendChild(
//             option
//         );
//     }


//     const year =
//         document.createElement(
//             "select"
//         );


//     year.id =
//         "safepay-exp-year";


//     const currentYear =
//         new Date().getFullYear();


//     for (
//         let i = 0;
//         i < 10;
//         i++
//     ) {

//         const option =
//             document.createElement(
//                 "option"
//             );


//         option.value =
//             String(
//                 currentYear + i
//             );


//         option.textContent =
//             String(
//                 currentYear + i
//             );


//         year.appendChild(
//             option
//         );
//     }


//     expiryContainer.appendChild(
//         month
//     );

//     expiryContainer.appendChild(
//         year
//     );


//     container.appendChild(
//         expiryContainer
//     );


//     /* -----------------------------------------
//      * ERROR AREA
//      * ----------------------------------------- */

//     const errorArea =
//         document.createElement(
//             "div"
//         );


//     errorArea.id =
//         "safepay-pos-error";


//     errorArea.style.color =
//         "red";

//     errorArea.style.marginTop =
//         "15px";


//     container.appendChild(
//         errorArea
//     );


//     /* -----------------------------------------
//      * PAY BUTTON
//      * ----------------------------------------- */

//     const payButton =
//         document.createElement(
//             "button"
//         );


//     payButton.textContent =
//         "Pay Securely";


//     payButton.className =
//         "btn btn-primary";


//     payButton.style.width =
//         "100%";

//     payButton.style.marginTop =
//         "20px";


//     payButton.addEventListener(
//         "click",
//         () => {

//             generateTransientToken(
//                 month.value,
//                 year.value
//             );
//         }
//     );


//     container.appendChild(
//         payButton
//     );


//     /* -----------------------------------------
//      * CANCEL BUTTON
//      * ----------------------------------------- */

//     const cancelButton =
//         document.createElement(
//             "button"
//         );


//     cancelButton.textContent =
//         "Cancel";


//     cancelButton.className =
//         "btn btn-secondary";


//     cancelButton.style.width =
//         "100%";

//     cancelButton.style.marginTop =
//         "10px";


//     cancelButton.addEventListener(
//         "click",
//         () => {

//             container.remove();

//             microform =
//                 null;

//         }
//     );


//     container.appendChild(
//         cancelButton
//     );


//     document.body.appendChild(
//         container
//     );
// }


// /* =========================================================
//  * GENERATE TRANSIENT TOKEN
//  * ========================================================= */

// async function generateTransientToken(
//     expirationMonth,
//     expirationYear
// ) {

//     if (!microform) {

//         console.error(
//             "❌ SafePay Microform is not available"
//         );

//         return;
//     }


//     console.log(
//         "🔥 Generating SafePay transient token..."
//     );


//     try {

//         microform.createToken(
//             {
//                 expirationMonth,
//                 expirationYear,
//             },

//             async (
//                 error,
//                 transientToken
//             ) => {

//                 if (error) {

//                     console.error(
//                         "❌ SafePay tokenization error:",
//                         error
//                     );

//                     showSafePayError(
//                         error.message ||
//                         "Card tokenization failed"
//                     );

//                     return;
//                 }


//                 console.log(
//                     "✅ TRANSIENT TOKEN GENERATED"
//                 );


//                 console.log(
//                     "Transient token received."
//                 );


//                 /*
//                  * STOP HERE FOR NOW.
//                  *
//                  * The next step will send this token
//                  * to your Odoo backend:
//                  *
//                  * /payment/safepay/process_token
//                  *
//                  * We deliberately stop here first
//                  * so we can verify that:
//                  *
//                  * POS
//                  * ↓
//                  * Flex SDK
//                  * ↓
//                  * transient token
//                  *
//                  * works correctly.
//                  */

//                 showSafePaySuccess(
//                     "Card token generated successfully."
//                 );
//             }
//         );

//     } catch (error) {

//         console.error(
//             "❌ SafePay transient token error:",
//             error
//         );

//         showSafePayError(
//             error.message ||
//             "Unable to tokenize card"
//         );
//     }
// }


// /* =========================================================
//  * UI HELPERS
//  * ========================================================= */

// function showSafePayError(
//     message
// ) {

//     const errorArea =
//         document.getElementById(
//             "safepay-pos-error"
//         );


//     if (errorArea) {

//         errorArea.textContent =
//             message;
//     }
// }


// function showSafePaySuccess(
//     message
// ) {

//     const errorArea =
//         document.getElementById(
//             "safepay-pos-error"
//         );


//     if (errorArea) {

//         errorArea.style.color =
//             "green";

//         errorArea.textContent =
//             message;
//     }
// }


// /* =========================================================
//  * PAYMENT INTERFACE
//  * ========================================================= */

// export class PaymentSafePay
//     extends PaymentInterface {

//     setup() {

//         super.setup(
//             ...arguments
//         );


//         console.log(
//             "🔥 SafePay POS payment interface initialized"
//         );
//     }


//     async sendPaymentRequest(uuid) {

//         console.log(
//             "🔥 SafePay POS payment request"
//         );


//         const line =
//             this.pos
//                 .getOrder()
//                 .getSelectedPaymentline();


//         const amount =
//             Math.abs(
//                 line.amount
//             );


//         const paymentMethod =
//             line.payment_method_id;


//         console.log(
//             "💰 Amount:",
//             amount
//         );


//         console.log(
//             "💳 Payment Method ID:",
//             paymentMethod.id
//         );


//         console.log(
//             "💱 Currency:",
//             this.pos.currency.name
//         );


//         try {

//             line.setPaymentStatus(
//                 "waiting"
//             );


//             console.log(
//                 "🔥 Creating SafePay tracker..."
//             );


//             const result =
//                 await this.pos.data.call(
//                     "pos.payment.method",
//                     "safepay_create_tracker",
//                     [
//                         paymentMethod.id,
//                         amount,
//                         this.pos
//                             .getOrder()
//                             .id || 0,
//                         this.pos.currency.name,
//                     ]
//                 );


//             console.log(
//                 "🔥 SafePay tracker response:",
//                 result
//             );


//             if (
//                 !result ||
//                 !result.success
//             ) {

//                 throw new Error(
//                     result?.error ||
//                     "Failed to create SafePay tracker"
//                 );
//             }


//             console.log(
//                 "✅ SafePay tracker created:",
//                 result.tracker_token
//             );


//             console.log(
//                 "🔐 Capture Context JWT received"
//             );


//             line.safepay_tracker_token =
//                 result.tracker_token;


//             line.safepay_capture_context_jwt =
//                 result.capture_context_jwt;


//             /* -----------------------------------------
//              * INITIALIZE FLEX
//              * ----------------------------------------- */

//             await initializeSafePay(
//                 result.tracker_token,
//                 result.capture_context_jwt
//             );


//             console.log(
//                 "🟢 SafePay card interface initialized"
//             );


//             /*
//              * DO NOT mark the payment as done yet.
//              *
//              * The actual authorization will happen
//              * after card tokenization.
//              */

//             line.setPaymentStatus(
//                 "waiting"
//             );


//             return true;


//         } catch (error) {

//             console.error(
//                 "❌ SafePay payment error:",
//                 error
//             );


//             line.setPaymentStatus(
//                 "retry"
//             );


//             return false;
//         }
//     }


//     async sendPaymentCancel(
//         order,
//         uuid
//     ) {

//         console.log(
//             "🔥 SafePay POS payment cancelled"
//         );


//         return true;
//     }
// }


// /* =========================================================
//  * REGISTER SAFEPAY
//  * ========================================================= */

// register_payment_method(
//     "safepay",
//     PaymentSafePay
// );
console.log("🔥🔥 POS SAFEPAY JS LOADED 🔥🔥🔥");

import { PaymentInterface } from "@point_of_sale/app/utils/payment/payment_interface";
import { register_payment_method } from "@point_of_sale/app/services/pos_store";

let posSafePayMicroform = null;
let posSafePayTrackerToken = null;
let posSafePayDeviceSessionId = null;

let posSafePayEnrollmentStarted = false;
let posSafePayAuthorizationStarted = false;


/* =========================================================
 * JWT DECODER
 * ========================================================= */

function posSafePayDecodeJwt(token) {

    try {

        const parts = token.split(".");

        if (parts.length !== 3) {
            throw new Error("Invalid SafePay JWT format");
        }

        const payload = parts[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(
            atob(base64)
        );

    } catch (error) {

        console.error(
            "❌ POS SafePay JWT decode error:",
            error
        );

        throw error;
    }
}


/* =========================================================
 * LOAD SAFEPAY FLEX SDK
 * ========================================================= */

function posSafePayLoadFlexSDK(
    clientLibrary,
    clientLibraryIntegrity
) {

    return new Promise(
        (resolve, reject) => {

            if (window.Flex) {

                console.log(
                    "✅ SafePay Flex SDK already loaded"
                );

                resolve();
                return;
            }

            const existingScript =
                document.querySelector(
                    'script[data-pos-safepay-flex-sdk="true"]'
                );

            if (existingScript) {

                console.log(
                    "⏳ POS SafePay Flex SDK already loading..."
                );

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

            console.log(
                "⬇️ Loading POS SafePay Flex SDK..."
            );

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                clientLibrary;

            script.async = true;

            script.dataset.posSafepayFlexSdk =
                "true";

            if (clientLibraryIntegrity) {

                script.integrity =
                    clientLibraryIntegrity;

                script.crossOrigin =
                    "anonymous";
            }

            script.onload = () => {

                console.log(
                    "✅ POS SafePay Flex SDK loaded successfully"
                );

                resolve();
            };

            script.onerror = error => {

                console.error(
                    "❌ POS SafePay Flex SDK failed to load:",
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


/* =========================================================
 * INITIALIZE POS SAFEPAY FLEX
 * ========================================================= */

async function posSafePayInitializeFlex(
    trackerToken,
    captureContextJWT
) {

    try {

        posSafePayTrackerToken =
            trackerToken;

        console.log(
            "========================================"
        );

        console.log(
            "🔥 INITIALIZING POS SAFEPAY FLEX"
        );

        console.log(
            "Tracker:",
            trackerToken
        );


        /* -----------------------------------------
         * DECODE CAPTURE CONTEXT
         * ----------------------------------------- */

        const decoded =
            posSafePayDecodeJwt(
                captureContextJWT
            );

        console.log(
            "🔐 POS SafePay capture context:",
            decoded
        );


        const clientLibrary =
            decoded?.ctx?.[0]?.data?.clientLibrary;

        const clientLibraryIntegrity =
            decoded?.ctx?.[0]?.data?.clientLibraryIntegrity;


        if (!clientLibrary) {

            throw new Error(
                "SafePay capture context does not contain clientLibrary"
            );
        }


        console.log(
            "📦 SafePay client library:",
            clientLibrary
        );


        /* -----------------------------------------
         * LOAD SDK
         * ----------------------------------------- */

        await posSafePayLoadFlexSDK(
            clientLibrary,
            clientLibraryIntegrity
        );


        if (!window.Flex) {

            throw new Error(
                "window.Flex is unavailable"
            );
        }


        console.log(
            "✅ window.Flex is available"
        );


        /* -----------------------------------------
         * CREATE FLEX
         * ----------------------------------------- */

        const flex =
            new window.Flex(
                captureContextJWT
            );


        console.log(
            "✅ SafePay Flex instance created"
        );


        /* -----------------------------------------
         * CREATE MICROFORM
         * ----------------------------------------- */

        posSafePayMicroform =
            flex.microform();


        console.log(
            "✅ SafePay Microform created"
        );


        /* -----------------------------------------
         * CREATE CARD FIELDS
         * ----------------------------------------- */

        const number =
            posSafePayMicroform.createField(
                "number",
                {
                    placeholder:
                        "Card Number",
                }
            );


        const securityCode =
            posSafePayMicroform.createField(
                "securityCode",
                {
                    placeholder:
                        "CVV",
                }
            );


        console.log(
            "✅ SafePay POS card fields created"
        );


        /* -----------------------------------------
         * SHOW POS FORM
         * ----------------------------------------- */

        posSafePayShowCardForm();


        /* -----------------------------------------
         * LOAD FIELDS
         * ----------------------------------------- */

        number.load(
            "#pos-safepay-number-container"
        );

        securityCode.load(
            "#pos-safepay-security-container"
        );


        console.log(
            "🔥🔥 SafePay card fields loaded into POS"
        );


        return true;

    } catch (error) {

        console.error(
            "❌ POS SafePay initialization error:",
            error
        );

        throw error;
    }
}


/* =========================================================
 * CREATE POS CARD FORM
 * ========================================================= */

function posSafePayShowCardForm() {

    let container =
        document.getElementById(
            "pos-safepay-container"
        );


    if (container) {
        container.remove();
    }


    container =
        document.createElement(
            "div"
        );


    container.id =
        "pos-safepay-container";


    container.style.position =
        "fixed";

    container.style.top =
        "50%";

    container.style.left =
        "50%";

    container.style.transform =
        "translate(-50%, -50%)";


    container.style.width =
        "450px";

    container.style.maxWidth =
        "90vw";


    container.style.background =
        "white";

    container.style.padding =
        "25px";

    container.style.borderRadius =
        "10px";

    container.style.boxShadow =
        "0 10px 40px rgba(0,0,0,0.3)";

    container.style.zIndex =
        "99999";


    /* -----------------------------------------
     * TITLE
     * ----------------------------------------- */

    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        "SafePay Secure Payment";

    container.appendChild(
        title
    );


    /* -----------------------------------------
     * CARD NUMBER
     * ----------------------------------------- */

    const numberLabel =
        document.createElement(
            "label"
        );

    numberLabel.textContent =
        "Card Number";

    container.appendChild(
        numberLabel
    );


    const numberContainer =
        document.createElement(
            "div"
        );

    numberContainer.id =
        "pos-safepay-number-container";

    numberContainer.style.marginBottom =
        "15px";

    container.appendChild(
        numberContainer
    );


    /* -----------------------------------------
     * CVV
     * ----------------------------------------- */

    const securityLabel =
        document.createElement(
            "label"
        );

    securityLabel.textContent =
        "Security Code (CVV)";

    container.appendChild(
        securityLabel
    );


    const securityContainer =
        document.createElement(
            "div"
        );

    securityContainer.id =
        "pos-safepay-security-container";

    securityContainer.style.marginBottom =
        "15px";

    container.appendChild(
        securityContainer
    );


    /* -----------------------------------------
     * EXPIRY
     * ----------------------------------------- */

    const expiryLabel =
        document.createElement(
            "label"
        );

    expiryLabel.textContent =
        "Expiry Month / Year";

    container.appendChild(
        expiryLabel
    );


    const expiryContainer =
        document.createElement(
            "div"
        );

    expiryContainer.style.display =
        "flex";

    expiryContainer.style.gap =
        "10px";


    const month =
        document.createElement(
            "select"
        );

    month.id =
        "pos-safepay-exp-month";


    for (
        let i = 1;
        i <= 12;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(i).padStart(
                2,
                "0"
            );

        option.textContent =
            option.value;

        month.appendChild(
            option
        );
    }


    const year =
        document.createElement(
            "select"
        );

    year.id =
        "pos-safepay-exp-year";


    const currentYear =
        new Date().getFullYear();


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(
                currentYear + i
            );

        option.textContent =
            String(
                currentYear + i
            );

        year.appendChild(
            option
        );
    }


    expiryContainer.appendChild(
        month
    );

    expiryContainer.appendChild(
        year
    );

    container.appendChild(
        expiryContainer
    );


    /* -----------------------------------------
     * STATUS
     * ----------------------------------------- */

    const statusArea =
        document.createElement(
            "div"
        );

    statusArea.id =
        "pos-safepay-status";

    statusArea.style.marginTop =
        "15px";

    container.appendChild(
        statusArea
    );


    /* -----------------------------------------
     * PAY BUTTON
     * ----------------------------------------- */

    const payButton =
        document.createElement(
            "button"
        );

    payButton.textContent =
        "Pay Securely";

    payButton.className =
        "btn btn-primary";

    payButton.style.width =
        "100%";

    payButton.style.marginTop =
        "20px";


    payButton.addEventListener(
        "click",
        () => {

            posSafePayGenerateTransientToken(
                month.value,
                year.value
            );
        }
    );


    container.appendChild(
        payButton
    );


    /* -----------------------------------------
     * CANCEL
     * ----------------------------------------- */

    const cancelButton =
        document.createElement(
            "button"
        );

    cancelButton.textContent =
        "Cancel";

    cancelButton.className =
        "btn btn-secondary";

    cancelButton.style.width =
        "100%";

    cancelButton.style.marginTop =
        "10px";


    cancelButton.addEventListener(
        "click",
        () => {

            container.remove();

            posSafePayMicroform =
                null;

            posSafePayTrackerToken =
                null;
        }
    );


    container.appendChild(
        cancelButton
    );


    document.body.appendChild(
        container
    );
}


/* =========================================================
 * STATUS HELPERS
 * ========================================================= */

function posSafePaySetStatus(
    message,
    success = false
) {

    const status =
        document.getElementById(
            "pos-safepay-status"
        );

    if (!status) {
        return;
    }

    status.textContent =
        message;

    status.style.color =
        success
            ? "green"
            : "black";
}


function posSafePaySetError(
    message
) {

    const status =
        document.getElementById(
            "pos-safepay-status"
        );

    if (!status) {
        return;
    }

    status.textContent =
        message;

    status.style.color =
        "red";
}


/* =========================================================
 * GENERATE POS TRANSIENT TOKEN
 *
 * IMPORTANT:
 * This is intentionally named differently from the
 * website payment_safepay.js function.
 * ========================================================= */

async function posSafePayGenerateTransientToken(
    expirationMonth,
    expirationYear
) {

    if (!posSafePayMicroform) {

        console.error(
            "❌ POS SafePay Microform unavailable"
        );

        return;
    }


    console.log(
        "🔥 Generating POS SafePay transient token..."
    );


    posSafePaySetStatus(
        "Securely processing card..."
    );


    try {

        posSafePayMicroform.createToken(
            {
                expirationMonth,
                expirationYear,
            },

            async (
                error,
                transientToken
            ) => {

                if (error) {

                    console.error(
                        "❌ POS SafePay tokenization error:",
                        error
                    );

                    posSafePaySetError(
                        error.message ||
                        "Card tokenization failed"
                    );

                    return;
                }


                console.log(
                    "✅ POS TRANSIENT TOKEN GENERATED"
                );


                /*
                 * IMPORTANT:
                 *
                 * We do NOT display the transient token.
                 *
                 * We send it directly to Odoo.
                 */

                try {

                    await posSafePayProcessTransientToken(
                        transientToken
                    );

                } catch (processError) {

                    console.error(
                        "❌ POS SafePay process-token error:",
                        processError
                    );

                    posSafePaySetError(
                        processError.message ||
                        "SafePay payment processing failed"
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "❌ POS SafePay transient-token error:",
            error
        );

        posSafePaySetError(
            error.message ||
            "Unable to tokenize card"
        );
    }
}


/* =========================================================
 * SEND TRANSIENT TOKEN TO ODOO
 * ========================================================= */

async function posSafePayProcessTransientToken(
    transientToken
) {

    console.log(
        "🔥 Sending POS transient token to Odoo..."
    );


    const response =
        await fetch(
            "/payment/safepay/pos/process_token",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        tracker_token:
                            posSafePayTrackerToken,

                        transient_token:
                            transientToken
                    })
            }
        );


    const result =
        await response.json();


    console.log(
        "🔥 POS PROCESS TOKEN RESPONSE:",
        result
    );


    if (!response.ok) {

        throw new Error(
            result?.error ||
            "SafePay process-token request failed"
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


    if (!payerAuthentication) {

        throw new Error(
            "SafePay payer authentication information missing"
        );
    }


    const accessToken =
        payerAuthentication.access_token;


    const collectionUrl =
        payerAuthentication.device_data_collection_url;


    if (
        !accessToken ||
        !collectionUrl
    ) {

        throw new Error(
            "SafePay device collection information incomplete"
        );
    }


    console.log(
        "✅ SafePay payer authentication setup received"
    );


    /*
     * NEXT:
     *
     * Transient token
     * ↓
     * Cardinal device collection
     */

    const sessionId =
        await posSafePayPerformDeviceCollection(
            accessToken,
            collectionUrl
        );


    /*
     * NEXT:
     *
     * Device fingerprint
     * ↓
     * Payer authentication enrollment
     */

    await posSafePayStartPayerAuthenticationEnrollment(
        sessionId
    );
}


/* =========================================================
 * CARDINAL DEVICE COLLECTION
 * ========================================================= */

function posSafePayPerformDeviceCollection(
    accessToken,
    collectionUrl
) {

    return new Promise(
        (resolve, reject) => {

            const sessionId =
                crypto.randomUUID();


            posSafePayDeviceSessionId =
                sessionId;


            console.log(
                "========================================"
            );

            console.log(
                "🔥 STARTING CARDINAL DEVICE COLLECTION"
            );

            console.log(
                "Device Session:",
                sessionId
            );


            let iframe =
                document.querySelector(
                    'iframe[name="pos-safepay-cardinal-frame"]'
                );


            if (!iframe) {

                iframe =
                    document.createElement(
                        "iframe"
                    );

                iframe.name =
                    "pos-safepay-cardinal-frame";

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
                "pos-safepay-cardinal-frame";

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


            const cleanup =
                () => {

                    window.removeEventListener(
                        "message",
                        messageHandler
                    );


                    if (timeoutId) {

                        clearTimeout(
                            timeoutId
                        );
                    }


                    if (
                        form.parentNode
                    ) {

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
                        "🔥 Cardinal message:",
                        event.data
                    );


                    const message =
                        event.data;


                    const messageString =
                        typeof message === "string"
                            ? message
                            : JSON.stringify(
                                message
                            );


                    const lowerMessage =
                        messageString.toLowerCase();


                    /*
                     * Keep this deliberately broad
                     * for your sandbox testing.
                     */

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
                        "✅ CARDINAL DEVICE COLLECTION COMPLETED"
                    );


                    cleanup();


                    resolve(
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


                        reject(
                            new Error(
                                "Cardinal device fingerprinting timed out"
                            )
                        );

                    },
                    30000
                );


            console.log(
                "🔥 Submitting Cardinal device collection form..."
            );


            form.submit();


            console.log(
                "✅ Device collection form submitted"
            );
        }
    );
}


/* =========================================================
 * PAYER AUTHENTICATION ENROLLMENT
 * ========================================================= */

async function posSafePayStartPayerAuthenticationEnrollment(
    deviceFingerprintSessionId
) {

    if (
        posSafePayEnrollmentStarted
    ) {

        console.log(
            "⚠️ POS SafePay enrollment already started"
        );

        return;
    }


    posSafePayEnrollmentStarted =
        true;


    console.log(
        "========================================"
    );

    console.log(
        "🔥 STARTING POS PAYER AUTH ENROLLMENT"
    );

    console.log(
        "Tracker:",
        posSafePayTrackerToken
    );

    console.log(
        "Device Session:",
        deviceFingerprintSessionId
    );


    posSafePaySetStatus(
        "Verifying payment..."
    );


    try {

        /*
         * Backend creates the SafePay guest JWT.
         *
         * Backend also gets the customer/billing
         * information from the POS order.
         */

        const response =
            await fetch(
                "/payment/safepay/pos/payer_auth_enrollment",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            tracker_token:
                                posSafePayTrackerToken,

                            device_fingerprint_session_id:
                                deviceFingerprintSessionId
                        })
                }
            );


        const result =
            await response.json();


        console.log(
            "🔥 POS PAYER AUTH RESPONSE:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result?.error ||
                "Payer authentication request failed"
            );
        }


        if (!result.success) {

            throw new Error(
                result?.error ||
                "Payer authentication unsuccessful"
            );
        }


        console.log(
            "✅ POS payer authentication response received"
        );


        await posSafePayHandleAuthenticationResponse(
            result.data
        );


    } catch (error) {

        console.error(
            "❌ POS payer authentication error:",
            error
        );


        posSafePayEnrollmentStarted =
            false;


        posSafePaySetError(
            error.message ||
            "Payer authentication failed"
        );
    }
}


/* =========================================================
 * HANDLE AUTHENTICATION RESPONSE
 * ========================================================= */

async function posSafePayHandleAuthenticationResponse(
    data
) {

    console.log(
        "🔥 POS SafePay Authentication Result:",
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
            "Authentication Status:",
            authentication.authentication_status
        );

        console.log(
            "Enrollment Status:",
            authentication.enrollment_status
        );

        console.log(
            "PARES Status:",
            authentication.pares_status
        );
    }


    const nextAction =
        tracker?.next_actions?.CYBERSOURCE?.kind;


    console.log(
        "SafePay Next Action Kind:",
        nextAction
    );


    /*
     * IMPORTANT:
     *
     * We do not assume only one exact
     * authentication response shape.
     *
     * If SafePay says authorization is the
     * next action, continue.
     */

    if (
        nextAction ===
        "AUTHORIZATION"
    ) {

        console.log(
            "🟢 SafePay authentication complete."
        );

        console.log(
            "🔥 Authorization is the next action."
        );


        await posSafePayAuthorizePayment();

        return;
    }


    if (
        authentication?.enrollment_status ===
        "AUTHENTICATION_SUCCESSFUL"
    ) {

        console.log(
            "🟢 SafePay authentication successful."
        );


        /*
         * Sometimes the authorization action
         * is represented differently in the
         * response.
         */

        if (
            nextAction ===
            "AUTHORIZATION"
        ) {

            await posSafePayAuthorizePayment();

            return;
        }
    }


    console.error(
        "❌ SafePay authentication did not reach authorization-ready state.",
        data
    );


    posSafePaySetError(
        "Payment authentication was not completed."
    );


    posSafePayEnrollmentStarted =
        false;
}


/* =========================================================
 * AUTHORIZE + CAPTURE PAYMENT
 * ========================================================= */

async function posSafePayAuthorizePayment() {

    if (
        posSafePayAuthorizationStarted
    ) {

        console.log(
            "⚠️ POS SafePay authorization already started"
        );

        return;
    }


    posSafePayAuthorizationStarted =
        true;


    console.log(
        "========================================"
    );

    console.log(
        "🔥 STARTING POS SAFEPAY AUTHORIZATION"
    );

    console.log(
        "Tracker:",
        posSafePayTrackerToken
    );


    posSafePaySetStatus(
        "Authorizing payment..."
    );


    try {

        const response =
            await fetch(
                "/payment/safepay/pos/authorize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            tracker_token:
                                posSafePayTrackerToken
                        })
                }
            );


        const result =
            await response.json();


        console.log(
            "🔥 POS SAFEPAY AUTHORIZATION RESPONSE:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result?.error ||
                "SafePay authorization request failed"
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
            statusMessage &&
            statusMessage !== "success"
        ) {

            throw new Error(
                authorizationData?.status?.errors?.join(
                    ", "
                ) ||
                "SafePay authorization failed"
            );
        }


        console.log(
            "========================================"
        );

        console.log(
            "🎉🎉 POS SAFEPAY PAYMENT SUCCESSFUL 🎉🎉"
        );

        console.log(
            "========================================"
        );


        const line =
            window.posSafePayCurrentPaymentLine;


        /*
         * The payment interface will be connected
         * to the payment line through this reference.
         */

        if (line) {

            line.setPaymentStatus(
                "done"
            );
        }


        posSafePayCloseCardForm();


    } catch (error) {

        console.error(
            "❌ POS SafePay authorization error:",
            error
        );


        posSafePayAuthorizationStarted =
            false;


        posSafePaySetError(
            error.message ||
            "Payment authorization failed"
        );
    }
}


/* =========================================================
 * CLOSE CARD FORM
 * ========================================================= */

function posSafePayCloseCardForm() {

    const container =
        document.getElementById(
            "pos-safepay-container"
        );


    if (container) {

        container.remove();
    }


    posSafePayMicroform =
        null;

    posSafePayTrackerToken =
        null;

    posSafePayDeviceSessionId =
        null;

    posSafePayEnrollmentStarted =
        false;

    posSafePayAuthorizationStarted =
        false;
}


/* =========================================================
 * POS PAYMENT INTERFACE
 * ========================================================= */

export class PaymentSafePay
    extends PaymentInterface {


    setup() {

        super.setup(
            ...arguments
        );


        console.log(
            "🔥 SafePay POS payment interface initialized"
        );
    }


    async sendPaymentRequest(uuid) {

        console.log(
            "========================================"
        );

        console.log(
            "🔥 SAFEPAY POS PAYMENT REQUEST"
        );

        console.log(
            "========================================"
        );


        const order =
            this.pos.getOrder();


        const line =
            order.getSelectedPaymentline();


        if (!line) {

            console.error(
                "❌ No SafePay payment line found"
            );

            return false;
        }


        const amount =
            Math.abs(
                line.amount
            );


        const paymentMethod =
            line.payment_method_id;


        console.log(
            "💰 Amount:",
            amount
        );

        console.log(
            "💳 Payment Method ID:",
            paymentMethod.id
        );

        console.log(
            "💱 Currency:",
            this.pos.currency.name
        );


        try {

            line.setPaymentStatus(
                "waiting"
            );


            /*
             * Store payment line so the async
             * authorization step can mark it done.
             */

            window.posSafePayCurrentPaymentLine =
                line;


            /* -----------------------------------------
             * CREATE TRACKER
             * ----------------------------------------- */

            console.log(
                "🔥 Creating SafePay tracker..."
            );


            const result =
                await this.pos.data.call(
                    "pos.payment.method",
                    "safepay_create_tracker",
                    [
                        paymentMethod.id,
                        amount,
                        order.id || 0,
                        this.pos.currency.name,
                    ]
                );


            console.log(
                "🔥 SafePay tracker response:",
                result
            );


            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result?.error ||
                    "Failed to create SafePay tracker"
                );
            }


            console.log(
                "✅ SafePay tracker created:",
                result.tracker_token
            );


            line.safepay_tracker_token =
                result.tracker_token;


            line.safepay_capture_context_jwt =
                result.capture_context_jwt;


            /* -----------------------------------------
             * INITIALIZE FLEX
             * ----------------------------------------- */

            await posSafePayInitializeFlex(
                result.tracker_token,
                result.capture_context_jwt
            );


            console.log(
                "🟢 SafePay POS card interface initialized"
            );


            /*
             * DO NOT mark done.
             *
             * Card form is now waiting for the
             * cashier/customer to enter card details.
             */

            line.setPaymentStatus(
                "waiting"
            );


            return true;


        } catch (error) {

            console.error(
                "❌ SafePay POS payment error:",
                error
            );


            line.setPaymentStatus(
                "retry"
            );


            posSafePaySetError(
                error.message ||
                "SafePay payment failed"
            );


            return false;
        }
    }


    async sendPaymentCancel(
        order,
        uuid
    ) {

        console.log(
            "🔥 SafePay POS payment cancelled"
        );


        posSafePayCloseCardForm();


        const line =
            order?.getSelectedPaymentline?.();


        if (line) {

            line.setPaymentStatus(
                "retry"
            );
        }


        return true;
    }
}


/* =========================================================
 * REGISTER SAFEPAY POS PAYMENT METHOD
 * ========================================================= */

register_payment_method(
    "safepay",
    PaymentSafePay
);


console.log(
    "🔥🔥 POS SafePay payment method registered"
);