import React from "react";
import { Row, Col } from "antd";
import { motion } from "framer-motion";
import { withTranslation } from "react-i18next";

import { ContentBlockProps } from "./types";
import { Button } from "../../common/Button";
import { SvgIcon } from "../../common/SvgIcon";
import {
  ContentSection,
  Content,
  ContentWrapper,
  ServiceWrapper,
  MinTitle,
  MinPara,
  StyledRow,
  ButtonWrapper,
} from "./styles";

const ContentBlock = ({
  icon,
  title,
  content,
  section,
  button,
  t,
  id,
  direction,
}: ContentBlockProps) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id) as HTMLDivElement;
    element.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <ContentSection>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <StyledRow
          justify="space-between"
          align="middle"
          id={id}
          direction={direction}
        >
          <Col lg={11} md={11} sm={12} xs={24}>
            <motion.div
              initial={{ opacity: 0, x: direction === "right" ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SvgIcon src={icon} width="100%" height="100%" />
            </motion.div>
          </Col>
          <Col lg={11} md={11} sm={11} xs={24}>
            <motion.div
              initial={{ opacity: 0, x: direction === "right" ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ContentWrapper>
                <h6>{t(title)}</h6>
                <Content>{t(content)}</Content>
                {direction === "right" ? (
                  <ButtonWrapper>
                    {typeof button === "object" &&
                      button.map(
                        (
                          item: {
                            color?: string;
                            title: string;
                          },
                          id: number
                        ) => {
                          return (
                            <Button
                              key={id}
                              color={(item.color as "primary" | "secondary" | "ghost" | "danger" | "success") || "primary"}
                              onClick={() => scrollTo("about")}
                            >
                              {t(item.title)}
                            </Button>
                          );
                        }
                      )}
                  </ButtonWrapper>
                ) : (
                  <ServiceWrapper>
                    <Row justify="space-between">
                      {typeof section === "object" &&
                        section.map(
                          (
                            item: {
                              title: string;
                              content: string;
                              icon: string;
                            },
                            id: number
                          ) => {
                            return (
                              <Col key={id} span={11}>
                                <SvgIcon
                                  src={item.icon}
                                  width="60px"
                                  height="60px"
                                />
                                <MinTitle>{t(item.title)}</MinTitle>
                                <MinPara>{t(item.content)}</MinPara>
                              </Col>
                            );
                          }
                        )}
                    </Row>
                  </ServiceWrapper>
                )}
              </ContentWrapper>
            </motion.div>
          </Col>
        </StyledRow>
      </motion.div>
    </ContentSection>
  );
};

export default withTranslation()(ContentBlock);
