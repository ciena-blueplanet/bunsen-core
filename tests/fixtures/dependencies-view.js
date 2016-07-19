module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      extends: 'main'
    }
  ],
  cellDefinitions: {
    main: {
      children: [
        {
          model: 'name'
        },
        {
          model: 'email'
        },
        {
          model: 'paymentInfo',
          extends: 'paymentInfo'
        }
      ]
    },
    paymentInfo: {
      children: [
        {
          model: 'useEft'
        },
        {
          model: 'useCreditCard'
        },
        {
          model: 'usePayPal'
        },
        {
          model: 'routingNumber',
          dependsOn: 'useEft'
        },
        {
          model: 'accountNumber',
          dependsOn: 'useEft'
        },
        {
          model: 'creditCardNumber',
          dependsOn: 'useCreditCard'
        },
        {
          model: 'ccv',
          dependsOn: 'useCreditCard'
        },
        {
          model: 'payPalUsername',
          dependsOn: 'usePayPal'
        },
        {
          model: 'payPalPassword',
          dependsOn: 'usePayPal'
        }
      ]
    }
  }
}
