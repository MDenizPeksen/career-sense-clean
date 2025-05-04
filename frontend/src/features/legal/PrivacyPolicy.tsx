import React, { useEffect } from "react";
import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import SubNav from "../../components/layout/SubNav";
import { useLocation } from "react-router-dom";

const PrivacyPolicy = ({ t }: { t: any }) => {
  const location = useLocation();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="page-container">
      <SubNav currentPath={location.pathname} />
      <div className="page-content">
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="space-y-6 privacy-policy">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                
                <p className="text-gray-700">
                  <strong>Effective Date:</strong> May 5, 2025
                </p>

                <p className="text-gray-700">
                  CareerSense ("we", "us", "our") respects your privacy and is committed to protecting your personal data. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">1. Who We Are</h2>
                  <p className="text-gray-700">
                    The data controller for the processing of your personal data is:
                  </p>
                  <p className="text-gray-700">
                    <strong>CareerSense UG (haftungsbeschränkt)</strong><br />
                    Leopoldstraße 37<br />
                    80802 Munich, Germany<br />
                    Email: privacy@careersense.ai
                  </p>
                  <p className="text-gray-700">
                    For data protection inquiries, please contact our Data Protection Officer at the email above.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">2. What Data We Collect</h2>
                  
                  <h3 className="text-xl font-semibold mb-2">A. Data You Provide</h3>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Name, email, and contact details</li>
                    <li>Uploaded CVs and career inputs</li>
                    <li>Registration/account details</li>
                    <li>Surveys, messages, testimonials</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">B. Automatically Collected Data</h3>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>IP address, browser type, OS, device data</li>
                    <li>Clickstream data, session duration</li>
                    <li>Cookies and tracking technologies</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">C. Data from Third Parties</h3>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Basic data from social login providers (e.g., Google, LinkedIn)</li>
                  </ul>

                  <p className="text-gray-700 mt-4">
                    We do not knowingly collect data from individuals under 16.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">3. Legal Basis for Processing</h2>
                  <p className="text-gray-700">
                    Processing is based on:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li><strong>Contractual necessity</strong> (Art. 6(1)(b) GDPR)</li>
                    <li><strong>Consent</strong> (Art. 6(1)(a) GDPR)</li>
                    <li><strong>Legal obligations</strong> (Art. 6(1)(c) GDPR)</li>
                    <li><strong>Legitimate interests</strong> (Art. 6(1)(f) GDPR)</li>
                  </ul>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">4. Purpose of Processing</h2>
                  <p className="text-gray-700">
                    We use your data to:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Provide CV analysis and feedback</li>
                    <li>Send results and notifications</li>
                    <li>Analyze and improve platform functionality</li>
                    <li>Respond to support requests</li>
                    <li>Secure the platform</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    We do not sell your personal data.
                  </p>

                  <h3 className="text-xl font-semibold mt-6 mb-3">Automated Decision-Making & AI Processing</h3>
                  <p className="text-gray-700">
                    Some services offered by CareerSense involve the use of <strong>artificial intelligence (AI)</strong> models to generate personalized content such as:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Strengths & Weaknesses summary</li>
                    <li>Role recommendations</li>
                    <li>STAR-format interview stories</li>
                    <li>Resume optimization tips</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    These insights are <strong>generated automatically</strong> based on the content of your uploaded CV and responses you provide.
                  </p>
                  <p className="text-gray-700 mt-4">
                    However:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li><strong>No legally significant decisions</strong> (e.g., job rejections, hiring) are made based on these outputs.</li>
                    <li>You are always free to <strong>review, ignore, edit, or not act upon</strong> any AI-generated content.</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    We do <strong>not use automated processing to make decisions with legal or similarly significant effects</strong> on you as defined under <strong>Article 22 of the GDPR</strong>.
                  </p>
                  <p className="text-gray-700 mt-4">
                    If you have questions about how AI decisions are made, you may contact us to request an explanation.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. Data Sharing</h2>
                  <p className="text-gray-700">
                    We may share data with:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Hosting and AI service providers (e.g., OpenAI, Vercel)</li>
                    <li>Analytics tools (e.g., Google Analytics)</li>
                    <li>Payment providers (if applicable)</li>
                    <li>Legal/regulatory authorities</li>
                  </ul>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">6. International Data Transfers</h2>
                  <p className="text-gray-700">
                    We transfer data to third countries with:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Adequacy decisions, or</li>
                    <li>Standard Contractual Clauses and safeguards</li>
                  </ul>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>CV data: 1 year</li>
                    <li>Account data: Until deleted + 30 days</li>
                    <li>Legal records: 10 years (per German tax law)</li>
                  </ul>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">8. Cookies</h2>
                  <p className="text-gray-700">
                    We use cookies for:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Session management</li>
                    <li>Analytics and personalization</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    You can manage cookies via your browser or our cookie banner.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Your GDPR Rights</h2>
                  <p className="text-gray-700">
                    You have the right to:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Access, correct, delete, or restrict processing</li>
                    <li>Object to certain uses</li>
                    <li>Withdraw consent at any time</li>
                    <li>Request data portability</li>
                    <li>Lodge a complaint with:</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    <strong>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong><br />
                    <a href="https://www.lda.bayern.de" className="text-blue-600">https://www.lda.bayern.de</a>
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
                  <p className="text-gray-700">
                    CareerSense is not intended for users under 16.<br />
                    We delete any such data upon discovery.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">11. Data Security</h2>
                  <p className="text-gray-700">
                    We use:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>HTTPS/SSL encryption</li>
                    <li>Access controls</li>
                    <li>Firewalls and rate limiting</li>
                    <li>Pseudonymization when applicable</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Despite safeguards, no system is 100% secure.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">12. Changes</h2>
                  <p className="text-gray-700">
                    We may update this policy.<br />
                    Users will be notified and "Last Updated" will be revised.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">13. Contact</h2>
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@careersense.ai<br />
                    <strong>Postal Address:</strong> CareerSense UG, Leopoldstraße 37, 80802 Munich, Germany
                  </p>
                </section>

                <hr className="my-6" />

                <p className="text-gray-700 text-center">
                  &copy; Copyright CareerSense UG. All rights reserved.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default withTranslation()(PrivacyPolicy);
