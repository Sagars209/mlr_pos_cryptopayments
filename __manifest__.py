# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'POS Crypto Payments',
    'version': '1.0',
    'category': 'Sales/Point of Sale',
    'sequence': 6,
    'summary': 'Integrate your POS with Crypto on-chain and payments',
    'description': '',
    'depends': ['point_of_sale','account','pos_restaurant'],
    'installable': True,
    'assets': {
        'point_of_sale.assets': [
            'mlr_pos_cryptopayments/static/**/*',
            'mlr_pos_cryptopayments/static/**/**/*',
        ],
    },
    'license': 'LGPL-3',
}
