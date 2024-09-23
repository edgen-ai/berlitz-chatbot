const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY)

interface TemplateData {
  name: string
}

const send_transactional_mail = async ({
  to,
  templateId,
  data
}: {
  to: string
  templateId: string
  data: TemplateData
}) => {
  const msg = {
    to,
    from: 'mails@edgen.ai',
    templateId,
    dynamicTemplateData: {
      name: data.name
    }
  }
  try {
    const response = await sgMail.send(msg)
    console.log('Email sent successfully:', response)
    return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error // Rethrow the error to be caught in the POST handler
  }
}
export default send_transactional_mail
