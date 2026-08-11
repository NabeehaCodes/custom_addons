
from odoo import api, fields, models, _
from odoo.exceptions import AccessError, UserError

from odoo.addons.payment_safepay.services.safepay_api import (
    create_tracker,
    pos_generate_capture_context,
)

class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    def _get_payment_terminal_selection(self):
        return super()._get_payment_terminal_selection() + [
            ("safepay", "SafePay"),
        ]

    safepay_serial_number = fields.Char(
        string="SafePay Terminal",
        copy=False,
    )

    @api.model
    def _load_pos_data_fields(self, config):
        params = super()._load_pos_data_fields(config)
        params += ["safepay_serial_number"]
        return params

    def _get_safepay_payment_provider(self):
        provider = self.env["payment.provider"].search(
            [
                ("code", "=", "safepay"),
                ("company_id", "=", self.env.company.id),
            ],
            limit=1,
        )

        if not provider:
            raise UserError(
                _(
                    "SafePay payment provider for company %s is missing.",
                    self.env.company.name,
                )
            )

        return provider

    
        
    @api.model
    def safepay_create_tracker(
        self,
        payment_method_id,
        amount,
        order_id,
        currency,
    ):
        if not self.env.user.has_group(
            "point_of_sale.group_pos_user"
        ):
            raise AccessError(
                _("You do not have access to SafePay payments.")
            )

        payment_method = self.browse(payment_method_id)

        if not payment_method.exists():
            raise UserError(
                _("SafePay payment method was not found.")
            )

        if payment_method.payment_method_type != "terminal":
            raise UserError(
                _("SafePay must be configured as a payment terminal.")
            )

        provider = (
            payment_method
            .sudo()
            ._get_safepay_payment_provider()
        )

        if not provider.safepay_api_url:
            raise UserError(
                _("SafePay API URL is not configured.")
            )

        if not provider.safepay_secret_key:
            raise UserError(
                _("SafePay secret key is not configured.")
            )

        if not provider.safepay_client_id:
            raise UserError(
                _("SafePay Merchant API Key is not configured.")
            )

        tracker_response = create_tracker(
            provider.safepay_api_url,
            provider.safepay_client_id,
            provider.safepay_secret_key,
            amount,
            currency,
        )

        tracker_token = (
            tracker_response
            .get("data", {})
            .get("tracker", {})
            .get("token")
        )

        if not tracker_token:
            raise UserError(
                _("SafePay did not return a tracker token.")
            )

        capture_context = pos_generate_capture_context(
            provider.safepay_api_url,
            provider.safepay_secret_key,
            tracker_token,
        )

        return {
            "success": True,
            "tracker_token": tracker_token,
            "capture_context_jwt": capture_context,
        }
