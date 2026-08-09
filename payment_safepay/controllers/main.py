# from odoo import http
# from odoo.http import request

# from ..services.safepay_api import (
#     process_transient_token,
#     create_guest_jwt,
#     payer_auth_enrollment,
#     authorize_payment,
# )


# class SafePayController(http.Controller):

#     @http.route(
#         "/payment/safepay/process_token",
#         type="http",
#         auth="public",
#         methods=["POST"],
#         csrf=False,
#     )
#     def process_token(self, **kwargs):
#         try:
#             data = request.get_json_data()

#             tracker_token = data.get("tracker_token")
#             transient_token = data.get("transient_token")

#             if not tracker_token:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Missing tracker_token",
#                     },
#                     status=400,
#                 )

#             if not transient_token:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Missing transient_token",
#                     },
#                     status=400,
#                 )

#             provider = request.env[
#                 "payment.provider"
#             ].sudo().search(
#                 [("code", "=", "safepay")],
#                 limit=1,
#             )

#             if not provider:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "SafePay provider not found",
#                     },
#                     status=500,
#                 )

#             result = process_transient_token(
#                 provider.safepay_api_url,
#                 provider.safepay_secret_key,
#                 tracker_token,
#                 transient_token,
#             )

#             payer_authentication_setup = (
#                 result["data"]["action"]["payer_authentication_setup"]
#             )

#             return request.make_json_response(
#                 {
#                     "success": True,
#                     "payer_authentication": {
#                         "access_token":
#                             payer_authentication_setup[
#                                 "access_token"
#                             ],
#                         "device_data_collection_url":
#                             payer_authentication_setup[
#                                 "device_data_collection_url"
#                             ],
#                     },
#                 }
#             )

#         except Exception as error:
#             print("SafePay process-token error:", error)

#             return request.make_json_response(
#                 {
#                     "success": False,
#                     "error": str(error),
#                 },
#                 status=500,
#             )

#     @http.route(
#         "/payment/safepay/payer_auth_enrollment",
#         type="http",
#         auth="public",
#         methods=["POST"],
#         csrf=False,
#     )
#     def payer_auth_enrollment(self, **kwargs):
#         try:
#             data = request.get_json_data()

#             tracker_token = data.get("tracker_token")
#             device_fingerprint_session_id = data.get(
#                 "device_fingerprint_session_id"
#             )

#             if not tracker_token:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Missing tracker_token",
#                     },
#                     status=400,
#                 )

#             if not device_fingerprint_session_id:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error":
#                             "Missing device_fingerprint_session_id",
#                     },
#                     status=400,
#                 )

#             provider = request.env[
#                 "payment.provider"
#             ].sudo().search(
#                 [("code", "=", "safepay")],
#                 limit=1,
#             )

#             if not provider:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "SafePay provider not found",
#                     },
#                     status=500,
#                 )

#             partner = request.env.user.partner_id

#             full_name = (
#                 partner.name or "Guest User"
#             ).strip()

#             name_parts = full_name.split(" ", 1)

#             first_name = name_parts[0]

#             last_name = (
#                 name_parts[1]
#                 if len(name_parts) > 1
#                 else ""
#             )

#             email = (
#                 partner.email or ""
#             ).strip()

#             if not email:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Customer email is missing",
#                     },
#                     status=400,
#                 )

#             phone = (
#                 partner.phone
#                 or partner.mobile
#                 or ""
#             ).strip()

#             if not phone:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Customer phone is missing",
#                     },
#                     status=400,
#                 )

#             country = (
#                 partner.country_id.code
#                 or ""
#             ).strip().upper()

#             if not country:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Customer country is missing",
#                     },
#                     status=400,
#                 )

#             street_1 = (
#                 partner.street or ""
#             ).strip()

#             street_2 = (
#                 partner.street2 or ""
#             ).strip()

#             city = (
#                 partner.city or ""
#             ).strip()

#             state = ""

#             if partner.state_id:
#                 state = (
#                     partner.state_id.code
#                     or partner.state_id.name
#                     or ""
#                 ).strip()

#             postal_code = (
#                 partner.zip or ""
#             ).strip()

#             missing_fields = []

#             if not street_1:
#                 missing_fields.append("street_1")

#             if not city:
#                 missing_fields.append("city")

