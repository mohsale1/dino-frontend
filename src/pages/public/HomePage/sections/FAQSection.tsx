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
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { FAQS } from '../../../../data/info';

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
        py: { xs: 8, sm: 10, md: 12 },
        pb: { xs: 10, sm: 12, md: 16 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.03)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              letterSpacing: 1.5,
              mb: 2,
              display: 'block',
            }}
          >
            FAQ
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
              fontWeight: 800,
              mb: 2.5,
              letterSpacing: '-0.02em',
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              fontWeight: 400,
              px: { xs: 2, sm: 0 },
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Everything you need to know about Dino
          </Typography>
        </Box>

        {/* FAQ Accordions */}
        <Box sx={{ px: { xs: 1, sm: 0 }, maxWidth: 900, mx: 'auto' }}>
          {FAQS.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              elevation={0}
              sx={{
                mb: 2.5,
                border: '2px solid',
                borderColor: expanded === `panel${index}` ? 'primary.main' : 'divider',
                borderRadius: '16px !important',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                backgroundColor: 'background.paper',
                '&:before': {
                  display: 'none',
                },
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMore
                    sx={{
                      color: expanded === `panel${index}` ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.3s ease',
                      fontSize: { xs: 28, md: 32 },
                    }}
                  />
                }
                sx={{
                  py: { xs: 2, md: 2.5 },
                  px: { xs: 2.5, md: 3 },
                  '& .MuiAccordionSummary-content': {
                    my: { xs: 1, md: 1.5 },
                  },
                  minHeight: { xs: 64, md: 72 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.0625rem', sm: '1.125rem', md: '1.25rem' },
                    color: expanded === `panel${index}` ? 'primary.main' : 'text.primary',
                    transition: 'color 0.3s ease',
                    lineHeight: 1.4,
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: { xs: 2.5, md: 3 },
                  pb: { xs: 2.5, md: 3.5 },
                  pt: 0,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQSection;