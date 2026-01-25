import Image from "next/image";

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
      <div className="grid grid-cols-3 gap-2">
        {imageUrls.slice(0, 9).map((url, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
          >
            <Image
              src={url}
              alt={`Analyzed image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 150px"
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Analyzed {imagesAnalyzed} image{imagesAnalyzed !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
