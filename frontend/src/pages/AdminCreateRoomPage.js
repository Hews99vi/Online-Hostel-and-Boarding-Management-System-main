import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import RoomForm from "../components/RoomForm";
import { createRoom } from "../lib/roomApi";

const AdminCreateRoomPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    type: "Single",
    price: "",
    capacity: "",
    size: "",
    description: "",
    amenities: [],
    images: [""],
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createRoom(formData);
      toast.success("Room created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-display font-bold">Create New Room</h1>
          <p className="text-muted-foreground mt-2">
            Add a new room to your property
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
            submitLabel="Create Room"
            loading={loading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCreateRoomPage;
