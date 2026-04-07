import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Trash2,
  Camera,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    about: "",
    profilePicture: "",
    createdAt: new Date().toISOString(),
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  // Fetch profile data on mount
  useEffect(() => {
    if (authUser) {
      setProfile({
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: authUser.address || "",
        about: authUser.about || "",
        profilePicture: authUser.profilePicture || "",
        createdAt: authUser.createdAt || new Date().toISOString(),
      });
      setEditedProfile({
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: authUser.address || "",
        about: authUser.about || "",
        profilePicture: authUser.profilePicture || "",
        createdAt: authUser.createdAt || new Date().toISOString(),
      });
    }
  }, [authUser]);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updateData = {
      name: editedProfile.name,
      phone: editedProfile.phone,
      address: editedProfile.address,
      about: editedProfile.about,
    };

    // Add profile picture if it's a new file (base64 or file data)
    if (
      editedProfile.profilePicture &&
      editedProfile.profilePicture !== profile.profilePicture
    ) {
      updateData.profilePicture = editedProfile.profilePicture;
    }

    setIsUpdatingProfile(true);
    try {
      await axiosInstance.put("/user/update-profile", updateData);
      toast.success("Profile updated successfully");
      setProfile(editedProfile);
      await checkAuth();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setIsDeletingAccount(true);
    try {
      await axiosInstance.delete("/user/delete-profile");
      toast.success("Account deleted successfully");
      await checkAuth();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedProfile({
        ...editedProfile,
        profilePicture: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const stats = [
    { label: "Total Bookings", value: "12" },
    { label: "Reviews Given", value: "8" },
    { label: "Avg Rating", value: "4.9" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <img
                    src={
                      editedProfile.profilePicture || "/defaultProfilePic.jpg"
                    }
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover shadow-lg"
                  />
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-gold text-primary p-2 rounded-full hover:bg-gold-dark transition-colors shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </div>

                <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                  {profile.name || authUser?.name}
                </h1>
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 mb-6">
                  <Calendar className="w-4 h-4" />
                  Member since {profile.createdAt?.slice(0, 10) || "N/A"}
                </p>
              </div>
            </motion.div>

            {/* Right Column - Profile Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Personal Information Card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 mt-6 bg-gold text-foreground text-sm px-3 py-2 rounded-md font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 justify-center group relative overflow-hidden"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        variant="gold"
                        size="sm"
                        className="flex items-center gap-2 bg-gold text-foreground text-sm px-3 py-2 rounded-md font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark disabled:opacity-70"
                        onClick={handleSave}
                        disabled={isUpdatingProfile}
                      >
                        <Save className="w-4 h-4" />
                        {isUpdatingProfile ? "Saving..." : "Save"}
                      </button>
                      <button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border border-border text-foreground text-sm px-3 py-2 rounded-md hover:bg-muted"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        className="mt-1.5 w-full pl-4 text-sm border rounded-xl h-10 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                        value={editedProfile.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1.5">
                        {profile.name || authUser?.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-foreground font-medium mt-1.5">
                      {authUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="mt-1.5 w-full pl-4 text-sm border rounded-xl h-10 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                        value={editedProfile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1.5">
                        {profile.phone || authUser?.phone || "N/A"}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        className="mt-1.5 w-full pl-4 text-sm border rounded-xl h-10 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                        value={editedProfile.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1.5">
                        {profile.address || authUser?.address || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* About Me Card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                  About Me
                </h2>
                {isEditing ? (
                  <textarea
                    rows={4}
                    className="resize-none w-full px-4 py-3 text-sm border rounded-xl bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                    value={editedProfile.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.about || authUser?.about || "N/A"}
                  </p>
                )}
              </div>

              {/* Danger Zone */}
              <div className="bg-card rounded-2xl border border-destructive/30 p-6">
                <h2 className="text-xl font-display font-semibold text-destructive mb-2">
                  Danger Zone
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || isDeleting}
                  className="flex items-center gap-2 text-sm text-white font-medium bg-red-500 hover:bg-red-400 disabled:bg-red-300 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingAccount || isDeleting
                    ? "Deleting..."
                    : "Delete Account"}
                </button>
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                      onClick={handleCancelDelete}
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
                            Delete Account
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            This action cannot be undone.
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        Are you sure you want to permanently delete your
                        account? All of your bookings and data will be removed.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={handleCancelDelete}
                          disabled={isDeleting}
                          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-70"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmDelete}
                          disabled={isDeleting}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 disabled:bg-red-300"
                        >
                          {isDeleting ? "Deleting..." : "Yes, delete"}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