#             if not state:
#                 missing_fields.append("state")

#             if not country:
#                 missing_fields.append("country")

#             if missing_fields:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error":
#                             "Customer billing address is incomplete",
#                         "missing_fields":
#                             missing_fields,
#                     },
#                     status=400,
#                 )

#             billing = {
#                 "street_1": street_1,
#                 "street_2": street_2,
#                 "city": city,
#                 "state": state,
#                 "postal_code": postal_code,
#                 "country": country,
#             }

#             guest_jwt = create_guest_jwt(
#                 provider.safepay_api_url,
#                 provider.safepay_secret_key,
#                 first_name,
#                 last_name,
#                 email,
#                 phone,
#                 country,
#             )

#             result = payer_auth_enrollment(
#                 provider.safepay_api_url,
#                 provider.safepay_secret_key,
#                 tracker_token,
#                 device_fingerprint_session_id,
#                 guest_jwt,
#                 billing,
#             )

#             print(
#                 "SafePay payer authentication enrollment completed."
#             )

#             return request.make_json_response(
#                 {
#                     "success": True,
#                     "data": result,
#                 }
#             )

#         except Exception as error:
#             print(
#                 "SafePay payer authentication enrollment error:",
#                 error,
#             )

#             return request.make_json_response(
#                 {
#                     "success": False,
#                     "error": str(error),
#                 },
#                 status=500,
#             )

#     @http.route(
#         "/payment/safepay/authorize",
#         type="http",
#         auth="public",
#         methods=["POST"],
#         csrf=False,
#     )
#     def authorize(self, **kwargs):
#         try:
#             data = request.get_json_data()

#             tracker_token = data.get("tracker_token")

#             if not tracker_token:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Missing tracker_token",
#                     },
#                     status=400,
#                 )

#             provider = request.env[
#                 "payment.provider"
#             ].sudo().search(
#                 [("code", "=", "safepay")],
#                 limit=1,
#             )

#             if not provider:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error":
#                             "SafePay provider not found",
#                     },
#                     status=500,
#                 )

#             partner = request.env.user.partner_id

#             full_name = (
#                 partner.name or "Guest User"
#             ).strip()

#             name_parts = full_name.split(" ", 1)

#             first_name = name_parts[0]

#             last_name = (
#                 name_parts[1]
#                 if len(name_parts) > 1
#                 else ""
#             )

#             email = (
#                 partner.email or ""
#             ).strip()

#             phone = (
#                 partner.phone
#                 or partner.mobile
#                 or ""
#             ).strip()

#             country = (
#                 partner.country_id.code
#                 or "PK"
#             ).strip().upper()

#             if not email:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Customer email is missing",
#                     },
#                     status=400,
#                 )

#             if not phone:
#                 return request.make_json_response(
#                     {
#                         "success": False,
#                         "error": "Customer phone is missing",
#                     },
#                     status=400,
#                 )

#             guest_jwt = create_guest_jwt(
#                 provider.safepay_api_url,
#                 provider.safepay_secret_key,
#                 first_name,
#                 last_name,
#                 email,
#                 phone,
#                 country,
#             )

#             result = authorize_payment(
#                 provider.safepay_api_url,
#                 provider.safepay_secret_key,
#                 tracker_token,
#                 guest_jwt,
#             )

#             print(
#                 "SafePay authorization completed:"
#             )

#             print(result)

#             return request.make_json_response(
#                 {
#                     "success": True,
#                     "data": result,
#                 }
#             )

#         except Exception as error:
#             print(
#                 "SafePay authorization error:",
#                 error,
#             )

#             return request.make_json_response(
#                 {
#                     "success": False,
#                     "error": str(error),
#                 },
#                 status=500,
#             )

#     @http.route(
#     "/payment/safepay/success",
#     type="http",
#     auth="public",
#     website=True,
# )
#     def safepay_success(self, **kwargs):
#         return """
#             <h1>Payment Successful</h1>
#             <p>SafePay payment was authorized successfully.</p>
#         """


from odoo import http
from odoo.http import request

from ..services.safepay_api import (
process_transient_token,
create_guest_jwt,
payer_auth_enrollment,
authorize_payment,
)

class SafePayController(http.Controller):

