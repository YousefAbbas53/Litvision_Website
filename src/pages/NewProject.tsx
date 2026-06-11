import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import libraryBg from "@/assets/library-bg.jpg";

const NewProject = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile: File) => {
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.endsWith('.txt')) {
      alert("Only PDF and TXT files are supported.");
      return;
    }
    
    if (uploadedFile.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    setFile(uploadedFile);
    setIsSuccess(true);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={libraryBg}
            alt="Library Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative z-10"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">
            New Project
          </h1>
          <p className="text-xl text-muted-foreground">
            Bring your story to the stage
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center p-12 md:p-20 rounded-[2rem] border-2 border-dashed transition-all duration-300 origin-center ${
              isDragging
                ? "border-accent bg-accent/10 scale-[1.02]"
                : isSuccess
                ? "border-green-500/50 bg-green-500/10"
                : "border-border bg-card/30 hover:bg-card/50 hover:border-accent/50"
            }`}
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center"
                >
                  <CheckCircle className="w-24 h-24 text-green-500 mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]" />
                  <p className="text-2xl font-bold text-foreground mb-2 break-all max-w-sm">
                    {file?.name}
                  </p>
                  <p className="text-muted-foreground">
                    Upload successful! Ready for processing.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => {
                        setIsSuccess(false);
                        setFile(null);
                    }}
                  >
                      Upload another file
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      y: isDragging ? -10 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <UploadCloud
                      className={`w-24 h-24 mb-6 transition-colors duration-300 ${
                        isDragging ? "text-accent drop-shadow-[0_0_20px_rgba(var(--accent),0.5)]" : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                  
                  <h3 className="text-[28px] font-serif font-bold text-foreground mb-6 text-center">
                    Drag and drop your book here
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-foreground/80 mb-10 font-medium">
                    <div className="flex items-center gap-1.5 bg-background shadow-sm px-4 py-1.5 rounded-full border border-border">
                      <FileText className="w-4 h-4 text-accent" /> PDF
                    </div>
                    <div className="flex items-center gap-1.5 bg-background shadow-sm px-4 py-1.5 rounded-full border border-border">
                      <FileText className="w-4 h-4 text-accent" /> TXT
                    </div>
                    <div className="bg-background px-4 py-1.5 shadow-sm rounded-full border border-border text-muted-foreground">
                      Max: 50MB
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.txt"
                      onChange={onFileInput}
                    />
                    <label htmlFor="file-upload">
                      <Button asChild size="lg" className="cursor-pointer px-10 py-6 text-lg rounded-full shadow-[0_0_15px_rgba(var(--accent),0.2)] hover:shadow-[0_0_25px_rgba(var(--accent),0.4)] transition-all">
                        <span>Select from your PC</span>
                      </Button>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NewProject;
