import React from 'react';

const PageWrapper = ({ title, children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-24 pb-12">
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const About = () => (
  <PageWrapper title="About Us">
    <p className="mb-4">Welcome to SkyBook! We are a premium flight booking platform dedicated to providing you with the best travel experiences across the globe.</p>
    <p className="mb-4">Founded with the mission to simplify air travel, we connect you with hundreds of airlines and destinations at unbeatable prices.</p>
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">Our Vision</h3>
    <p>To be the world's most trusted and innovative travel companion.</p>
  </PageWrapper>
);

export const Careers = () => (
  <PageWrapper title="Careers">
    <p className="mb-4">Join the SkyBook team and help us build the future of travel!</p>
    <p className="mb-4">We are always looking for passionate engineers, designers, and customer success specialists.</p>
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">Open Positions</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li>Senior Frontend Developer (React)</li>
      <li>Backend Engineer (Node.js/Firebase)</li>
      <li>UX/UI Designer</li>
    </ul>
    <p className="mt-6">Send your resume to careers@skybook.com.</p>
  </PageWrapper>
);

export const ContactUs = () => (
  <PageWrapper title="Contact Us">
    <p className="mb-4">We're here to help 24/7. Reach out to us through any of the following channels:</p>
    <div className="space-y-4 mt-6">
      <div className="p-4 bg-gray-50 dark:bg-[hsl(var(--background))] rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white">Customer Support</h4>
        <p>support@skybook.com</p>
        <p>+1 (800) 123-4567</p>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-[hsl(var(--background))] rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white">Corporate Headquarters</h4>
        <p>123 SkyBook Avenue, Silicon Valley, CA 94000</p>
      </div>
    </div>
  </PageWrapper>
);

export const PrivacyPolicy = () => (
  <PageWrapper title="Privacy Policy">
    <p className="mb-4">Last updated: June 2026</p>
    <p className="mb-4">At SkyBook, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">Information We Collect</h3>
    <p className="mb-4">We collect information you provide directly to us, such as when you create an account, book a flight, or contact customer support.</p>
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">How We Use Your Information</h3>
    <p>We use the information to process your bookings, send itineraries, and improve our platform.</p>
  </PageWrapper>
);

export const Terms = () => (
  <PageWrapper title="Terms & Conditions">
    <p className="mb-4">Last updated: June 2026</p>
    <p className="mb-4">By accessing and using SkyBook, you agree to be bound by these Terms and Conditions.</p>
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">1. Booking Policies</h3>
    <p className="mb-4">All bookings are subject to the respective airline's fare rules and cancellation policies.</p>
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">2. User Accounts</h3>
    <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
  </PageWrapper>
);
