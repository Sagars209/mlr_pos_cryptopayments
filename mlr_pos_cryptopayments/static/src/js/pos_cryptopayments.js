/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { Payment } from "@point_of_sale/app/store/models";

patch(Payment.prototype, {
    //exports as JSON for receipt printing
    export_for_printing() {
        let data = super.export_for_printing();
        data.cryptopay_payment_link_qr_code = this.cryptopay_payment_link_qr_code;
        data.conversion_rate = this.conversion_rate;
        data.invoiced_crypto_amount = this.invoiced_crypto_amount;
        return data;   
    }
});
