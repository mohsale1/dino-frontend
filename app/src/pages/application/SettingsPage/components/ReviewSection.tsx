import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  StarOutlined,
  Star,
  RateReviewOutlined,
  CheckCircle,
} from '@mui/icons-material';
import { apiService } from '../../../../utils/api';
import { useUserData } from '../../../../contexts/application/UserData';

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

const STAR_COLOR = '#FACC15';
const MAX_COMMENT = 500;
const MIN_COMMENT = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewData {
  id: string | number;
  rating: number;
  comment: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
    <Box
      sx={{
        width: { xs: 34, sm: 38 },
        height: { xs: 34, sm: 38 },
        borderRadius: 2,
        bgcolor: BRAND.primaryBg,
        border: `1px solid ${BRAND.primaryBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: BRAND.primary,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// ReadOnlyStars
// ---------------------------------------------------------------------------

const ReadOnlyStars: React.FC<{ rating: number }> = ({ rating }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {[1, 2, 3, 4, 5].map((n) =>
      n <= rating ? (
        <Star key={n} sx={{ fontSize: 26, color: STAR_COLOR }} />
      ) : (
        <StarOutlined key={n} sx={{ fontSize: 26, color: '#d1d5db' }} />
      )
    )}
  </Box>
);

// ---------------------------------------------------------------------------
// StarRatingInput
// ---------------------------------------------------------------------------

const StarRatingInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({
  value,
  onChange,
}) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered > 0 ? hovered : value;

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Box
          key={n}
          component="span"
          role="button"
          tabIndex={0}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(n);
            }
          }}
          sx={{ cursor: 'pointer', lineHeight: 0, display: 'inline-flex' }}
        >
          {n <= active ? (
            <Star
              sx={{
                fontSize: 32,
                color: STAR_COLOR,
                transition: 'transform 0.1s',
                transform: hovered === n ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ) : (
            <StarOutlined sx={{ fontSize: 32, color: '#d1d5db', transition: 'color 0.15s' }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const ThankYouCard: React.FC<{ review: ReviewData }> = ({ review }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

    {/* Success banner */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(16,185,129,0.07)',
        border: '1px solid rgba(16,185,129,0.2)',
      }}
    >
      <CheckCircle sx={{ fontSize: 22, color: '#10b981', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#065f46', lineHeight: 1.3 }}>
          Review submitted
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.3 }}>
          Submitted on {formatDate(review.created_at)}
        </Typography>
      </Box>
    </Box>

    {/* Rating row */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: '#F7F9FA',
        border: '1px solid #e0e0e0',
      }}
    >
      <Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
          Your Rating
        </Typography>
        <ReadOnlyStars rating={review.rating} />
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1C1C1E', lineHeight: 1 }}>
          {review.rating}
          <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af' }}>
            /5
          </Typography>
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
          {RATING_LABELS[review.rating]}
        </Typography>
      </Box>
    </Box>

    {/* Comment */}
    <Box
      sx={{
        position: 'relative',
        px: 2.5,
        py: 2,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderLeft: `3px solid ${BRAND.primary}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: 1,
        }}
      >
        Your Feedback
      </Typography>
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#374151',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}
      >
        "{review.comment}"
      </Typography>
    </Box>

    {/* Footer note */}
    <Typography
      variant="caption"
      sx={{
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 1.5,
        pb: 0.5,
      }}
    >
      Reviews can only be submitted once and cannot be edited.
    </Typography>
  </Box>
);



// ---------------------------------------------------------------------------
// ReviewSkeleton
// ---------------------------------------------------------------------------

const ReviewSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Skeleton variant="rounded" height={20} width="60%" />
    <Skeleton variant="rounded" height={40} width="50%" />
    <Skeleton variant="rounded" height={120} />
    <Skeleton variant="rounded" height={44} />
  </Box>
);

// ---------------------------------------------------------------------------
// Field sx
// ---------------------------------------------------------------------------

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: BRAND.primaryBorder },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND.primary },
};

const ReviewSection: React.FC = () => {
  const { userData } = useUserData();
  const personaId = userData?.venue?.personaId ?? null;

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [existingReview, setExistingReview] = useState<ReviewData | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!personaId) {
      setLoadingFetch(false);
      return;
    }

    let cancelled = false;

    const fetchReviews = async () => {
      try {
        const res = await apiService.get('/application/reviews', {
          params: { persona_id: personaId, page: 1, page_size: 1 },
        });
        if (cancelled) return;
        const items = Array.isArray(res.data) ? res.data : [];
        if (items.length > 0) {
          setExistingReview(items[0] as ReviewData);
        }
      } catch {
        // Silently fail — treat as no review yet
      } finally {
        if (!cancelled) setLoadingFetch(false);
      }
    };

    fetchReviews();
    return () => { cancelled = true; };
  }, [personaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSubmitError('');

    if (!personaId) {
      setSubmitError('No active venue selected. Please select a venue first.');
      return;
    }
    if (rating === 0) {
      setValidationError('Please select a star rating before submitting.');
      return;
    }
    if (comment.trim().length < MIN_COMMENT) {
      setValidationError(`Your feedback must be at least ${MIN_COMMENT} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.post('/application/reviews', {
        persona_id: personaId,
        rating,
        comment: comment.trim(),
      });

      if (res.success && res.data) {
        const submitted = res.data as ReviewData;
        setExistingReview({
          ...submitted,
          created_at: submitted.created_at ?? new Date().toISOString(),
        });
      } else {
        setSubmitError(res.message ?? 'Failed to submit your review. Please try again.');
      }
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to submit your review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <SectionHeader
          icon={<RateReviewOutlined sx={{ fontSize: 20 }} />}
          title="Share Your Feedback"
          subtitle="Your review helps us improve"
        />

        {/* No persona selected */}
        {!personaId && !loadingFetch && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No active venue selected. Please select a venue to submit a review.
          </Alert>
        )}

        {loadingFetch && personaId && <ReviewSkeleton />}

        {!loadingFetch && personaId && existingReview && (
          <ThankYouCard review={existingReview} />
        )}

        {!loadingFetch && personaId && !existingReview && (
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {validationError && (
              <Alert severity="warning" onClose={() => setValidationError('')} sx={{ borderRadius: 2 }}>
                {validationError}
              </Alert>
            )}
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')} sx={{ borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                Your Rating
              </Typography>
              <StarRatingInput value={rating} onChange={setRating} />
              {rating > 0 && (
                <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </Typography>
              )}
            </Box>

            <Box>
              <TextField
                label="Your feedback"
                placeholder="Tell us about your experience..."
                multiline
                rows={4}
                fullWidth
                value={comment}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_COMMENT) setComment(e.target.value);
                }}
                inputProps={{ maxLength: MAX_COMMENT }}
                sx={fieldSx}
              />
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                  color: comment.length >= MAX_COMMENT ? '#ef4444' : '#9ca3af',
                }}
              >
                {comment.length} / {MAX_COMMENT}
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              startIcon={
                submitting
                  ? <CircularProgress size={16} color="inherit" />
                  : <RateReviewOutlined sx={{ fontSize: 18 }} />
              }
              sx={{
                py: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                bgcolor: BRAND.primary,
                boxShadow: 'none',
                '&:hover': { bgcolor: BRAND.primaryHover, boxShadow: 'none' },
                '&:disabled': { bgcolor: 'rgba(25,118,210,0.4)' },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>

            <Typography variant="caption" sx={{ color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
              Reviews can only be submitted once.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


export default ReviewSection;
