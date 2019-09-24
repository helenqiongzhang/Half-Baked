const router = require('express').Router()
const {Order, ProductOrder, Product} = require('../db/models')

const {authenticated, validateOwnership} = require('../auth/utils')
const stripe = require('../constants/stripe')

const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({error: stripeErr})
  } else {
    res.status(200).send({success: stripeRes})
  }
}

module.exports = router

// [TO-DO]: change this to /user/:userId
//          this route looks like /orders/:userId now
//          which might be confusing
router.get(
  '/:userId',
  authenticated(),
  validateOwnership({validateCurrentOwner: true}),
  async (req, res, next) => {
    try {
      const cart = await Order.findOne({
        where: {
          userId: req.params.userId,
          cartStatus: 'pending'
        },
        include: [
          {
            model: Product
          }
        ]
      })
      res.json((cart && cart.products) || [])
    } catch (error) {
      console.error(error)
    }
  }
)

//create a new order
router.post('/', authenticated(), async (req, res, next) => {
  try {
    const order = await Order.findOrCreate({
      where: {
        userId: req.user.id,
        cartStatus: 'pending'
      }
    })

    await order[0].addProduct(req.body.id, {
      through: {
        quantity: req.body.cartQuantity,
        totalProductPrice: req.body.cartQuantity * req.body.currentPrice
      }
    })

    let productInfo = {
      ...req.body,
      productOrder: {
        orderId: order[0].id
      }
    }
    res.json(productInfo)
  } catch (err) {
    next(err)
  }
})

router.put(
  '/',
  authenticated(),
  validateOwnership({validateCurrentOrder: true}),
  async (req, res, next) => {
    try {
      await ProductOrder.update(
        {
          quantity: req.body.cartQuantity
        },
        {
          where: {
            productId: req.body.id,
            orderId: req.body.orderId
          }
        }
      )

      res.sendStatus(201)
    } catch (error) {
      console.error(error)
    }
  }
)

// [TO-DO]: rename to `/:orderId/checkout`
// [TO-DO]: make this route an HTTP POST
router.put(
  '/:orderId/checkout',
  authenticated(),
  validateOwnership({validateCurrentOrder: true}),
  async (req, res, next) => {
    try {
      // [TO-DO]: check conditions:
      //          1. does current user own this order?
      //          2. has the order been purchased?
      const productOrders = await ProductOrder.findAll({
        where: {
          orderId: req.params.orderId
        }
      })

      productOrders.forEach(async product => {
        const item = await Product.findByPk(product.productId)
        await item.update({
          quantity: item.quantity - product.quantity
        })
      })

      await Order.update(
        {
          cartStatus: 'purchased',
          totalOrderPrice: productOrders.reduce((accum, item) => {
            return accum + item.totalProductPrice
          }, 0)
        },
        {
          where: {
            id: req.params.orderId
          }
        }
      )
      // stripe.charges.create(req.body, postStripeCharge(res));

      res.sendStatus(204)
    } catch (error) {
      console.error(error)
    }
  }
)

router.post(
  '/:orderId/stripeCheckout',
  authenticated(),
  validateOwnership({validateCurrentOrder: true}),
  (req, res, next) => {
    try {
      // [TO-DO]: check conditions:
      //          1. does current user own this order?
      //          2. has the order been purchased?

      stripe.charges.create(req.body, postStripeCharge(res))
      // res.sendStatus(204)
    } catch (error) {
      console.error(error)
    }
  }
)

router.delete(
  '/:orderId/:productId',
  authenticated(),
  validateOwnership({validateCurrentOrder: true}),
  async (req, res, next) => {
    try {
      // [TO-DO]: check conditions:
      //          1. does current user own order?
      //          2. is the order still pending? (i.e. is it still a cart)
      await ProductOrder.destroy({
        where: {
          productId: req.params.productId,
          orderId: req.params.orderId
        }
      })
      res.sendStatus(204)
    } catch (error) {
      console.error(error)
    }
  }
)
