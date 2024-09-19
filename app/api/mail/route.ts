// POST handler
import create_response from '@/lib/api/create_response';
import { NextRequest } from 'next/server';
import send_transactional_mail from '@/lib/sendgrid/send_transactional_mail';

export async function POST(request: NextRequest) {
  const res = await request.json();

  try {
    const sentEmail = await send_transactional_mail({
      to: res.to,
      templateId: 'd-26a82c2886c54d5cb6c2d0c623b42255',
      data: {
        name: res.name, 
      },
    });

    return create_response({
      request,
      data: sentEmail,
      status: 200,
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return create_response({
      request,
      data: { error: 'Failed to send email' },
      status: 500,
    });
  }
}