# ---------------------------------------------------------
# 1. PROCESS TRANSIENT TOKEN
# ---------------------------------------------------------

    @http.route(
        "/payment/safepay/process_token",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def process_token(self, **kwargs):

        try:
            data = request.get_json_data() or {}

            tracker_token = data.get("tracker_token")
            transient_token = data.get("transient_token")

            if not tracker_token:
                return request.make_json_response(
                    {
                        "success": False,
                        "error": "Missing tracker_token",
                    },
                    status=400,
                )

            if not transient_token:
                return request.make_json_response(
                    {
                        "success": False,
                        "error": "Missing transient_token",
                    },
                    status=400,
                )

            provider = request.env[
                "payment.provider"
            ].sudo().search(
                [("code", "=", "safepay")],
                limit=1,
            )

            if not provider:
                return request.make_json_response(
                    {
                        "success": False,
                        "error": "SafePay provider not found",
                    },
                    status=500,
                )

            result = process_transient_token(
                provider.safepay_api_url,
                provider.safepay_secret_key,
                tracker_token,
                transient_token,
            )

            payer_authentication_setup = (
                result["data"]["action"]["payer_authentication_setup"]
            )

            return request.make_json_response(
                {
                    "success": True,
                    "payer_authentication": {
                        "access_token": payer_authentication_setup[
                            "access_token"
                        ],
                        "device_data_collection_url":
                            payer_authentication_setup[
                                "device_data_collection_url"
                            ],
                    },
                }
            )

        except Exception as error:

            print(
                "SafePay process-token error:",
                error,
            )

            return request.make_json_response(
                {
                    "success": False,
                    "error": str(error),
                },
                status=500,
            )

    # ---------------------------------------------------------
    # 2. PAYER AUTHENTICATION ENROLLMENT
    # ---------------------------------------------------------

    @http.route(
        "/payment/safepay/payer_auth_enrollment",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def payer_auth_enrollment(self, **kwargs):

        try:
            data = request.get_json_data() or {}

            tracker_token = data.get("tracker_token")

            device_fingerprint_session_id = data.get(
                "device_fingerprint_session_id"
            )

            if not tracker_token:
                return request.make_json_response(
                    {
                        "success": False,
                        "error": "Missing tracker_token",
                    },
                    status=400,
                )

            if not device_fingerprint_session_id:
                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Missing device_fingerprint_session_id",
                    },
                    status=400,
                )

            provider = request.env[
                "payment.provider"
            ].sudo().search(
                [("code", "=", "safepay")],
                limit=1,
            )

            if not provider:
                return request.make_json_response(
                    {
                        "success": False,
                        "error": "SafePay provider not found",
                    },
                    status=500,
                )

            # -------------------------------------------------
            # CUSTOMER INFORMATION
            # -------------------------------------------------

            partner = request.env.user.partner_id

            full_name = (
                partner.name or "Guest User"
            ).strip()

            name_parts = full_name.split(" ", 1)

            first_name = name_parts[0]

            last_name = (
                name_parts[1]
                if len(name_parts) > 1
                else ""
            )

            email = (
                partner.email or ""
            ).strip()

            if not email:
                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Customer email is missing",
                    },
                    status=400,
                )

            phone = (
                partner.phone
                or partner.mobile
                or ""
            ).strip()

            if not phone:
                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Customer phone is missing",
                    },
                    status=400,
                )

            country = (
                partner.country_id.code
                or ""
            ).strip().upper()

            if not country:
                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Customer country is missing",
                    },
                    status=400,
                )

            # -------------------------------------------------
            # BILLING ADDRESS
            # -------------------------------------------------

            street_1 = (
                partner.street or ""
            ).strip()

            street_2 = (
                partner.street2 or ""
            ).strip()

            city = (
                partner.city or ""
            ).strip()

            state = ""

            if partner.state_id:
                state = (
                    partner.state_id.code
                    or partner.state_id.name
                    or ""
                ).strip()

            postal_code = (
                partner.zip or ""
            ).strip()

            missing_fields = []

            if not street_1:
                missing_fields.append("street_1")

            if not city:
                missing_fields.append("city")

            if not state:
                missing_fields.append("state")

            if not country:
                missing_fields.append("country")

            if missing_fields:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Customer billing address is incomplete",
                        "missing_fields":
                            missing_fields,
                    },
                    status=400,
                )

            billing = {
                "street_1": street_1,
                "street_2": street_2,
                "city": city,
                "state": state,
                "postal_code": postal_code,
                "country": country,
            }

            # -------------------------------------------------
            # CREATE GUEST JWT
            # -------------------------------------------------

            guest_jwt = create_guest_jwt(
                provider.safepay_api_url,
                provider.safepay_secret_key,
                first_name,
                last_name,
                email,
                phone,
                country,
            )

            # -------------------------------------------------
            # SAFEPAY PAYER AUTHENTICATION
            # -------------------------------------------------

            result = payer_auth_enrollment(
                provider.safepay_api_url,
                provider.safepay_secret_key,
                tracker_token,
                device_fingerprint_session_id,
                guest_jwt,
                billing,
            )
            # ---------------------------------------------------------
