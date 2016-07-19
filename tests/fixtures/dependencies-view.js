module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      container: 'main'
    }
  ],
  containers: [
    {
      id: 'main',
      children: [
        [
          {
            model: 'name'
          }
        ],
        [
          {
            model: 'email'
          }
        ],
        [
          {
            model: 'paymentInfo',
            container: 'paymentInfo'
          }
        ]
      ]
    },
    {
      id: 'paymentInfo',
      children: [
        [
          {
            model: 'useEft'
          }
        ],
        [
          {
            model: 'useCreditCard'
          }
        ],
        [
          {
            model: 'usePayPal'
          }
        ],
        [
          {
            model: 'routingNumber',
            dependsOn: 'useEft'
          }
        ],
        [
          {
            model: 'accountNumber',
            dependsOn: 'useEft'
          }
        ],
        [
          {
            model: 'creditCardNumber',
            dependsOn: 'useCreditCard'
          }
        ],
        [
          {
            model: 'ccv',
            dependsOn: 'useCreditCard'
          }
        ],
        [
          {
            model: 'payPalUsername',
            dependsOn: 'usePayPal'
          }
        ],
        [
          {
            model: 'payPalPassword',
            dependsOn: 'usePayPal'
          }
        ]
      ]
    }
  ]
}
