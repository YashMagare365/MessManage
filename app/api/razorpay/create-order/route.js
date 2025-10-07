import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json()

    console.log('Creating Razorpay order with:', { amount, currency, receipt })

    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay environment variables not set')
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      )
    }

    // Import Razorpay dynamically to avoid server-side issues
    const Razorpay = (await import('razorpay')).default

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    }

    console.log('Razorpay options:', options)

    const order = await razorpay.orders.create(options)

    console.log('Razorpay order created:', order.id)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    })

  } catch (error) {
    console.error('Razorpay order creation error:', error)
    
    // More specific error messages
    let errorMessage = 'Failed to create payment order'
    
    if (error.error?.description) {
      errorMessage = error.error.description
    } else if (error.message?.includes('key_id')) {
      errorMessage = 'Invalid Razorpay API key configuration'
    } else if (error.message?.includes('Network')) {
      errorMessage = 'Network error. Please check your internet connection'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}