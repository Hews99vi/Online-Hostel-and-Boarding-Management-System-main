import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import RoomForm from "../components/RoomForm";
import { getRoomById, updateRoom } from "../lib/roomApi";

const AdminEditRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        const room = await getRoomById(id);
        
        // Prepare initial values for RoomForm
        setInitialValues({
          name: room.name || "",
          type: room.type || "Single",
          price: room.price?.toString() || "",
          capacity: room.capacity?.toString() || "",
          size: room.size?.toString() || "",
          description: room.description || "",
          amenities: room.amenities || [],
          images: room.images || [room.image] || [""],
        });
      } catch (error) {
        toast.error(error.message || "Failed to load room");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await updateRoom(id, formData);
      toast.success("Room updated successfully!");
      navigate(`/rooms/${id}`);
    } catch (error) {
      toast.error(error.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-display font-bold">Edit Room</h1>
          <p className="text-muted-foreground mt-2">
            Update room information and settings
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-8 rounded-2xl border border-border"
        >
          <RoomForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Update Room"
            loading={loading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminEditRoomPage;