# FIND ODOO PAYMENT TRANSACTION
            # ---------------------------------------------------------

            tx = request.env[
                "payment.transaction"
            ].sudo().search(
                [
                    ("safepay_tracker_token", "=", tracker_token),
                    ("provider_code", "=", "safepay"),
                ],
                limit=1,
            )

            if not tx:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Odoo payment transaction not found",
                        "tracker_token":
                            tracker_token,
                    },
                    status=404,
                )

            print(
                "Odoo payment transaction found:",
                tx.reference,
            )

            # ---------------------------------------------------------
            # CHECK SAFEPAY AUTHORIZATION
            # ---------------------------------------------------------

            tracker_data = (
                result.get("data", {})
                .get("tracker", {})
            )

            tracker_state = tracker_data.get("state")

            authorization_data = (
                tracker_data.get("authorization", {})
            )

            authorization_token = authorization_data.get(
                "token"
            )

            status_data = result.get(
                "status",
                {}
            )

            status_message = status_data.get(
                "message"
            )

            if status_message != "success":

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "SafePay authorization was not successful",
                        "data": result,
                    },
                    status=400,
                )

            # ---------------------------------------------------------
            # MARK ODOO PAYMENT TRANSACTION AS DONE
            # ---------------------------------------------------------
            # ---------------------------------------------------------
