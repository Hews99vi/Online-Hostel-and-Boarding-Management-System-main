import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Users,
  Maximize,
  Wifi,
  Wind,
  Coffee,
  Tv,
  Bath,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Sparkles,
  Award,
  Shield,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Utensils,
  GlassWater,
  Droplets,
  Mountain,
  Laptop,
  Shirt,
  Phone,
  Bed,
  UtensilsCrossed,
  DoorOpen,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getRoomById } from "../lib/roomApi";
import {
  getRoomReviews,
  createReview,
  deleteReview,
  updateReview,
} from "../lib/reviewApi";
import { useAuthStore } from "../store/useAuthStore";
import BookingForm from "../components/BookingForm";

const amenityIcons = {
  WiFi: <Wifi className="w-5 h-5" />,
  "Air Conditioning": <Wind className="w-5 h-5" />,
  AC: <Wind className="w-5 h-5" />,
  Breakfast: <Utensils className="w-5 h-5" />,
  "Mini Bar": <GlassWater className="w-5 h-5" />,
  TV: <Tv className="w-5 h-5" />,
  Television: <Tv className="w-5 h-5" />,
  Balcony: <DoorOpen className="w-5 h-5" />,
  "Coffee Maker": <Coffee className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Jacuzzi: <Droplets className="w-5 h-5" />,
  Butler: <Users className="w-5 h-5" />,
  "Garden Access": <Mountain className="w-5 h-5" />,
  "Work Desk": <Laptop className="w-5 h-5" />,
  "Bathroom Amenities": <Bath className="w-5 h-5" />,
  "Hair Dryer": <Wind className="w-5 h-5" />,
  Towels: <Shirt className="w-5 h-5" />,
  Telephone: <Phone className="w-5 h-5" />,
  "Room Service": <UtensilsCrossed className="w-5 h-5" />,
  "King Bed": <Bed className="w-5 h-5" />,
  "Queen Bed": <Bed className="w-5 h-5" />,
};

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [reviewIdToDelete, setReviewIdToDelete] = useState(null);
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  useEffect(() => {
    const fetchRoomAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const [roomData, reviewsData] = await Promise.all([
          getRoomById(id),
          getRoomReviews(id),
        ]);

        setRoom(roomData);
        setReviews(reviewsData);

        if (authUser) {
          const alreadyReviewed = reviewsData.some(
            (review) => review.user && review.user._id === authUser._id,
          );
          setHasUserReviewed(alreadyReviewed);
        } else {
          setHasUserReviewed(false);
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndReviews();
  }, [id, authUser]);

  useEffect(() => {
    if (!authUser) {
      setHasUserReviewed(false);
    }
  }, [authUser]);
  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getReviewId = (review) => review._id || review.id;
  const getReviewerId = (reviewer) => reviewer?._id || reviewer?.id;

  const reviewPendingDeletion = reviewIdToDelete
    ? reviews.find((review) => getReviewId(review) === reviewIdToDelete)
    : null;

  const handleReviewSubmit = async () => {
    if (!authUser) {
      toast.error("Please login to add a review");
      navigate("/login");
      return;
    }

    if (hasUserReviewed) {
      toast.error("You have already reviewed this room");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const newReview = await createReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setReviews((prev) => [newReview, ...prev]);
      setReviewRating(0);
      setReviewComment("");
      setHasUserReviewed(true);
      toast.success("Review submitted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRequestDeleteReview = (reviewId) => {
    if (!authUser) {
      toast.error("Please login to manage your review");
      navigate("/login");
      return;
    }

    const targetReview = reviews.find(
      (review) => getReviewId(review) === reviewId,
    );

    const reviewerId = targetReview ? getReviewerId(targetReview.user) : null;
    const isOwnReview = reviewerId && reviewerId === authUser._id;
    const isAdmin = authUser.role === "admin";

    if (!targetReview) {
      toast.error("Review not found");
      return;
    }

    if (!isOwnReview && !isAdmin) {
      toast.error("You can only delete your own review");
      return;
    }

    setReviewIdToDelete(reviewId);
    setShowDeleteReviewConfirm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!authUser) {
      toast.error("Please login to manage your review");
      navigate("/login");
      return;
    }

    if (!reviewId) {
      setShowDeleteReviewConfirm(false);
      return;
    }

    const targetReview = reviews.find(
      (review) => getReviewId(review) === reviewId,
    );

    if (!targetReview) {
      toast.error("Review not found");
      setShowDeleteReviewConfirm(false);
      setReviewIdToDelete(null);
      return;
    }

    const reviewerId = getReviewerId(targetReview.user);
    const isOwnReview = reviewerId === authUser._id;
    const isAdmin = authUser.role === "admin";

    if (!isOwnReview && !isAdmin) {
      toast.error("You can only delete your own review");
      setShowDeleteReviewConfirm(false);
      setReviewIdToDelete(null);
      return;
    }

    try {
      setDeletingReviewId(reviewId);
      await deleteReview(reviewId);
      setReviews((prev) =>
        prev.filter((review) => getReviewId(review) !== reviewId),
      );

      if (isOwnReview) {
        setHasUserReviewed(false);
        setReviewRating(0);
        setReviewComment("");
      }

      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingReviewId(null);
      setShowDeleteReviewConfirm(false);
      setReviewIdToDelete(null);
    }
  };

  const handleCancelDeleteReview = () => {
    if (deletingReviewId) return;
    setShowDeleteReviewConfirm(false);
    setReviewIdToDelete(null);
  };

  const handleStartEditReview = (review) => {
    const reviewId = getReviewId(review);
    setEditingReviewId(reviewId);
    setEditRating(Number(review.rating) || 0);
    setEditComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
    setIsUpdatingReview(false);
  };

  const handleUpdateReview = async (reviewId) => {
    if (!authUser) {
      toast.error("Please login to manage your review");
      return;
    }

    if (editRating < 1 || editRating > 5) {
      toast.error("Please select a rating");
      return;
    }

    if (!editComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setIsUpdatingReview(true);
      const updated = await updateReview(reviewId, {
        rating: editRating,
        comment: editComment.trim(),
      });

      setReviews((prev) =>
        prev.map((review) =>
          getReviewId(review) === reviewId ? { ...review, ...updated } : review,
        ),
      );

      toast.success("Review updated");
      handleCancelEdit();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleBookingSuccess = (booking) => {
    toast.success("Redirecting to your bookings...");
    setTimeout(() => navigate("/my-bookings"), 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: room.name,
        text: room.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const nextImage = () => {
    const images =
      room.images && room.images.length > 0 ? room.images : [room.image];
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images =
      room.images && room.images.length > 0 ? room.images : [room.image];
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-24">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-12 h-12 text-gold" />
          </motion.div>
          <p className="text-muted-foreground mt-4">
            Loading your dream room...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {error || "Room Not Found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the room you're looking for.
          </p>
          <button
            onClick={() => navigate("/rooms")}
            className="px-6 py-3 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-all transform hover:scale-105"
          >
            Explore Other Rooms
          </button>
        </motion.div>
      </div>
    );
  }

  // Prepare images array
  const images =
    room.images && Array.isArray(room.images) && room.images.length > 0
      ? room.images
      : [room.image];

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number(
          (
            reviews.reduce(
              (sum, review) => sum + (Number(review.rating) || 0),
              0,
            ) / totalReviews
          ).toFixed(1),
        )
      : Number(room.rating || 0);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter(
      (review) => Number(review.rating) === star,
    ).length;
    const percent = totalReviews ? Math.round((count / totalReviews) * 100) : 0;

    return { star, count, percent };
  });

  const vibeTags = ["Cleanliness", "Comfort", "Service", "Value", "Location"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Images */}
      <div className="relative h-[70vh] bg-black">
        {/* Main Image */}
        <motion.div
          key={selectedImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={images[selectedImage]}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Top Actions Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/rooms")}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleShare}
              className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all"
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </motion.button>
          </div>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-end justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-gold text-foreground rounded-full text-sm font-semibold">
                    {room.type}
                  </span>
                  {room.available ? (
                    <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Unavailable
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
                  {room.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Star className="w-5 h-5 fill-gold text-gold" />
                    <span className="font-semibold">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm">Excellent</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Users className="w-5 h-5" />
                    <span>
                      {room.capacity} Guest{room.capacity > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Maximize className="w-5 h-5" />
                    <span>{room.size}m²</span>
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20"
              >
                <p className="text-white/70 text-sm mb-1">From</p>
                <p className="text-4xl font-bold text-gold">${room.price}</p>
                <p className="text-white/70 text-sm">per night</p>
              </motion.div>
            </motion.div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2 mt-6 overflow-x-auto pb-2"
              >
                {images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index
                        ? "ring-2 ring-gold scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {images.length > 5 && (
                  <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex-shrink-0 w-20 h-20 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                  >
                    <span className="text-sm font-semibold">
                      +{images.length - 5}
                    </span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-gold" />
                <h2 className="text-2xl font-bold">About This Room</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {room.description}
              </p>
            </motion.div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-gold" />
                  <h2 className="text-2xl font-bold">Premium Amenities</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-background rounded-xl hover:bg-gold/10 transition-all"
                    >
                      <div className="p-2 bg-gold/20 rounded-lg text-gold">
                        {amenityIcons[amenity] || <Wifi className="w-5 h-5" />}
                      </div>
                      <span className="font-medium">{amenity}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-gold" />
                <h2 className="text-2xl font-bold">Why Choose This Room</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Free Cancellation</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancel up to 24 hours before check-in
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Best Price Guarantee</h3>
                    <p className="text-sm text-muted-foreground">
                      We guarantee the best rates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team is always here to help
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant Confirmation</h3>
                    <p className="text-sm text-muted-foreground">
                      Get confirmed instantly after booking
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image Gallery Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gold/5 to-transparent p-8 rounded-2xl border border-gold/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Explore Every Detail
                  </h2>
                  <p className="text-muted-foreground">
                    Scroll through our stunning photo gallery
                  </p>
                </div>
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="px-4 py-2 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-all transform hover:scale-105 font-medium"
                >
                  View All
                </button>
              </div>

              {/* Horizontal Scrolling Gallery */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                  {images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="relative flex-shrink-0 w-80 h-64 rounded-xl overflow-hidden cursor-pointer snap-start group"
                      onClick={() => {
                        setSelectedImage(index);
                        setIsGalleryOpen(true);
                      }}
                    >
                      <img
                        src={img}
                        alt={`${room.name} - View ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white font-semibold">
                            View {index + 1} of {images.length}
                          </p>
                          <p className="text-white/80 text-sm">
                            Click to enlarge
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-gold rounded-full text-sm font-semibold">
                          Main View
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* View More Card */}
                  <div
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex-shrink-0 w-80 h-64 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-dashed border-gold/30 flex flex-col items-center justify-center cursor-pointer hover:border-gold/60 hover:bg-gold/10 transition-all group"
                  >
                    <Sparkles className="w-12 h-12 text-gold mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-lg font-bold mb-1">View All Photos</p>
                    <p className="text-muted-foreground">
                      {images.length} images total
                    </p>
                  </div>
                </div>

                {/* Scroll Indicators */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className="w-1.5 h-1.5 rounded-full bg-gold/30 hover:bg-gold cursor-pointer transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Quick Stats Below Gallery */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold mb-1">
                    {images.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold mb-1">
                    {room.size}m²
                  </div>
                  <div className="text-sm text-muted-foreground">Room Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold mb-1">
                    {room.capacity}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Guests
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Ratings & Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative overflow-hidden bg-card p-6 rounded-2xl border border-border shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-foreground/5 opacity-60 pointer-events-none" />
              <div className="absolute -right-20 -top-28 w-64 h-64 rounded-full bg-gold/15 blur-3xl opacity-40" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Star className="w-7 h-7 text-gold" />
                    <div>
                      <h2 className="text-2xl font-bold">Guest Reviews</h2>
                      <p className="text-muted-foreground text-sm">
                        Fresh perspectives from recent stays.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold">
                      Modernized
                    </span>
                    <span className="px-3 py-1 rounded-full bg-foreground/10 text-foreground text-xs font-semibold">
                      New look
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Average rating
                    </p>
                    <div className="flex items-end gap-3 mt-2">
                      <span className="text-4xl font-bold text-gold">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              className={`w-4 h-4 ${
                                value <= Math.round(averageRating)
                                  ? "fill-gold text-gold"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {totalReviews > 0
                            ? `From ${totalReviews} review${
                                totalReviews > 1 ? "s" : ""
                              }`
                            : "No reviews yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total reviews
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-bold">{totalReviews}</span>
                      <span className="text-sm text-muted-foreground">
                        voices
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every stay adds a new point of view.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Stay satisfaction
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="w-5 h-5 text-gold" />
                      <p className="text-sm text-foreground">
                        Verified guests highlight comfort and service.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Consistency is tracked to keep standards high.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-background/80 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-gold" />
                      <p className="text-sm font-semibold">Rating mix</p>
                    </div>
                    <div className="space-y-3">
                      {ratingBreakdown.map((item) => (
                        <div
                          key={item.star}
                          className="flex items-center gap-3"
                        >
                          <span className="w-8 text-sm font-semibold text-foreground">
                            {item.star}★
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="w-10 text-xs text-muted-foreground text-right">
                            {item.percent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/80 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-gold" />
                      <p className="text-sm font-semibold">Guest favorites</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {vibeTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold border border-gold/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Highlights guests mention most across their stays.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    Recent highlights
                  </p>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Be the first to leave a review for this room.
                    </p>
                  ) : (
                    reviews.map((review) => {
                      const reviewer = review.user || {};
                      const reviewerName = reviewer?.name || "Guest";
                      const reviewerAvatar = reviewer?.profilePicture;
                      const reviewId = getReviewId(review);
                      const reviewerId = getReviewerId(reviewer);
                      const canDeleteReview =
                        authUser &&
                        (reviewerId === authUser._id ||
                          authUser.role === "admin");
                      const canEditReview = canDeleteReview;
                      const isDeletingThis = deletingReviewId === reviewId;
                      const isEditingThis = editingReviewId === reviewId;

                      return (
                        <div
                          key={reviewId}
                          className="group relative p-4 rounded-xl border border-border bg-gradient-to-br from-background to-card/70 shadow-sm hover:shadow-xl transition-all"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold/60 via-amber-300/60 to-gold/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden ring-1 ring-gold/30">
                                {reviewerAvatar ? (
                                  <img
                                    src={reviewerAvatar}
                                    alt={reviewerName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-gold">
                                    {getInitials(reviewerName)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold leading-tight">
                                  {reviewerName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatReviewDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((value) => {
                                  const activeRating = isEditingThis
                                    ? editRating
                                    : review.rating;
                                  return (
                                    <Star
                                      key={value}
                                      className={`w-4 h-4 ${
                                        value <= activeRating
                                          ? "fill-gold text-gold"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              {canEditReview && !isEditingThis && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditReview(review)}
                                  className="flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1 transition-colors border text-foreground border-border hover:bg-foreground/5"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              {canDeleteReview && !isEditingThis && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRequestDeleteReview(reviewId)
                                  }
                                  disabled={isDeletingThis}
                                  className={`flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1 transition-colors border ${
                                    isDeletingThis
                                      ? "text-muted-foreground border-border cursor-not-allowed"
                                      : "text-red-500 border-red-100 hover:bg-red-50"
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {isDeletingThis ? "Removing" : "Delete"}
                                </button>
                              )}
                            </div>
                          </div>
                          {isEditingThis ? (
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setEditRating(value)}
                                    className="focus:outline-none"
                                    aria-label={`Edit rating ${value}`}
                                  >
                                    <Star
                                      className={`w-6 h-6 transition-all ${
                                        value <= editRating
                                          ? "fill-gold text-gold"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background/80 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                              />
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateReview(reviewId)}
                                  disabled={isUpdatingReview}
                                  className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1 transition-colors ${
                                    isUpdatingReview
                                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                                      : "bg-gold text-foreground hover:bg-gold/90"
                                  }`}
                                >
                                  {isUpdatingReview && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  )}
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 rounded-md text-sm font-semibold border border-border hover:bg-foreground/5"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-foreground leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-border" />

                <div className="rounded-2xl bg-gradient-to-r from-gold/10 via-background to-foreground/5 border border-border p-4 md:p-5 shadow-inner">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-6 h-6 text-gold" />
                        <h3 className="text-xl font-bold">Share Your Stay</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Rate this room and add a quick note for other guests.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold">
                      Takes under 1 minute
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className="focus:outline-none"
                        aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            value <= reviewRating
                              ? "fill-gold text-gold drop-shadow"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the vibe, comfort, or service..."
                    className="w-full min-h-[110px] rounded-xl border border-border bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <p className="text-sm text-muted-foreground">
                      Only logged-in guests can rate. One review per room per
                      user.{" "}
                      {hasUserReviewed && "You've already rated this room."}
                    </p>
                    <button
                      onClick={handleReviewSubmit}
                      disabled={isSubmittingReview || hasUserReviewed}
                      className={`px-5 py-2.5 rounded-lg font-semibold transition-all transform hover:translate-y-[-1px] flex items-center gap-2 shadow-lg ${
                        isSubmittingReview || hasUserReviewed
                          ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                          : "bg-gold text-foreground hover:bg-gold/90"
                      }`}
                    >
                      {isSubmittingReview && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {hasUserReviewed ? "Already submitted" : "Submit Review"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Form - Right Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              {room.available ? (
                <BookingForm
                  room={room}
                  onBookingSuccess={handleBookingSuccess}
                />
              ) : (
                <div className="bg-card rounded-2xl shadow-xl p-6 text-center border border-border">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Room Unavailable</h3>
                  <p className="text-muted-foreground mb-6">
                    This room is currently not available for booking
                  </p>
                  <button
                    onClick={() => navigate("/rooms")}
                    className="w-full py-3 bg-gold text-foreground rounded-lg font-semibold hover:bg-gold/90 transition-all transform hover:scale-105"
                  >
                    View Other Rooms
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteReviewConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCancelDeleteReview}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Delete Review
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {reviewPendingDeletion && (
                <div className="mb-4 p-3 rounded-lg bg-muted/60 border border-border text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">
                    {reviewPendingDeletion.user?.name || "Your review"}
                  </p>
                  <p>
                    {reviewPendingDeletion.comment || "No comment provided."}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDeleteReview}
                  disabled={deletingReviewId === reviewIdToDelete}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReview(reviewIdToDelete)}
                  disabled={deletingReviewId === reviewIdToDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 disabled:bg-red-300"
                >
                  {deletingReviewId === reviewIdToDelete
                    ? "Deleting..."
                    : "Yes, delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="h-full flex items-center justify-center p-4">
              <img
                src={images[selectedImage]}
                alt={room.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImage === index ? "bg-gold w-8" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomDetailsPage;
