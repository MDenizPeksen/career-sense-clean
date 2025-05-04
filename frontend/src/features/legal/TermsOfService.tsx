import React, { useEffect } from "react";
import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import SubNav from "../../components/layout/SubNav";
import { useLocation } from "react-router-dom";

const TermsOfService = ({ t }: { t: any }) => {
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
              <div className="space-y-6 terms-of-service">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                
                <p className="text-gray-700">
                  <strong>Effective Date:</strong> May 5, 2025
                </p>

                <p className="text-gray-700">
                  Welcome to CareerSense! By using our website and services, you agree to the following terms and conditions. Please read them carefully.
                </p>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                  <p className="text-gray-700">
                    By accessing or using https://www.careersense.ai ("the Site"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any of these terms, you must not use the Site.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">2. Eligibility</h2>
                  <p className="text-gray-700">
                    You must be at least 16 years old, or the age of majority in your jurisdiction, whichever is older, to use our Services.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">3. Account Registration</h2>
                  <p className="text-gray-700">
                    To access certain features, you may need to create an account through Clerk.dev or other third-party login providers. You agree to:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Provide accurate information</li>
                    <li>Keep your credentials secure</li>
                    <li>Not share your account</li>
                    <li>Notify us of any unauthorized access</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    CareerSense is not liable for loss or damage resulting from unauthorized use of your account.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">4. Description of Services</h2>
                  <p className="text-gray-700">
                    CareerSense offers AI-generated career insights based on user-uploaded CVs. Features may include:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>CV analysis</li>
                    <li>ATS readiness checks</li>
                    <li>STAR interview stories</li>
                    <li>Career learning paths</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    These services are for informational and educational purposes only and do not guarantee job acquisition.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. User Responsibilities</h2>
                  <p className="text-gray-700">
                    You agree to:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Use the service only for lawful and personal career-related purposes</li>
                    <li>Upload only your own CV or documents you are authorized to share</li>
                    <li>Not attempt to reverse engineer or misuse our platform</li>
                    <li>Not use automated systems to extract or reproduce data</li>
                  </ul>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
                  <p className="text-gray-700">
                    You retain ownership of content you upload. By uploading, you grant CareerSense a non-exclusive license to process and analyze your content as part of its services.
                  </p>
                  <p className="text-gray-700 mt-4">
                    All software, trademarks, and content on the Site are the property of CareerSense UG or its licensors.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">7. AI Disclaimer</h2>
                  <p className="text-gray-700">
                    CareerSense uses AI to generate outputs. These results:
                  </p>
                  <ul className="list-disc ml-6 text-gray-700">
                    <li>Are generated automatically and may contain inaccuracies</li>
                    <li>Should be reviewed and used at your discretion</li>
                    <li>Are not legally binding or definitive career advice</li>
                  </ul>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">8. Termination</h2>
                  <p className="text-gray-700">
                    CareerSense may suspend or terminate your access if you breach these terms or misuse the platform. You may delete your account at any time via your user dashboard.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Disclaimers</h2>
                  <p className="text-gray-700">
                    All services are provided "as is". We make no warranties, express or implied, including but not limited to merchantability or fitness for a particular purpose.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
                  <p className="text-gray-700">
                    To the extent permitted by law, CareerSense is not liable for any indirect, incidental, or consequential damages arising out of your use or inability to use the services.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
                  <p className="text-gray-700">
                    We may modify these Terms from time to time. We will provide notice via email or on the Site. Continued use of the Site after changes means you accept the updated Terms.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">12. Governing Law</h2>
                  <p className="text-gray-700">
                    These Terms are governed by the laws of Germany and the European Union. Disputes shall be resolved in the competent courts of Munich.
                  </p>
                </section>

                <hr className="my-6" />

                <section>
                  <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
                  <p className="text-gray-700">
                    If you have any questions, please contact:
                  </p>
                  <p className="text-gray-700 mt-2">
                    CareerSense UG (haftungsbeschränkt)<br />
                    Email: legal@careersense.ai<br />
                    Address: Leopoldstraße 37, 80802 Munich, Germany
                  </p>
                </section>

                <hr className="my-6" />

                <p className="text-gray-700 text-center">
                  2025 CareerSense UG. All rights reserved.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default withTranslation()(TermsOfService);
