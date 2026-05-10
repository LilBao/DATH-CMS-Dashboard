import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, FileVideo, Loader2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fileService } from '@/services/fileService';

interface FileUploadProps {
  folderName: string;
  type?: 'image' | 'video';
  maxSizeMB?: number;
  initialPreviewUrl?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: any) => void;
  className?: string;
  aspect?: string; // e.g. 'square', 'video', 'none'
}

export default function FileUpload({
  folderName,
  type = 'image',
  maxSizeMB = 5,
  initialPreviewUrl,
  onUploadSuccess,
  onUploadError,
  className = '',
  aspect = 'video',
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(initialPreviewUrl || null);
  }, [initialPreviewUrl]);

  const accept = type === 'image' 
    ? 'image/jpeg, image/png, image/webp, image/svg+xml' 
    : 'video/mp4, video/webm, video/ogg';

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (isUploading) return;

    // Validation
    const isVideoFile = file.type.startsWith('video/');
    const isImageFile = file.type.startsWith('image/');

    if (type === 'image' && !isImageFile) {
      toast.error('Invalid format. Please upload an image field.', {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />
      });
      return;
    }
    
    if (type === 'video' && !isVideoFile) {
      toast.error('Invalid format. Please upload a video file.', {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />
      });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${maxSizeMB}MB.`, {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />
      });
      return;
    }

    // Set local preview for images instantly
    if (type === 'image') {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    } else {
      // Local preview for video
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }

    // Upload
    setIsUploading(true);
    let uploadedUrl = '';
    
    try {
      if (type === 'image') {
        uploadedUrl = await fileService.uploadFile(file, folderName);
      } else {
        uploadedUrl = await fileService.uploadVideo(file, folderName);
      }
      
      toast.success('Upload successfully!');
      setPreviewUrl(uploadedUrl); // Update with remote URL
      onUploadSuccess(uploadedUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred during file upload.');
      if (onUploadError) onUploadError(error);
      setPreviewUrl(initialPreviewUrl || null); // Revert to initial preview
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading) return;
    
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    onUploadSuccess(''); // Return empty string to indicate missing media
  };

  return (
    <div className={`${className}`}>
      <div 
        className={`relative w-full h-full rounded-2xl border-2 transition-all duration-300 ease-in-out cursor-pointer group overflow-hidden
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-dashed border-gray-300 bg-[#f4f6f8] hover:bg-blue-50/50 hover:border-blue-400'}
          ${previewUrl && type === 'image' ? (aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-[16/9]' : '') : 'py-10'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          ref={inputRef}
          disabled={isUploading}
        />

        {/* Upload Overlay while uploading */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-700 animate-pulse">Uploading file...</p>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && type === 'image' ? (
          <div className="relative w-full h-full">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-contain bg-black/5" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <p className="text-white text-sm font-bold flex items-center gap-2">
                <UploadCloud className="w-5 h-5" /> Change Image
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemove}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : previewUrl && type === 'video' ? (
          /* Video Preview */
          <div className="relative w-full flex flex-col items-center justify-center py-4">
            <div className="relative w-full max-w-[400px] mb-4 rounded-xl overflow-hidden shadow-sm bg-black aspect-video">
               <video src={previewUrl} controls className="w-full h-full" />
            </div>
            
            <div className="flex gap-4">
               <button 
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  disabled={isUploading}
               >
                 Change Video
               </button>
               <button 
                 onClick={handleRemove}
                 className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg text-sm hover:bg-red-200 transition-colors"
                 disabled={isUploading}
               >
                 Remove
               </button>
            </div>
          </div>
        ) : (
          /* Default Empty State */
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[140px]">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
              {type === 'image' ? (
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              ) : (
                <FileVideo className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              )}
            </div>
            <p className="text-[15px] font-bold text-gray-700 mb-1">
              <span className="text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs font-medium text-gray-500">
              {type === 'image' 
                ? 'SVG, PNG, JPG or WEBP (max. 5MB)' 
                : 'MP4, WEBM or OGG (max. 50MB)'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
