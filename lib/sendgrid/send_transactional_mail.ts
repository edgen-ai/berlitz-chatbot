const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
    from: 'mail@edgen.ai',
    templateId,
    dynamicTemplateData: {
      name: data.name
    }
  }
  sgMail.send(msg)
}
export default send_transactional_mail
