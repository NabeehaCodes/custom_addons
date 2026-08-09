from odoo import fields, models
from odoo.exceptions import UserError

from ..services.shipment_api import create_shipment


class StockPicking(models.Model):
    _inherit = "stock.picking"

    safepay_shipment_id = fields.Char(
        string="Shipment ID",
        copy=False,
        readonly=True,
    )

    safepay_tracking_number = fields.Char(
        string="Tracking Number",
        copy=False,
        readonly=True,
    )

    safepay_shipment_status = fields.Char(
        string="Shipment Status",
        copy=False,
        readonly=True,
    )

    def _create_external_shipment(self):
        self.ensure_one()

        # Only create shipments for outgoing deliveries
        if self.picking_type_code != "outgoing":
            return

        # This picking must belong to a sale order
        if not self.sale_id:
            print(
                "Shipment skipped:",
                self.name,
                "has no sale order.",
            )
            return

        # Prevent duplicate shipment creation
        if self.safepay_tracking_number:
            print(
                "Shipment already exists for:",
                self.name,
                self.safepay_tracking_number,
            )
            return

        config = self.env[
            "ir.config_parameter"
        ].sudo()

        api_url = config.get_param(
            "shipment.api.url"
        )

        api_key = config.get_param(
            "shipment.api.key"
        )

        if not api_url:
            raise UserError(
                "Shipment API URL is not configured."
            )

        if not api_key:
            raise UserError(
                "Shipment API key is not configured."
            )

        partner = self.partner_id

        if not partner:
            raise UserError(
                "No customer is assigned to this delivery."
            )

        # -------------------------------------------------
        # Customer information
        # -------------------------------------------------

        customer_name = (
            partner.name or "Guest Customer"
        ).strip()

        phone = (
            partner.phone
            or partner.mobile
            or ""
        ).strip()

        email = (
            partner.email or ""
        ).strip()

        street = (
            partner.street or ""
        ).strip()

        city = (
            partner.city or ""
        ).strip()

        zip_code = (
            partner.zip or ""
        ).strip()

        # -------------------------------------------------
        # Delivery method
        # -------------------------------------------------

        # Your Flask API currently accepts:
        #
        # courier
        # pickup
        #
        # For normal Odoo website deliveries we use courier.

        delivery_method = "courier"

        # -------------------------------------------------
        # Calculate shipment weight
        # -------------------------------------------------

        weight = self.weight or 0.0

        if weight <= 0:
            weight = 0.1

        # -------------------------------------------------
        # Create shipment
        # -------------------------------------------------

        print("=================================")
        print(
            "CREATING EXTERNAL SHIPMENT FOR:",
            self.name,
        )
        print(
            "Sale Order:",
            self.sale_id.name,
        )
        print(
            "Customer:",
            customer_name,
        )
        print(
            "=================================")

        result = create_shipment(
            api_url=api_url,
            api_key=api_key,
            order_id=self.sale_id.id,
            customer_name=customer_name,
            phone=phone,
            email=email,
            street=street,
            city=city,
            zip_code=zip_code,
            delivery_method=delivery_method,
            weight=weight,
        )

        if not result.get("success"):
            message = result.get("message", "")

            # Shipment already exists in external system.
            # Reuse the existing tracking number instead of failing.
            if message == "Shipment already exists for this order":
                tracking_number = result.get("tracking_number")

                if tracking_number:
                    self.write({
                        "safepay_tracking_number": tracking_number,
                        "safepay_shipment_status": "Created",
                    })

                    print(
                        "Shipment already exists. "
                        "Using existing tracking number:",
                        tracking_number,
                    )

                    return

            raise UserError(
                message or "Shipment creation failed."
            )

        tracking_number = result.get(
            "tracking_number"
        )

        shipment_id = result.get(
            "shipment_id"
        )

        status = result.get(
            "status",
            "Created",
        )

        if not tracking_number:
            raise UserError(
                "Shipment API did not return "
                "a tracking number."
            )

        # -------------------------------------------------
        # Save shipment information in Odoo
        # -------------------------------------------------

        self.write(
            {
                "safepay_shipment_id": (
                    str(shipment_id)
                    if shipment_id
                    else False
                ),
                "safepay_tracking_number": (
                    tracking_number
                ),
                "safepay_shipment_status": (
                    status
                ),
            }
        )

        print("=================================")
        print("SHIPMENT CREATED SUCCESSFULLY")
        print("Odoo Picking:", self.name)
        print("Shipment ID:", shipment_id)
        print("Tracking:", tracking_number)
        print("Status:", status)
        print("=================================")

    def action_confirm(self):
        result = super().action_confirm()

        for picking in self:
            try:
                picking._create_external_shipment()

            except Exception as error:
                print(
                    "Shipment creation error for",
                    picking.name,
                    ":",
                    error,
                )

                # Do not silently hide the error.
                raise

        return result