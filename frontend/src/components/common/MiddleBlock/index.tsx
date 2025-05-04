import React from "react";
import { Row, Col } from "antd";
import { motion } from "framer-motion";
import { withTranslation, TFunction } from "react-i18next";
import { Link } from "react-router-dom";
import { MiddleBlockSection, Content, ContentWrapper } from "./styles";
import { Button } from "../../common/Button";
import { Star, Zap, Award, TrendingUp } from "react-feather";

interface MiddleBlockProps {
  title: string;
  content: string;
  button: string;
  t: TFunction;
  id: string;
  direction: string;
}

const MiddleBlock = ({ title, content, button, t, id, direction }: MiddleBlockProps) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id) as HTMLDivElement;
    element.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Floating icons animation variants
  const floatingIconVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    }
  };

  // Rotating icons animation variants
  const rotatingIconVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Pulse animation variants
  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <MiddleBlockSection id={id}>
      {/* Decorative floating elements */}
      <motion.div 
        className="absolute top-20 left-20 text-indigo-500 opacity-20"
        variants={floatingIconVariants}
        animate="animate"
      >
        <Star size={40} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-32 right-32 text-purple-500 opacity-20"
        variants={floatingIconVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      >
        <Award size={50} />
      </motion.div>
      
      <motion.div 
        className="absolute top-40 right-40 text-blue-500 opacity-20"
        variants={floatingIconVariants}
        animate="animate"
        style={{ animationDelay: "1.5s" }}
      >
        <Zap size={35} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-40 left-40 text-green-500 opacity-20"
        variants={floatingIconVariants}
        animate="animate"
        style={{ animationDelay: "0.5s" }}
      >
        <TrendingUp size={45} />
      </motion.div>
      
      {/* Circular rotating background element */}
      <motion.div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-2 border-dashed border-indigo-100 opacity-20"
          variants={rotatingIconVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 border-dashed border-purple-100 opacity-20"
          variants={rotatingIconVariants}
          animate="animate"
          style={{ animationDelay: "2s", animationDirection: "reverse" }}
        />
      </motion.div>
      
      {/* Subtle background glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
        variants={pulseVariants}
        animate="animate"
        style={{ zIndex: -1 }}
      />

      <Row justify="center" align="middle" style={{ position: "relative", zIndex: 1 }}>
        <ContentWrapper>
          <Col lg={24} md={24} sm={24} xs={24}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h6 className="relative inline-block">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ display: "inline-block" }}
                >
                  {t(title)}
                </motion.span>
                <motion.span 
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </h6>
              <Content>{t(content)}</Content>
              {button && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/cv-upload">
                    <Button
                      color="gradient"
                    >
                      Upload Your CV
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </Col>
        </ContentWrapper>
      </Row>
    </MiddleBlockSection>
  );
};

export default withTranslation()(MiddleBlock);
