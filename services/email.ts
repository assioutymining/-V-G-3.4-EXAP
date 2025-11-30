
import emailjs from '@emailjs/browser';
import { Transaction } from '../types';

// NOTE: You must sign up at https://www.emailjs.com/ to get these keys.
// Replace these placeholders with your actual keys from EmailJS Dashboard.
const SERVICE_ID = 'service_pyramids_gold'; // Example: service_x9d8s7f
const TEMPLATE_ID = 'template_transaction'; // Example: template_8s7f6d5
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Example: user_9s8d7f6g5h4j

export const EmailService = {
  sendTransaction: async (transaction: Transaction) => {
    try {
      // Prepare the email parameters based on your template
      const templateParams = {
        to_email: 'pyramidsgold.eg@gmail.com',
        transaction_id: transaction.id,
        type: transaction.type,
        amount: transaction.totalAmount.toLocaleString(),
        date: transaction.date,
        customer: transaction.customerName || 'N/A',
        weight: transaction.weight || 0,
        karat: transaction.karat || 0,
        details: JSON.stringify(transaction.details || {}),
        source: 'Pyramids Gold System'
      };

      // Check if keys are configured (skip if placeholder)
      if (PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.log('EmailJS keys not configured. Simulating email send:', templateParams);
        return;
      }

      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('Email Sent Successfully:', response.status, response.text);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  },

  sendBackupAlert: async (status: string) => {
      // Optional: Send alert when backup happens
      if (PUBLIC_KEY === 'YOUR_PUBLIC_KEY') return;
      
      try {
          await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
              to_email: 'pyramidsgold.eg@gmail.com',
              message: `System Backup Status: ${status}`,
              date: new Date().toISOString()
          }, PUBLIC_KEY);
      } catch (e) {
          console.error(e);
      }
  }
};
