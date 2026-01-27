"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { blurIn, fastStaggerContainer } from "@/lib/animations";

interface ImageGridProps {
  imageUrls: string[];
  imagesAnalyzed: number;
}

export function ImageGrid({ imageUrls, imagesAnalyzed }: ImageGridProps) {
  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="grid grid-cols-3 gap-2"
        variants={fastStaggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
      >
        {imageUrls.slice(0, 9).map((url, index) => (
          <motion.div
            key={index}
            variants={blurIn}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
          >
            <Image
              src={url}
              alt={`Analyzed image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 150px"
            />
            {/* Scan line overlay effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[#8B5CF6]/20 to-transparent pointer-events-none"
              initial={{ y: "-100%" }}
              animate={{ y: "200%" }}
              transition={{
                duration: 1.5,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-gray-500 text-center"
      >
        Analyzed {imagesAnalyzed} image{imagesAnalyzed !== 1 ? "s" : ""}
      </motion.p>
    </div>
  );
}