# MARK ODOO PAYMENT TRANSACTION AS DONE
# ---------------------------------------------------------

            tx._set_done(
                state_message="SafePay payment authorized successfully."
            )

            print(
                "ODOO PAYMENT TRANSACTION MARKED DONE:",
                tx.reference,
            )

            # ---------------------------------------------------------
            # RUN ODOO PAYMENT POST-PROCESSING
            # ---------------------------------------------------------

            tx._post_process()

            print(
                "ODOO PAYMENT TRANSACTION POST-PROCESSED:",
                tx.reference,
            )
            # tx.confirm_related_sale_orders()

            print(
                "SafePay payer authentication enrollment completed."
            )

            return request.make_json_response(
                    {
                        "success": True,
                        "reference": tx.reference,
                        "tracker_token": tracker_token,
                        "tracker_state": tracker_state,
                        "authorization_token": authorization_token,
                        "status": status_message,
                        "data": result,
                    }
            )

        except Exception as error:

            print(
                "SafePay payer authentication enrollment error:",
                error,
            )

            return request.make_json_response(
                {
                    "success": False,
                    "error": str(error),
                },
                status=500,
            )

    # ---------------------------------------------------------
    # 3. AUTHORIZE PAYMENT
    # ---------------------------------------------------------

    @http.route(
        "/payment/safepay/authorize",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def authorize(self, **kwargs):

        try:

            data = request.get_json_data() or {}

            tracker_token = data.get("tracker_token")

            # IMPORTANT:
            # The frontend may send the transaction reference.
            # We accept it if available, but do not make it
            # mandatory yet because your current frontend sends
            # only tracker_token.

            transaction_reference = (
                data.get("reference")
                or data.get("transaction_reference")
            )

            if not tracker_token:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Missing tracker_token",
                    },
                    status=400,
                )

            provider = request.env[
                "payment.provider"
            ].sudo().search(
                [("code", "=", "safepay")],
                limit=1,
            )

            if not provider:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "SafePay provider not found",
                    },
                    status=500,
                )

            # -------------------------------------------------
            # CUSTOMER INFORMATION
            # -------------------------------------------------

            partner = request.env.user.partner_id

            full_name = (
                partner.name or "Guest User"
            ).strip()

            name_parts = full_name.split(" ", 1)

            first_name = name_parts[0]

            last_name = (
                name_parts[1]
                if len(name_parts) > 1
                else ""
            )

            email = (
                partner.email or ""
            ).strip()

            phone = (
                partner.phone
                or partner.mobile
                or ""
            ).strip()

            country = (
                partner.country_id.code
                or "PK"
            ).strip().upper()

            if not email:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Customer email is missing",
                    },
                    status=400,
                )

            if not phone:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Customer phone is missing",
                    },
                    status=400,
                )

            # -------------------------------------------------
            # CREATE GUEST JWT
            # -------------------------------------------------

            guest_jwt = create_guest_jwt(
                provider.safepay_api_url,
                provider.safepay_secret_key,
                first_name,
                last_name,
                email,
                phone,
                country,
            )

            # -------------------------------------------------
            # AUTHORIZE PAYMENT WITH SAFEPAY
            # -------------------------------------------------

            print(
                "STARTING SAFEPAY PAYMENT AUTHORIZATION"
            )

            print(
                "Tracker Token:",
                tracker_token,
            )

            if transaction_reference:

                print(
                    "Transaction Reference:",
                    transaction_reference,
                )

            result = authorize_payment(
                provider.safepay_api_url,
                provider.safepay_secret_key,
                tracker_token,
                guest_jwt,
            )

            print(
                "SafePay authorization completed:"
            )

            print(result)

            # -------------------------------------------------
            # CHECK SAFEPAY RESULT
            # -------------------------------------------------

            status_data = result.get(
                "status",
                {}
            )

            status_message = status_data.get(
                "message"
            )

            tracker_data = result.get(
                "data",
                {}
            ).get(
                "tracker",
                {}
            )

            tracker_state = tracker_data.get(
                "state"
            )

            authorization_data = tracker_data.get(
                "authorization",
                {}
            )

            authorization_token = authorization_data.get(
                "token"
            )

            # -------------------------------------------------
            # RETURN RESPONSE TO FRONTEND
            # -------------------------------------------------

            return request.make_json_response(
                {
                    "success": True,

                    "reference":
                        transaction_reference,

                    "tracker_token":
                        tracker_token,

                    "tracker_state":
                        tracker_state,

                    "authorization_token":
                        authorization_token,

                    "status":
                        status_message,

                    "data":
                        result,
                }
            )

        except Exception as error:

            print(
                "SafePay authorization error:",
                error,
            )

            return request.make_json_response(
                {
                    "success": False,
                    "error": str(error),
                },
                status=500,
            )

    # ---------------------------------------------------------
    # 4. SUCCESS PAGE
    # ---------------------------------------------------------

    @http.route(
        "/payment/safepay/success",
        type="http",
        auth="public",
        website=True,
    )
    def safepay_success(self, **kwargs):

        return """
            <h1>Payment Successful</h1>
            <p>SafePay payment was authorized successfully.</p>
        """
        # ---------------------------------------------------------
    # 4. SHIPMENT STATUS SYNC FROM FLASK
    # ---------------------------------------------------------

    @http.route(
        "/shipment/status/update",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def shipment_status_update(self, **kwargs):

        try:

            # -------------------------------------------------
            # AUTHENTICATE FLASK SHIPMENT SERVICE
            # -------------------------------------------------

            api_key = request.httprequest.headers.get(
                "X-SHIPMENT-API-KEY"
            )

            if api_key != "shipping_123456":

                return request.make_json_response(
                    {
                        "success": False,
                        "error": "Unauthorized",
                    },
                    status=401,
                )

            # -------------------------------------------------
            # READ REQUEST
            # -------------------------------------------------

            data = request.get_json_data() or {}

            tracking_number = data.get(
                "tracking_number"
            )

            status = data.get("status")

            order_id = data.get("order_id")

            if not tracking_number:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Missing tracking_number",
                    },
                    status=400,
                )

            if not status:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Missing status",
                    },
                    status=400,
                )

            print(
                "================================="
            )

            print(
                "SHIPMENT STATUS SYNC FROM FLASK"
            )

            print(
                "Tracking Number:",
                tracking_number,
            )

            print(
                "Status:",
                status,
            )

            print(
                "Order ID:",
                order_id,
            )

            print(
                "================================="
            )

            # -------------------------------------------------
            # ONLY VALIDATE ODOO DELIVERY WHEN PICKED UP
            # -------------------------------------------------

            if status != "Picked Up":

                return request.make_json_response(
                    {
                        "success": True,
                        "message":
                            "Shipment status updated. "
                            "No Odoo stock action required.",
                        "tracking_number":
                            tracking_number,
                        "status":
                            status,
                    }
                )

            # -------------------------------------------------
            # FIND ODOO PICKING
            # -------------------------------------------------

            picking_domain = [
                (
                    "safepay_tracking_number",
                    "=",
                    tracking_number,
                ),
            ]

            picking = request.env[
                "stock.picking"
            ].sudo().search(
                picking_domain,
                limit=1,
            )

            # -------------------------------------------------
            # FALLBACK: FIND BY SALE ORDER
            # -------------------------------------------------

            if not picking and order_id:

                picking = request.env[
                    "stock.picking"
                ].sudo().search(
                    [
                        (
                            "sale_id",
                            "=",
                            int(order_id),
                        ),
                        (
                            "picking_type_code",
                            "=",
                            "outgoing",
                        ),
                    ],
                    limit=1,
                )

            if not picking:

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Odoo delivery picking not found",
                        "tracking_number":
                            tracking_number,
                        "order_id":
                            order_id,
                    },
                    status=404,
                )

            print(
                "Odoo Picking Found:",
                picking.name,
            )

            print(
                "Current Picking State:",
                picking.state,
            )

            # -------------------------------------------------
            # ALREADY DONE
            # -------------------------------------------------

            if picking.state == "done":

                return request.make_json_response(
                    {
                        "success": True,
                        "message":
                            "Odoo picking is already validated.",
                        "tracking_number":
                            tracking_number,
                        "picking":
                            picking.name,
                        "state":
                            picking.state,
                    }
                )

            # -------------------------------------------------
            # CHECK PICKING IS READY
            # -------------------------------------------------

            if picking.state != "assigned":

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Odoo picking is not ready for validation.",
                        "picking":
                            picking.name,
                        "state":
                            picking.state,
                    },
                    status=400,
                )

            # -------------------------------------------------
            # VALIDATE PICKING
            # -------------------------------------------------

            print(
                "VALIDATING ODOO PICKING:",
                picking.name,
            )

            validation_result = (
                picking.button_validate()
            )

            # -------------------------------------------------
            # HANDLE VALIDATION WIZARD
            # -------------------------------------------------

            if isinstance(
                validation_result,
                dict
            ):

                print(
                    "Odoo validation returned:",
                    validation_result,
                )

                return request.make_json_response(
                    {
                        "success": False,
                        "message":
                            "Odoo requires additional "
                            "validation steps.",
                        "picking":
                            picking.name,
                        "validation_result":
                            validation_result,
                    },
                    status=400,
                )

            # -------------------------------------------------
            # VERIFY FINAL STATE
            # -------------------------------------------------

            picking.invalidate_recordset()

            print(
                "Picking state after validation:",
                picking.state,
            )

            if picking.state != "done":

                return request.make_json_response(
                    {
                        "success": False,
                        "error":
                            "Picking validation did not "
                            "complete.",
                        "picking":
                            picking.name,
                        "state":
                            picking.state,
                    },
                    status=500,
                )

            print(
                "================================="
            )

            print(
                "ODOO PICKING VALIDATED SUCCESSFULLY"
            )

            print(
                "Picking:",
                picking.name,
            )

            print(
                "Stock has been deducted."
            )

            print(
                "================================="
            )

            return request.make_json_response(
                {
                    "success": True,
                    "message":
                        "Shipment picked up and "
                        "Odoo delivery validated.",
                    "tracking_number":
                        tracking_number,
                    "picking":
                        picking.name,
                    "state":
                        picking.state,
                }
            )

        except Exception as error:

            print(
                "Shipment status sync error:",
                error,
            )

            return request.make_json_response(
                {
                    "success": False,
                    "error": str(error),
                },
                status=500,
            )
