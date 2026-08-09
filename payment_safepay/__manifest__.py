
{
    'name': 'SafePay Payment Gateway',
    'version': '19.0.1.0.0',
    'summary': 'SafePay Payment Provider for Odoo',

    'depends': [
        'payment',
        'website_sale',
        'point_of_sale',
        'website',
    ],

    'data': [
        'views/payment_form_templates.xml',
        'data/payment_provider_data.xml',
        'views/payment_provider_views.xml',
    ],

    'assets': {
        'web.assets_frontend': [
            'payment_safepay/static/src/**/*',
        ],
    },

    'installable': True,
    'application': False,
    'auto_install': False,
}

