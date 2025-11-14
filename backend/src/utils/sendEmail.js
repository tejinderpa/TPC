import nodemailer from 'nodemailer';
import { ApiError } from './ApiError.js';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Send email utility function
export const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'TPC'} <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new ApiError(500, 'Failed to send email');
    }
};

// Send job application confirmation email
export const sendJobApplicationEmail = async (studentEmail, studentName, jobTitle, companyName) => {
    const subject = `Application Confirmation - ${jobTitle} at ${companyName}`;
    const message = `Dear ${studentName},\n\nYour application for ${jobTitle} at ${companyName} has been successfully submitted.\n\nWe will notify you about the next steps.\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #2563eb;">Application Confirmation</h2>
                <p>Dear ${studentName},</p>
                <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
                <p>We will notify you about the next steps.</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email: studentEmail,
        subject,
        message,
        html,
    });
};

// Send drive notification email
export const sendDriveNotificationEmail = async (studentEmail, studentName, driveName, driveDate, companyName) => {
    const subject = `Campus Drive Notification - ${companyName}`;
    const message = `Dear ${studentName},\n\n${companyName} is conducting a campus drive: ${driveName}\nDate: ${driveDate}\n\nPlease check the TPC portal for more details.\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #16a34a;">Campus Drive Notification</h2>
                <p>Dear ${studentName},</p>
                <p><strong>${companyName}</strong> is conducting a campus drive:</p>
                <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Drive Name:</strong> ${driveName}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(driveDate).toLocaleDateString()}</p>
                </div>
                <p>Please check the TPC portal for more details and registration.</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email: studentEmail,
        subject,
        message,
        html,
    });
};

// Send application status update email
export const sendApplicationStatusEmail = async (studentEmail, studentName, jobTitle, companyName, status) => {
    const subject = `Application Status Update - ${jobTitle}`;
    const message = `Dear ${studentName},\n\nYour application for ${jobTitle} at ${companyName} has been updated to: ${status}\n\nPlease check the TPC portal for more details.\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #2563eb;">Application Status Update</h2>
                <p>Dear ${studentName},</p>
                <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
                <div style="background-color: ${status === 'Selected' ? '#f0fdf4' : status === 'Rejected' ? '#fef2f2' : '#fef3c7'}; 
                    padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 18px;"><strong>Status: ${status}</strong></p>
                </div>
                <p>Please check the TPC portal for more details.</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email: studentEmail,
        subject,
        message,
        html,
    });
};

// Send interview schedule email
export const sendInterviewScheduleEmail = async (studentEmail, studentName, jobTitle, companyName, interviewDate, interviewMode, venue) => {
    const subject = `Interview Scheduled - ${jobTitle} at ${companyName}`;
    const message = `Dear ${studentName},\n\nYour interview for ${jobTitle} at ${companyName} has been scheduled.\n\nDate: ${interviewDate}\nMode: ${interviewMode}\nVenue: ${venue || 'TBD'}\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #16a34a;">Interview Scheduled</h2>
                <p>Dear ${studentName},</p>
                <p>Your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been scheduled.</p>
                <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(interviewDate).toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>Mode:</strong> ${interviewMode}</p>
                    ${venue ? `<p style="margin: 5px 0;"><strong>Venue:</strong> ${venue}</p>` : ''}
                </div>
                <p>Please be on time and prepared. Good luck!</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email: studentEmail,
        subject,
        message,
        html,
    });
};

// Send event registration email
export const sendEventRegistrationEmail = async (studentEmail, studentName, eventName, eventDate) => {
    const subject = `Event Registration Confirmed - ${eventName}`;
    const message = `Dear ${studentName},\n\nYou have successfully registered for ${eventName} on ${eventDate}.\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #7c3aed;">Event Registration Confirmed</h2>
                <p>Dear ${studentName},</p>
                <p>You have successfully registered for <strong>${eventName}</strong>.</p>
                <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
                </div>
                <p>We look forward to seeing you there!</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email: studentEmail,
        subject,
        message,
        html,
    });
};

// Send mentorship request email
export const sendMentorshipRequestEmail = async (alumniEmail, alumniName, studentName, studentBranch) => {
    const subject = `New Mentorship Request from ${studentName}`;
    const message = `Dear ${alumniName},\n\n${studentName} (${studentBranch}) has requested mentorship from you.\n\nPlease check the TPC portal to respond.\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #ea580c;">New Mentorship Request</h2>
                <p>Dear ${alumniName},</p>
                <p><strong>${studentName}</strong> from ${studentBranch} has requested mentorship from you.</p>
                <p>Please check the TPC portal to view details and respond to the request.</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email: alumniEmail,
        subject,
        message,
        html,
    });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const message = `Dear ${name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTPC Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #dc2626;">Password Reset Request</h2>
                <p>Dear ${name},</p>
                <p>You requested a password reset. Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #dc2626;">This link will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br><strong>TPC Team</strong></p>
            </div>
        </div>
    `;

    await sendEmail({
        email,
        subject,
        message,
        html,
    });
};

export default sendEmail;
