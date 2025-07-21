import { motion } from "framer-motion";

const SidebarSkeleton = () => {
  // pulse animation for skeleton blocks
  const pulse = {
    animate: { opacity: [0.6, 1, 0.6] },
    transition: { duration: 1.5, repeat: Infinity },
  };

  return (
    <motion.aside
      style={{ width: 288 }}
      className="bg-black text-white min-h-screen overflow-hidden px-2 py-4"
      {...pulse}
    >
      <div className="flex justify-between items-center">
        {/* Logo Skeleton */}
        <motion.div
          className="rounded-full bg-gray-700"
          style={{ width: 64, height: 64 }}
          {...pulse}
        />

        {/* Text Skeleton */}
        <motion.div
          className="bg-gray-700 rounded-md"
          style={{ width: 100, height: 32, marginLeft: 16 }}
          {...pulse}
        />

        {/* Icon Skeleton */}
        <motion.div
          className="bg-gray-700 rounded"
          style={{ width: 25, height: 25 }}
          {...pulse}
        />
      </div>
    </motion.aside>
  );
};

export default SidebarSkeleton;
