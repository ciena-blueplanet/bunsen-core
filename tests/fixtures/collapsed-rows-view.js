module.exports = {
  type: 'form',
  version: '2.0',
  cellDefinitions: {
    'uncollapsed-rows': {
      children: [
        {
          children: [
            {
              model: 'item-1-1'
            },
            {
              model: 'item-1-2'
            },
            {
              model: 'item-1-3'
            }
          ]
        },
        {
          children: [
            {
              model: 'item-2-2'
            }
          ]
        },
        {
          children: [
            {
              model: 'item-3-1'
            },
            {
              model: 'item-3-2'
            },
            {
              model: 'item-3-3'
            },
            {
              model: 'item-3-4'
            }
          ]
        }
      ]
    },
    'one-row-collapse': {
      children: [
        {
          model: 'item-1'
        }, {
          model: 'item-2'
        }, {
          model: 'item-3'
        }, {
          model: 'item-4'
        }
      ]
    },
    'multi-row-collapse': {
      children: [
        {
          model: 'item-1'
        }, {
          model: 'item-2'
        }, {
          model: 'item-3'
        }, {
          model: 'item-4'
        }
      ]
    }
  },
  cells: [
    {
      extends: 'uncollapsed-rows'
    },
    {
      extends: 'one-row-collapse'
    },
    {
      extends: 'multi-row-collapse'
    }
  ]
}
