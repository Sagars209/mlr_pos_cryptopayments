/* global StripeTerminal */
odoo.define('pos_cryptopayment.payment', function (require) {
"use strict";

const core = require('web.core');
const rpc = require('web.rpc');
const PaymentInterface = require('point_of_sale.PaymentInterface');
const { Gui } = require('point_of_sale.Gui');

const _t = core._t;

let PaymentCryptoPayment = PaymentInterface.extend({
    init: function (pos, payment_method) {
        this._super(...arguments);
    },

    send_payment_request: async function (cid) {
        let line = this.pos.get_order().selected_paymentline;
        await this._super.apply(this, arguments);
        let data = null;

        try {
	      data = await rpc.query({
              model: 'pos.payment.method',
              method: 'create_crypto_invoice',
              args: [{pm_id: line.payment_method.id, amount: line.amount}],
            }, {
                silent: true,
            });
        }
        catch (error) {
           return false
        }
        if(data.code != '0')
            return false;
        const codeWriter = new window.ZXing.BrowserQRCodeSvgWriter();
        let qr_code_svg = new XMLSerializer().serializeToString(codeWriter.write('lightning:'+data.invoice, 150, 150));

        line.cryptopay_payment_link = data.invoice;
        line.cryptopay_payment_link_qr_code = "data:image/svg+xml;base64,"+ window.btoa(qr_code_svg);
        line.cryptopay_invoice_id = data.invoice_id;
        line.invoiced_sat_amount = data.crypto_amt * 100000000;
        line.conversion_rate = data.conversion_rate;
        line.set_payment_status('cryptowaiting');

        return this._check_payment_status(line);
    },

    send_payment_cancel: async function (order, cid) {
        this._super.apply(this, arguments);
    },

    _check_payment_status: async function (line) {
        let api_resp = null;

try {
        for (let i = 0; i < 100; i++) {
            line.crypto_payment_status = 'Checking Invoice status '+(i+1)+'/100';
            try {
                api_resp = await rpc.query({
                    model: 'pos.payment.method',
                    method: 'check_payment_status',
                    args: [{ invoice_id: line.cryptopay_invoice_id, pm_id: line.payment_method.id }],
                }, {
                    silent: true,
                });

                if (api_resp.payment_status == 'waiting') {
                    line.crypto_payment_status = 'Invoice Paid';
                    return true;
                }

            } catch (error) {
                 console.log(error);
                 return false;
             }

	   await new Promise(r => setTimeout(r, 3000));
        }
}
catch (error) {
  console.error("An error occurred:", error.message);
} finally {
  console.log("Oops! aborted  ");
}
       return false;
    },
});

return PaymentCryptoPayment;
});
