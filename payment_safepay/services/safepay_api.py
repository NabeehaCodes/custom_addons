# import json
# import requests


# def create_tracker(api_url, client_id, secret_key, amount, currency):
#     """Create a SafePay payment tracker."""
#     print("Create tracker called")

#     payload = {
#         "merchant_api_key": client_id,
#         "intent": "CYBERSOURCE",
#         "mode": "payment",
#         "entry_mode": "flex",
#         "currency": currency,
#         "amount": int(amount),
#     }

#     response = requests.post(
#         f"{api_url}/order/payments/v3/",
#         headers={
#             "X-SFPY-MERCHANT-SECRET": secret_key,
#             "Content-Type": "application/json",
#         },
#         json=payload,
#         timeout=30,
#     )

#     response.raise_for_status()

#     data = response.json()

#     print("Create tracker response:")
#     print(json.dumps(data, indent=4))

#     return data


# def generate_capture_context(
#     api_url,
#     secret_key,
#     tracker_token,
#     origin_url="http://localhost:8070",
# ):
#     """Generate the SafePay/CyberSource capture context."""
#     print("Generate capture context called")

#     payload = {
#         "payload": {
#             "origin": origin_url,
#         }
#     }

#     response = requests.post(
#         f"{api_url}/order/payments/v3/{tracker_token}",
#         headers={
#             "X-SFPY-MERCHANT-SECRET": secret_key,
#             "Content-Type": "application/json",
#         },
#         json=payload,
#         timeout=30,
#     )

#     response.raise_for_status()

#     data = response.json()

#     print("Generate capture context response:")
#     print(json.dumps(data, indent=4))

#     return data


# def process_transient_token(
#     api_url,
#     secret_key,
#     tracker_token,
#     transient_token,
# ):
#     """Send the Flex transient token to SafePay."""
#     print("Process transient token called")

#     payload = {
#         "payload": {
#             "payment_method": {
#                 "flex": {
#                     "transient_token_jwt": transient_token,
#                 }
#             }
#         }
#     }

#     response = requests.post(
#         f"{api_url}/order/payments/v3/{tracker_token}",
#         headers={
#             "X-SFPY-MERCHANT-SECRET": secret_key,
#             "Content-Type": "application/json",
#         },
#         json=payload,
#         timeout=30,
#     )

#     print("SafePay process-token status:", response.status_code)
#     print("SafePay process-token response:", response.text)

#     response.raise_for_status()

#     data = response.json()

#     print("Process Token Response:")
#     print(json.dumps(data, indent=4))

#     return data

# def create_guest_jwt(
#     api_url,
#     secret_key,
#     first_name,
#     last_name,
#     email,
#     phone,
#     country="PK",
# ):
#     """
#     Create a SafePay guest JWT.

#     The JWT is used for SafePay payment
#     authentication/enrollment requests.
#     """

#     print("Creating SafePay guest JWT...")

#     url = f"{api_url}/user/v1/guest/"

#     payload = {
#         "first_name": first_name,
#         "last_name": last_name,
#         "email": email,
#         "phone": phone,
#         "country": country,
#     }

#     response = requests.post(
#         url,
#         headers={
#             "X-SFPY-MERCHANT-SECRET": secret_key,
#             "Content-Type": "application/json",
#         },
#         json=payload,
#         timeout=30,
#     )

#     print(
#         "SafePay guest JWT status:",
#         response.status_code,
#     )

#     response.raise_for_status()

#     data = response.json()

#     guest_jwt = data["data"]["session"]

#     print(
#         "SafePay guest JWT created successfully."
#     )

#     return guest_jwt


# def payer_auth_enrollment(
#     api_url,
#     secret_key,
#     tracker_token,
#     device_fingerprint_session_id,
#     guest_jwt,
# ):
#     """
#     Perform SafePay PAYER_AUTH_ENROLLMENT
#     after Cardinal device fingerprinting.
#     """

#     print("Payer authentication enrollment called")

#     url = f"{api_url}/order/payments/v3/{tracker_token}"

