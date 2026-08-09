# from odoo import models

# from ..services.safepay_api import (
#     create_tracker,
#     generate_capture_context,
#     process_transient_token,
# )


# class PaymentTransaction(models.Model):
#     _inherit = "payment.transaction"

#     def _get_specific_processing_values(self, processing_values):
#         """Return the values required to start a SafePay payment."""

#         res = super()._get_specific_processing_values(processing_values)

#         if self.provider_code != "safepay":
#             return res

#         provider = self.provider_id

#         tracker_result = create_tracker(
#             provider.safepay_api_url,
#             provider.safepay_client_id,
#             provider.safepay_secret_key,
#             self.amount,
#             self.currency_id.name,
#         )

#         tracker_token = tracker_result["data"]["tracker"]["token"]

#         capture_result = generate_capture_context(
#             provider.safepay_api_url,
#             provider.safepay_secret_key,
#             tracker_token,
#             "http://localhost:8070",
#         )

#         capture_context_jwt = (
#             capture_result["data"]["action"]["flex"]["capture_context_jwt"]
#         )

#         print("Capture Context JWT:", capture_context_jwt)

#         return {
#             **res,
#             "tracker_token": tracker_token,
#             "capture_context_jwt": capture_context_jwt,
#             "reference": self.reference,
#         }

#     def _apply_updates(self, payment_data):
#         """Update the Odoo transaction from SafePay payment data."""

#         if self.provider_code != "safepay":
#             return super()._apply_updates(payment_data)

#         status = payment_data.get("status")

#         if status == "success":
#             authorization_token = payment_data.get("authorization_token")

#             if authorization_token:
#                 self.provider_reference = authorization_token

#             self._set_authorized()

#         else:
#             self._set_error(
#                 "SafePay payment authorization failed."
#             )

#     def process_transient_token(self, tracker_token, transient_token):
#         """Process the transient token received from SafePay."""

#         provider = self.provider_id

#         return process_transient_token(
#             provider.safepay_api_url,
#             provider.safepay_secret_key,
#             tracker_token,
#             transient_token,
#         )
#### Above one is with apply updates below is working code


# from odoo import fields, models

# from ..services.safepay_api import (
#     create_tracker,
#     generate_capture_context,
#     process_transient_token,
# )


# class PaymentTransaction(models.Model):
#     _inherit = "payment.transaction"

#     safepay_tracker_token = fields.Char(
#         string="SafePay Tracker Token",
#         copy=False,
#     )

#     def _get_specific_processing_values(self, processing_values):

#         res = super()._get_specific_processing_values(
#             processing_values
#         )

#         if self.provider_code != "safepay":
#             return res

#         provider = self.provider_id

#         tracker_result = create_tracker(
#             provider.safepay_api_url,
#             provider.safepay_client_id,
#             provider.safepay_secret_key,
#             self.amount,
#             self.currency_id.name,
#         )

#         tracker_token = (
#             tracker_result["data"]["tracker"]["token"]
#         )

#         # Store SafePay tracker on THIS Odoo transaction.
#         self.safepay_tracker_token = tracker_token

#         capture_result = generate_capture_context(
#             provider.safepay_api_url,
#             provider.safepay_secret_key,
#             tracker_token,
#             "http://localhost:8070",
#         )

#         capture_context_jwt = (
#             capture_result["data"]["action"]["flex"][
#                 "capture_context_jwt"
#             ]
#         )

#         print(
#             "SafePay Tracker Token:",
#             tracker_token,
#         )

#         return {
#             **res,
#             "tracker_token": tracker_token,
#             "capture_context_jwt": capture_context_jwt,
#             "reference": self.reference,
#         }

#     def process_transient_token(
#         self,
#         tracker_token,
#         transient_token,
#     ):
#         provider = self.provider_id

#         return process_transient_token(
#             provider.safepay_api_url,
#             provider.safepay_secret_key,
#             tracker_token,
#             transient_token,
#         )





from odoo import fields, models

from ..services.safepay_api import (
    create_tracker,
    generate_capture_context,
    process_transient_token,
)


class PaymentTransaction(models.Model):
    _inherit = "payment.transaction"

    safepay_tracker_token = fields.Char(
        string="SafePay Tracker Token",
        copy=False,
    )

    def _get_specific_processing_values(self, processing_values):
        res = super()._get_specific_processing_values(
            processing_values
        )

        if self.provider_code != "safepay":
            return res

        provider = self.provider_id

        tracker_result = create_tracker(
            provider.safepay_api_url,
            provider.safepay_client_id,
            provider.safepay_secret_key,
            self.amount,
            self.currency_id.name,
        )

        tracker_token = (
            tracker_result["data"]["tracker"]["token"]
        )

        # Store SafePay tracker token on this Odoo transaction.
        self.safepay_tracker_token = tracker_token

        capture_result = generate_capture_context(
            provider.safepay_api_url,
            provider.safepay_secret_key,
            tracker_token,
            "http://localhost:8070",
        )

        capture_context_jwt = (
            capture_result["data"]["action"]["flex"][
                "capture_context_jwt"
            ]
        )

        print(
            "SafePay Tracker Token:",
            tracker_token,
        )

        return {
            **res,
            "tracker_token": tracker_token,
            "capture_context_jwt": capture_context_jwt,
            "reference": self.reference,
        }

    def process_transient_token(
        self,
        tracker_token,
        transient_token,
    ):
        provider = self.provider_id

        return process_transient_token(
            provider.safepay_api_url,
            provider.safepay_secret_key,
            tracker_token,
            transient_token,
        )

    # def confirm_related_sale_orders(self):
    #     """Confirm sale orders after successful SafePay payment."""

    #     for transaction in self:
    #         if transaction.provider_code != "safepay":
    #             continue

    #         if transaction.state != "done":
    #             continue

    #         for order in transaction.sale_order_ids:
    #             if order.state == "draft":
    #                 print(
    #                     "Confirming Sale Order after SafePay payment:",
    #                     order.name,
    #                 )

    #                 order.action_confirm()

    #                 print(
    #                     "Sale Order confirmed:",
    #                     order.name,
    #                 )
