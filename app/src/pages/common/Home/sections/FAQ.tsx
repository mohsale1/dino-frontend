import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  alpha,
  keyframes,
} from '@mui/material';
import { ExpandMore, HelpOutline, ChatBubbleOutline } from '@mui/icons-material';

const FAQS = [
  {
    question: 'How quickly can we get started with Dino?',
    answer:
      'You can be up and running within 24 hours. Our team will help you set up your digital catalog, configure your menu and products, and train your staff. We provide complete onboarding support to ensure a smooth transition.',
  },
  {
    question: 'Do customers need to download an app to place orders?',
    answer:
      'No. Customers simply scan a QR code and access your digital catalog through their web browser. No app download required, making it convenient for everyone.',
  },
  {
    question: 'What types of businesses can use Dino?',
    answer:
      'Dino is perfect for restaurants, cafes, cloud kitchens, retail stores, salons, and any business that wants to digitize their catalog and streamline order management. Our platform is flexible and adapts to various business models.',
  },
  {
    question: 'How does the pricing work?',
    answer:
      'We offer flexible pricing plans based on your business size and needs. Contact our sales team for a customized quote. We also provide a free trial so you can experience Dino before committing.',
  },
  {
    question: 'Is there support for multiple locations or outlets?',
    answer:
      'Yes. Dino supports multi-location businesses. You can manage multiple outlets from a single dashboard, with centralized inventory, orders, and analytics while maintaining location-specific customizations.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'We provide 24/7 customer support via phone, email, and chat. Our dedicated support team is always ready to help you with any questions or issues. We also offer comprehensive documentation and video tutorials.',
  },
];

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0);     }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg);  }
  50%       { transform: translateY(-10px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1);    opacity: 0.3; }
  50%       { transform: scale(1.1); opacity: 0.5; }
`;

const FAQSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('panel0');

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        background: `linear-gradient(160deg, #f8fafc 0%, #eef2ff 40%, #f0fdf4 70%, #f8fafc 100%)`,
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: { xs: '64px', md: '70px' },
      }}
    >
      {/* ── Top border accent — matches Testimonials ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background:
            'linear-gradient(90deg, transparent, #1976D2 30%, #42A5F5 70%, transparent)',
          opacity: 0.35,
        }}
      />

      {/* ── Decorative floating icons ── */}
      <HelpOutline
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          fontSize: { xs: 80, md: 120 },
          color: alpha('#1976D2', 0.05),
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <HelpOutline
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          fontSize: { xs: 100, md: 150 },
          color: alpha('#42A5F5', 0.04),
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '2s',
          transform: 'rotate(180deg)',
        }}
      />

      {/* ── Dashed rings ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: `2px dashed ${alpha('#1976D2', 0.08)}`,
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          border: `2px dashed ${alpha('#42A5F5', 0.07)}`,
          animation: `${pulse} 5s ease-in-out infinite`,
          animationDelay: '1s',
        }}
      />

      {/* ── Radial glow blobs ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#1976D2', 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#42A5F5', 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          px: { xs: 2, sm: 3, md: 3 },
          pb: { xs: 3, sm: 0, md: 0 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Section header ── */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
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
              px: { xs: 1, sm: 0 },
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
                background: `linear-gradient(90deg, transparent, #1976D2, transparent)`,
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
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
              fontWeight: 400,
              lineHeight: 1.7,
              px: { xs: 2, sm: 0 },
              mt: 3,
            }}
          >
            Everything you need to know about Dino
          </Typography>
        </Box>

        {/* ── Accordion list ── */}
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {FAQS.map((faq, index) => {
            const isExpanded = expanded === `panel${index}`;
            return (
              <Accordion
                key={index}
                expanded={isExpanded}
                onChange={handleChange(`panel${index}`)}
                elevation={0}
                sx={{
                  mb: 2,
                  border: '1px solid',
                  borderColor: isExpanded
                    ? alpha('#1976D2', 0.4)
                    : alpha('#1976D2', 0.1),
                  borderRadius: '16px !important',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#ffffff',
                  animation: `${fadeInUp} 0.8s ease-out ${0.1 + index * 0.05}s both`,
                  '&:before': { display: 'none' },
                  '&:hover': {
                    borderColor: isExpanded
                      ? alpha('#1976D2', 0.5)
                      : alpha('#1976D2', 0.25),
                    boxShadow: `0 8px 24px ${alpha('#1976D2', 0.08)}`,
                    transform: 'translateY(-2px)',
                  },
                  ...(isExpanded && {
                    boxShadow: `0 12px 32px ${alpha('#1976D2', 0.1)}`,
                    background: `linear-gradient(135deg, ${alpha('#1976D2', 0.02)} 0%, #ffffff 100%)`,
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
                        backgroundColor: isExpanded
                          ? '#1976D2'
                          : alpha('#1976D2', 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      <ExpandMore
                        sx={{
                          color: isExpanded ? '#ffffff' : '#1976D2',
                          fontSize: { xs: 20, md: 22 },
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
                      color: isExpanded ? '#1976D2' : '#334155',
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
                      pl: { xs: 1.5, md: 2 },
                      borderLeft: `3px solid #1976D2`,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.8,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        pl: { xs: 1, md: 1.5 },
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        {/* ── Still have questions CTA ── */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            textAlign: 'center',
            animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2.5,
              px: { xs: 4, sm: 6, md: 8 },
              py: { xs: 4, md: 5 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#1976D2', 0.07)} 0%, ${alpha('#42A5F5', 0.05)} 100%)`,
              border: `1px solid ${alpha('#1976D2', 0.15)}`,
              backdropFilter: 'blur(8px)',
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '100%', sm: 560 },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: alpha('#1976D2', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha('#1976D2', 0.2)}`,
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: 24, color: '#1976D2' }} />
            </Box>

            {/* Text */}
            <Box sx={{ textAlign: 'center' }}>
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
                  lineHeight: 1.6,
                }}
              >
                Our support team is ready to help you with personalized assistance
              </Typography>
            </Box>

            {/* CTA button */}
            <Button
              variant="contained"
              href="mailto:support@dinomenu.com"
              sx={{
                px: { xs: 4, sm: 5 },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                backgroundColor: '#1976D2',
                color: '#ffffff',
                boxShadow: `0 4px 14px ${alpha('#1976D2', 0.3)}`,
                '&:hover': {
                  backgroundColor: '#1565C0',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha('#1976D2', 0.4)}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Contact Support
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FAQSection;