#     payload = {
#         "payload": {
#             "billing": {
#                 "use_synthetic": True
#             },

#             "authorization": {
#                 "do_capture": True
#             },

#             "authentication_setup": {
#                 "success_url": "http://localhost:8070/payment/safepay/success",
#                 "failure_url": "http://localhost:8070/payment/safepay/failure",
#                 "device_fingerprint_session_id":
#                     device_fingerprint_session_id,
#             },
#         }
#     }

#     response = requests.post(
#         url,
#         headers={
#             "X-SFPY-MERCHANT-SECRET": secret_key,
#             "Authorization": f"Bearer {guest_jwt}",
#             "Content-Type": "application/json",
#         },
#         json=payload,
#         timeout=30,
#     )

#     print(
#         "SafePay payer-auth enrollment status:",
#         response.status_code,
#     )

#     print(
#         "SafePay payer-auth enrollment response:",
#         response.text,
#     )

#     response.raise_for_status()

#     data = response.json()

#     print(
#         "Payer Authentication Enrollment Response:"
#     )

#     print(
#         json.dumps(
#             data,
#             indent=4,
#         )
#     )

#     return data


import json
import requests


# =========================================================
# CREATE TRACKER
# =========================================================

def create_tracker(
    api_url,
    client_id,
    secret_key,
    amount,
    currency,
):
    """
    Create a SafePay payment tracker.
    """

    print("Create tracker called")

    payload = {
        "merchant_api_key": client_id,
        "intent": "CYBERSOURCE",
        "mode": "payment",
        "entry_mode": "flex",
        "currency": currency,
        "amount": int(amount),
    }

    response = requests.post(
        f"{api_url}/order/payments/v3/",
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "SafePay create tracker status:",
        response.status_code,
    )

    print(
        "SafePay create tracker response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    print("Create tracker response:")
    print(json.dumps(data, indent=4))

    return data


# =========================================================
# GENERATE CAPTURE CONTEXT
# =========================================================

def generate_capture_context(
    api_url,
    secret_key,
    tracker_token,
    origin_url="http://localhost:8070",
):
    """
    Generate the SafePay/CyberSource capture context.
    """

    print("Generate capture context called")

    payload = {
        "payload": {
            "origin": origin_url,
        }
    }

    response = requests.post(
        f"{api_url}/order/payments/v3/{tracker_token}",
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "SafePay capture context status:",
        response.status_code,
    )

    print(
        "SafePay capture context response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    print("Generate capture context response:")
    print(json.dumps(data, indent=4))

    return data

def pos_generate_capture_context(
    api_url,
    secret_key,
    tracker_token,
    origin_url="http://localhost:8070",
):
    """
    Generate the SafePay/CyberSource capture context for POS.
    """

    print("📡 POS Generate Capture Context called")

    payload = {
        "payload": {
            "origin": origin_url,
        }
    }

    response = requests.post(
        f"{api_url}/order/payments/v3/{tracker_token}",
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "📡 SafePay POS capture context status:",
        response.status_code,
    )

    print(
        "📡 SafePay POS capture context response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    capture_context_jwt = (
        data
        .get("data", {})
        .get("action", {})
        .get("flex", {})
        .get("capture_context_jwt")
    )

    if not capture_context_jwt:
        raise ValueError(
            "SafePay did not return capture_context_jwt."
        )

    print("✅ POS Capture Context JWT extracted")

    return capture_context_jwt
# =========================================================
# PROCESS TRANSIENT TOKEN
# =========================================================

def process_transient_token(
    api_url,
    secret_key,
    tracker_token,
    transient_token,
):
    """
    Send the Cybersource Flex transient token
    to SafePay.

    This starts the payer-authentication setup and
    returns the Cardinal device-data-collection
    information.
    """

    print("Process transient token called")

    payload = {
        "payload": {
            "payment_method": {
                "flex": {
                    "transient_token_jwt": transient_token,
                }
            }
        }
    }

    response = requests.post(
        f"{api_url}/order/payments/v3/{tracker_token}",
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "SafePay process-token status:",
        response.status_code,
    )

    print(
        "SafePay process-token response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    print("Process Token Response:")
    print(json.dumps(data, indent=4))

    return data


# =========================================================
# CREATE GUEST JWT
# =========================================================

def create_guest_jwt(
    api_url,
    secret_key,
    first_name,
    last_name,
    email,
    phone,
    country="PK",
):
    """
    Create a SafePay guest JWT.

    The customer information comes from Odoo.
    """

    print("Creating SafePay guest JWT...")

    url = f"{api_url}/user/v1/guest/"

    payload = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "country": country,
    }

    print(
        "SafePay guest JWT payload:",
        {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "country": country,
        },
    )

    response = requests.post(
        url,
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "SafePay guest JWT status:",
        response.status_code,
    )

    print(
        "SafePay guest JWT response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    guest_jwt = data["data"]["session"]

    print(
        "SafePay guest JWT created successfully."
    )

    return guest_jwt


# =========================================================
# PAYER AUTHENTICATION ENROLLMENT
# =========================================================

def payer_auth_enrollment(
    api_url,
    secret_key,
    tracker_token,
    device_fingerprint_session_id,
    guest_jwt,
    billing,
):
    """
    Perform SafePay PAYER_AUTH_ENROLLMENT after
    Cardinal device fingerprinting.

    billing must contain the customer's Odoo
    billing address.
    """

    print(
        "Payer authentication enrollment called"
    )

    url = (
        f"{api_url}/order/payments/v3/"
        f"{tracker_token}"
    )

    payload = {
        "payload": {

            # -----------------------------------------
            # CUSTOMER BILLING ADDRESS
            # -----------------------------------------

            "billing": {
                "street_1": billing["street_1"],
                "street_2": billing.get(
                    "street_2",
                    "",
                ),
                "city": billing["city"],
                "state": billing["state"],
                "postal_code": billing.get(
                    "postal_code",
                    "",
                ),
                "country": billing["country"],
            },

            # -----------------------------------------
            # AUTHORIZATION
            # -----------------------------------------

            "authorization": {
                "do_capture": True,
            },

            # -----------------------------------------
            # PAYER AUTHENTICATION
            # -----------------------------------------

            "authentication_setup": {

                "success_url":
                    "http://localhost:8070/"
                    "payment/safepay/success",

                "failure_url":
                    "http://localhost:8070/"
                    "payment/safepay/failure",

                "device_fingerprint_session_id":
                    device_fingerprint_session_id,
            },
        }
    }

    print(
        "SafePay enrollment billing:",
        billing,
    )

    response = requests.post(
        url,
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Authorization":
                f"Bearer {guest_jwt}",
            "Content-Type":
                "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "SafePay payer-auth enrollment status:",
        response.status_code,
    )

    print(
        "SafePay payer-auth enrollment response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    print(
        "Payer Authentication Enrollment Response:"
    )

    print(
        json.dumps(
            data,
            indent=4,
        )
    )

    return data
def authorize_payment(
    api_url,
    secret_key,
    tracker_token,
    guest_jwt,
):
    """
    Authorize and capture the SafePay payment
    after successful payer authentication.
    """

    print("=================================")
    print("SafePay authorization called")
    print("Tracker:", tracker_token)
    print("=================================")

    url = f"{api_url}/order/payments/v3/{tracker_token}"

    payload = {
        "payload": {
            "authorization": {
                "do_capture": True,
            }
        }
    }

    response = requests.post(
        url,
        headers={
            "X-SFPY-MERCHANT-SECRET": secret_key,
            "Authorization": f"Bearer {guest_jwt}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    print(
        "SafePay authorization status:",
        response.status_code,
    )

    print(
        "SafePay authorization response:",
        response.text,
    )

    response.raise_for_status()

    data = response.json()

    print("SafePay authorization result:")
    print(
        json.dumps(
            data,
            indent=4,
        )
    )

    return data