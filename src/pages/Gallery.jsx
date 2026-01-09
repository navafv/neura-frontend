import { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches data from the GalleryViewSet in your Django backend
    api.get('gallery/')
      .then(res => setImages(res.data))
      .catch(err => console.error("Gallery fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-black text-white mb-4">
              Neura <span className="text-cyan-400">Memories</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              A glimpse into the innovation, collaboration, and excitement at the IT Club.
            </p>
          </motion.div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {images.length > 0 ? images.map((img) => (
              <motion.div 
                key={img.id}
                variants={itemVariants}
                className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-800"
              >
                <img 
                  src={img.image} 
                  alt={img.title} 
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl">{img.title}</h3>
                  <p className="text-cyan-400 text-sm">{new Date(img.uploaded_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-20">
                <ImageIcon className="mx-auto text-slate-700 w-16 h-16 mb-4" />
                <p className="text-slate-500 italic">No photos have been uploaded to the gallery yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;