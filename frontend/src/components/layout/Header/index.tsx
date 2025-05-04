import { useState } from "react";
import { Row, Col, Drawer } from "antd";
import { withTranslation, TFunction } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "../../common/Container";
import { Button } from "../../common/Button";
import AuthButton from "../../auth/AuthButton";
import {
  HeaderSection,
  LogoContainer,
  Burger,
  NotHidden,
  Menu,
  CustomNavLinkSmall,
  Label,
  Outline,
  Span,
  LogoIcon,
  LogoWrapper
} from "./styles";

const Header = ({ t }: { t: TFunction }) => {
  const [visible, setVisibility] = useState(false);
  const navigate = useNavigate();

  const toggleButton = () => {
    setVisibility(!visible);
  };

  const MenuItem = () => {
    const scrollTo = (id: string) => {
      // For elements, try to scroll to them if they exist
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
        });
      }
      setVisibility(false);
    };

    return (
      <>
        <CustomNavLinkSmall style={{ width: "180px" }}>
          <Span>
            <AuthButton />
          </Span>
        </CustomNavLinkSmall>
        <CustomNavLinkSmall
          style={{ width: "180px" }}
          onClick={() => scrollTo("contact")}
        >
          <Span>
            <Button>{t("Contact")}</Button>
          </Span>
        </CustomNavLinkSmall>
      </>
    );
  };

  return (
    <HeaderSection>
      <Container>
        <Row justify="space-between" align="middle">
          <LogoContainer to="/" aria-label="homepage">
            <LogoWrapper>
              <LogoIcon>
                <img src="/favicon.ico" alt="CareerSense Logo" width="38" height="38" />
              </LogoIcon>
              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: 700,
                  fontFamily: "'Poppins', 'Segoe UI', sans-serif",
                  color: "#1a1a3d",
                  margin: 0,
                  marginLeft: "12px",
                  letterSpacing: "1px",
                  transition: "all 0.3s ease-in-out",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF6B00";
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.textShadow =
                    "0px 4px 12px rgba(255, 107, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1a1a3d";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.textShadow = "none";
                }}
              >
                CareerSense
              </h1>
            </LogoWrapper>
          </LogoContainer>
          <NotHidden>
            <MenuItem />
          </NotHidden>
          <Burger onClick={toggleButton}>
            <Outline />
          </Burger>
        </Row>
        <Drawer closable={false} open={visible} onClose={toggleButton}>
          <Col style={{ marginBottom: "2.5rem" }}>
            <Label onClick={toggleButton}>
              <Col span={12}>
                <Menu>Menu</Menu>
              </Col>
              <Col span={12}>
                <Outline />
              </Col>
            </Label>
          </Col>
          <MenuItem />
        </Drawer>
      </Container>
    </HeaderSection>
  );
};

export default withTranslation()(Header);