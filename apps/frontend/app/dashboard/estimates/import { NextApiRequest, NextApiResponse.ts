import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { sendEmailNotification } from '@/services/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid estimate ID' });
  }

  try {
    // Get the estimate
    const estimate = await prisma.estimate.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        lineItems: true,
      },
    });

    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    // Send email to client
    try {
      await sendEmailNotification({
        to: estimate.clientEmail,
        subject: `Estimate from ${estimate.businessName}`,
        template: 'estimate-notification',
        data: {
          estimate,
          viewUrl: `${process.env.NEXTAUTH_URL}/estimates/view/${estimate.id}`,
        },
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: 'Failed to send estimate email' });
    }

    // Update estimate status
    const updatedEstimate = await prisma.estimate.update({
      where: { id: estimate.id },
      data: { 
        status: 'sent',
        sentAt: new Date(),
      },
      include: {
        lineItems: true,
      },
    });

    return res.status(200).json(updatedEstimate);
  } catch (error) {
    console.error('Error sending estimate:', error);
    return res.status(500).json({ error: 'Failed to send estimate' });
  }
}