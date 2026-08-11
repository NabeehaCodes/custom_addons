# -*- coding: utf-8 -*-

{
    'name': 'POS SafePay',
    'version': '19.0.1.0.0',
    'category': 'Sales/Point of Sale',
    'summary': 'Integrate POS with SafePay payment gateway',

    'depends': [
        'point_of_sale',
        'payment_safepay',
    ],

    'installable': True,
    'application': False,
    'auto_install': False,

    'assets': {
        'point_of_sale._assets_pos': [
            'pos_safepay/static/src/**/*',
        ],
    },
}