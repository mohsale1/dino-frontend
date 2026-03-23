import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import { ExpandMore, HelpOutline } from '@mui/icons-material';
// FAQs inline
const FAQS = [
  {
    question: 'How quickly can we get started with Dino?',
    answer: 'You can be up and running within 24 hours! Our team will help you set up your digital catalog, configure your menu/products, and train your staff. We provide complete onboarding support to ensure a smooth transition.'
  },
  {
    question: 'Do customers need to download an app to place orders?',
    answer: 'No! Customers simply scan a QR code and access your digital catalog through their web browser. No app download required, making it convenient for everyone.'
  },
  {
    question: 'What types of businesses can use Dino?',
    answer: 'Dino is perfect for restaurants, cafes, cloud kitchens, retail stores, salons, and any business that wants to digitize their catalog and streamline order management. Our platform is flexible and adapts to various business models.'
  },
  {
    question: 'Can we customize the design and branding?',
    answer: 'Absolutely! You can fully customize your digital catalog with your logo, brand colors, fonts, and layout. Make it truly yours and maintain consistent branding across all customer touchpoints.'
  },
  {
    question: 'How does the pricing work?',
    answer: 'We offer flexible pricing plans based on your business size and needs. Contact our sales team for a customized quote. We also provide a free trial so you can experience Dino before committing.'
  },
  {
    question: 'Is there support for multiple locations or outlets?',
    answer: 'Yes! Dino supports multi-location businesses. You can manage multiple outlets from a single dashboard, with centralized inventory, orders, and analytics while maintaining location-specific customizations.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We provide 24/7 customer support via phone, email, and chat. Our dedicated support team is always ready to help you with any questions or issues. We also offer comprehensive documentation and video tutorials.'
  },
  {
    question: 'Can we integrate Dino with our existing systems?',
    answer: 'Yes! Dino offers API integrations and can connect with popular POS systems, payment gateways, and accounting software. Our technical team will assist you with the integration process.'
  },
];

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
`;

const FAQSection: React.FC = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>('panel0');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 10, sm: 12, md: 16 },
        background: '#ffffff',
        scrollMarginTop: { xs: '100px', sm: '110px', md: '120px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#0f172a', 0.03)} 0%, transparent 70%)`,
          animation: `${float} 10s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#0f172a', 0.04)} 0%, transparent 70%)`,
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
        }}
      />

      {/* Question Mark Icons */}
      <HelpOutline
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          fontSize: { xs: 60, md: 80 },
          color: alpha('#0f172a', 0.04),
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <HelpOutline
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          fontSize: { xs: 50, md: 70 },
          color: alpha('#0f172a', 0.03),
          animation: `${pulse} 5s ease-in-out infinite`,
          animationDelay: '1s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 8, md: 10 },
            animation: `${fadeInUp} 0.8s ease-out`,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              fontWeight: 800,
              mb: 2.5,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                background: `linear-gradient(90deg, transparent, #0f172a, transparent)`,
                borderRadius: 2,
              },
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
              fontWeight: 400,
              px: { xs: 2, sm: 0 },
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
              mt: 3,
            }}
          >
            Everything you need to know about Dino
          </Typography>
        </Box>

        {/* FAQ Accordions */}
        <Box sx={{ px: { xs: 0, sm: 0 }, maxWidth: 900, mx: 'auto' }}>
          {FAQS.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              elevation={0}
              sx={{
                mb: 2.5,
                border: '1px solid',
                borderColor: expanded === `panel${index}` ? '#0f172a' : '#e2e8f0',
                borderRadius: '16px !important',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                animation: `${fadeInUp} 0.8s ease-out ${0.1 + index * 0.05}s both`,
                '&:before': {
                  display: 'none',
                },
                '&:hover': {
                  borderColor: '#cbd5e1',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  transform: 'translateY(-2px)',
                },
                ...(expanded === `panel${index}` && {
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  background: `linear-gradient(135deg, ${alpha('#0f172a', 0.02)} 0%, #ffffff 100%)`,
                }),
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: expanded === `panel${index}` ? '#0f172a' : alpha('#0f172a', 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ExpandMore
                      sx={{
                        color: expanded === `panel${index}` ? '#ffffff' : '#0f172a',
                        fontSize: { xs: 24, md: 26 },
                      }}
                    />
                  </Box>
                }
                sx={{
                  py: { xs: 2, md: 2.5 },
                  px: { xs: 2.5, md: 3.5 },
                  '& .MuiAccordionSummary-content': {
                    my: { xs: 1, md: 1.5 },
                  },
                  minHeight: { xs: 68, md: 76 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
                    color: expanded === `panel${index}` ? '#0f172a' : '#334155',
                    transition: 'color 0.3s ease',
                    lineHeight: 1.4,
                    pr: 2,
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: { xs: 2.5, md: 3.5 },
                  pb: { xs: 3, md: 3.5 },
                  pt: 0,
                }}
              >
                <Box
                  sx={{
                    pl: { xs: 0, md: 1 },
                    borderLeft: { xs: 'none', md: `3px solid ${alpha('#0f172a', 0.1)}` },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      pl: { xs: 0, md: 2 },
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Still Have Questions CTA */}
        <Box
          sx={{
            mt: { xs: 8, md: 10 },
            textAlign: 'center',
            animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#0f172a', 0.04)} 0%, ${alpha('#0f172a', 0.02)} 100%)`,
              border: `1px solid ${alpha('#0f172a', 0.1)}`,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                mb: 1,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Still have questions?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.9375rem', md: '1rem' },
              }}
            >
              Contact our support team for personalized assistance
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FAQSection;