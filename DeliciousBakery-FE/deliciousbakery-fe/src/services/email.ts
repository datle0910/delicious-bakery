import emailjs from '@emailjs/browser'

const serviceId = import.meta.env.VITE_EMAIL_SERVICE_ID
const registerTemplate = import.meta.env.VITE_EMAIL_REGISTER_TEMPLATE_ID
const orderTemplate = import.meta.env.VITE_EMAIL_ORDER_TEMPLATE_ID
const publicKey = import.meta.env.VITE_EMAIL_PUBLIC_KEY

const canSend =
  serviceId && registerTemplate && orderTemplate && publicKey
    ? true
    : false

const send = async (templateId: string, payload: Record<string, unknown>) => {
  if (!canSend) return
  await emailjs.send(serviceId, templateId, payload, {
    publicKey,
  })
}

export const sendRegistrationEmail = (payload: {
  email: string
  fullName: string
}) =>
  send(registerTemplate, {
    to_email: payload.email,
    to_name: payload.fullName,
  })

export const sendOrderEmail = (payload: {
  email: string
  fullName: string
  orderCode: string
  totalAmount: string
}) =>
  send(orderTemplate, {
    to_email: payload.email,
    to_name: payload.fullName,
    order_code: payload.orderCode,
    order_total: payload.totalAmount,
  })

