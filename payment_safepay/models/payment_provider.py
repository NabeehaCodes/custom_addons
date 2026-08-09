# from odoo import models, fields


# class PaymentProvider(models.Model):
#     _inherit = "payment.provider"

#     code = fields.Selection(
#         selection_add=[("safepay", "SafePay")],
#         ondelete={"safepay": "set default"},
#     )

#     def _get_default_payment_method_codes(self):
#         res = super()._get_default_payment_method_codes()
#         if self.code == "safepay":
#             return []
#         return res

# from odoo import models, fields


# class PaymentProvider(models.Model):
#     _inherit = "payment.provider"

#     code = fields.Selection(
#         selection_add=[("safepay", "SafePay Gateway Test")],
#         ondelete={"safepay": "set default"},
#     )

#     def _get_default_payment_method_codes(self):
#         res = super()._get_default_payment_method_codes()
#         if self.code == "safepay":
#             return []
#         return res
# from odoo import models, fields


# class PaymentProvider(models.Model):
#     _inherit = "payment.provider"

#     code = fields.Selection(
#         selection_add=[("safepay", "SafePay")],
#         ondelete={"safepay": "set default"},
#     )

#     def _get_default_payment_method_codes(self):
#         if self.code == "safepay":
#             return ["card"]   # 👈 use the existing Card payment method

#         return super()._get_default_payment_method_codes()

#     # SafePay credentials

#     safepay_client_id = fields.Char(
#         string="SafePay Client ID",
#         help="SafePay merchant/client identifier"
#     )

#     safepay_secret_key = fields.Char(
#         string="SafePay Secret Key",
#         help="SafePay API secret key",
#         groups="base.group_system"
#     )

#     safepay_api_url = fields.Char(
#         string="SafePay API URL",
#         default="https://sandbox.api.getsafepay.com"
#     )


# from odoo import models, fields


# class PaymentProvider(models.Model):
#     _inherit = "payment.provider"

#     code = fields.Selection(
#         selection_add=[("safepay", "SafePay")],
#         ondelete={"safepay": "set default"},
#     )

#     def _compute_feature_support_fields(self):
#         super()._compute_feature_support_fields()
#         self.filtered(lambda p: p.code == "safepay").update({
#             "support_express_checkout": False,
#             "support_manual_capture": False,
#             "support_refund": "none",
#             "support_tokenization": False,
#         })

#     def _get_default_payment_method_codes(self):
#         self.ensure_one()

#         if self.code != "safepay":
#             return super()._get_default_payment_method_codes()

#         return ["card"]

#     safepay_client_id = fields.Char(
#         string="SafePay Client ID"
#     )

#     safepay_secret_key = fields.Char(
#         string="SafePay Secret Key",
#         groups="base.group_system"
#     )

#     safepay_api_url = fields.Char(
#         string="SafePay API URL",
#         default="https://sandbox.api.getsafepay.com"
#     )


from odoo import models, fields


class PaymentProvider(models.Model):
    _inherit = "payment.provider"

    code = fields.Selection(
        selection_add=[("safepay", "SafePay")],
        ondelete={"safepay": "set default"},
    )

    def _compute_feature_support_fields(self):
        super()._compute_feature_support_fields()

        self.filtered(lambda p: p.code == "safepay").update({
            "support_express_checkout": False,
            "support_manual_capture": False,
            "support_refund": False,
            "support_tokenization": False,
        })

    # def _get_default_payment_method_codes(self):
    #     self.ensure_one()

    #     if self.code == "safepay":
    #         return ["card"]

    #     return super()._get_default_payment_method_codes()
    def _get_default_payment_method_codes(self):
     self.ensure_one()
     if self.code == "safepay":
        return ["card"]

     return super()._get_default_payment_method_codes()


    safepay_client_id = fields.Char(
        string="SafePay Client ID"
    )

    safepay_secret_key = fields.Char(
        string="SafePay Secret Key",
        groups="base.group_system"
    )

    safepay_api_url = fields.Char(
        string="SafePay API URL",
        default="https://sandbox.api.getsafepay.com"
    )