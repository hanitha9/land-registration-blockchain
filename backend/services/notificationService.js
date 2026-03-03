const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    // Email transporter setup
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // SMS service setup (mock)
    this.smsEnabled = process.env.SMS_ENABLED === 'true';
  }

  async sendEmail(to, subject, html) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email service not configured - skipping email notification');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSMS(phone, message) {
    try {
      if (!this.smsEnabled) {
        console.log('SMS service not enabled - skipping SMS notification');
        return { success: false, message: 'SMS service not enabled' };
      }

      // Mock SMS sending
      console.log(`SMS sent to ${phone}: ${message}`);
      return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async createNotification(userId, title, message, type = 'info', relatedEntity = null, entityId = null) {
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        relatedEntity,
        entityId
      });

      return { success: true, notification };
    } catch (error) {
      console.error('Create notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyUser(userId, title, message, type = 'info', options = {}) {
    try {
      // Create in-app notification
      const notification = await this.createNotification(
        userId,
        title,
        message,
        type,
        options.relatedEntity,
        options.entityId
      );

      // Send email if requested
      if (options.sendEmail && options.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${title}</h2>
            <p>${message}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated notification from Land Registry System
            </p>
          </div>
        `;
        
        await this.sendEmail(options.email, title, emailHtml);
      }

      // Send SMS if requested
      if (options.sendSMS && options.phone) {
        await this.sendSMS(options.phone, `${title}: ${message}`);
      }

      return { success: true, notification: notification.notification };
    } catch (error) {
      console.error('Notify user error:', error);
      return { success: false, error: error.message };
    }
  }

  async broadcastNotification(title, message, type = 'info', filters = {}) {
    try {
      // In a real implementation, this would send to multiple users
      console.log(`Broadcast notification: ${title} - ${message}`);
      return { success: true, message: 'Broadcast notification sent' };
    } catch (error) {
      console.error('Broadcast notification error:', error);
      return { success: false, error: error.message };
    }
  }
}

const notificationService = new NotificationService();

module.exports = { notificationService };